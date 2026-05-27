import { createClient } from '@supabase/supabase-js';
import webPush from 'web-push';
import { NextResponse } from 'next/server';

// Initialize web-push
webPush.setVapidDetails(
  'mailto:support@pawndr.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

// We use the service role key to bypass RLS and read all push subscriptions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    let targetProfileIds: string[] = [];
    let title = 'Nueva notificación';
    let body = 'Tienes una nueva notificación en Pawndr.';
    let url = '/';

    if (payload.table === 'messages' && payload.type === 'INSERT') {
      const message = payload.record;
      const { data: match } = await supabaseAdmin.from('matches').select('pet1_id, pet2_id').eq('id', message.match_id).single();
      if (match) {
        const { data: pets } = await supabaseAdmin.from('pets').select('owner_id').in('id', [match.pet1_id, match.pet2_id]);
        if (pets) {
          const receiver = pets.find(p => p.owner_id !== message.sender_id);
          if (receiver) targetProfileIds.push(receiver.owner_id);
        }
      }
      title = 'Nuevo Mensaje';
      body = message.content;
      url = `/chat/${message.match_id}`;
    } 
    else if (payload.table === 'matches' && payload.type === 'INSERT') {
       const match = payload.record;
       const { data: pets } = await supabaseAdmin.from('pets').select('owner_id').in('id', [match.pet1_id, match.pet2_id]);
       if (pets) {
         targetProfileIds = pets.map(p => p.owner_id);
       }
       title = '¡Nuevo Match!';
       body = '¡Una de tus mascotas tiene un nuevo match!';
       url = '/matches';
    } 
    else if (payload.table === 'swipes' && payload.type === 'INSERT') {
       const swipe = payload.record;
       if (swipe.action === 'like') {
         const { data: pet } = await supabaseAdmin.from('pets').select('owner_id').eq('id', swipe.swiped_pet_id).single();
         if (pet) targetProfileIds.push(pet.owner_id);
         title = 'Nuevo Like';
         body = 'A alguien le gusta tu mascota.';
         url = '/matches'; // Usually you go to matches to see likes
       } else {
         return NextResponse.json({ message: 'Ignore dislikes' });
       }
    }
    else if (payload.table === 'adoption_requests' && payload.type === 'INSERT') {
       const request = payload.record;
       targetProfileIds.push(request.owner_id);
       title = 'Solicitud de Adopción';
       body = 'Alguien quiere adoptar a tu mascota.';
       url = '/adopt';
    }
    else if (payload.table === 'lost_found_responses' && payload.type === 'INSERT') {
       const response = payload.record;
       targetProfileIds.push(response.reporter_id);
       title = 'Respuesta sobre mascota';
       body = 'Alguien ha respondido a tu publicación de mascota perdida/encontrada.';
       url = '/lost-found';
    }
    else {
       return NextResponse.json({ message: 'Event not handled for push' });
    }

    if (targetProfileIds.length === 0) {
      return NextResponse.json({ error: 'No target profiles found' }, { status: 400 });
    }

    // Fetch subscriptions for all target profiles
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .in('profile_id', targetProfileIds);

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found for users' });
    }

    const pushPayload = JSON.stringify({
      title,
      body,
      data: { url }
    });

    const notifications = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      return webPush.sendNotification(pushSubscription, pushPayload).catch((err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          return supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .match({ endpoint: sub.endpoint });
        }
        console.error('Error sending push:', err);
      });
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
