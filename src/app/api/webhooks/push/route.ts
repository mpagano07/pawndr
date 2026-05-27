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
    
    let targetProfileId: string | null = null;
    let title = 'Nueva notificación';
    let body = 'Tienes una nueva notificación en Pawndr.';
    let url = '/';

    if (payload.table === 'messages' && payload.type === 'INSERT') {
      const message = payload.record;
      targetProfileId = message.receiver_id;
      title = 'Nuevo Mensaje';
      body = message.content;
      url = `/chat/${message.match_id}`;
    } else if (payload.table === 'matches' && payload.type === 'INSERT') {
       // Send match notification. Matches have user1_id and user2_id.
       // The webhook trigger should probably notify the user who didn't initiate it, or both.
       // For simplicity, we just take user2_id if it's the one who was matched with.
       const match = payload.record;
       targetProfileId = match.user2_id;
       title = '¡Nuevo Match!';
       body = 'Tienes un nuevo match con otra mascota.';
       url = '/matches';
    } else if (payload.table === 'adoption_requests' && payload.type === 'INSERT') {
       const request = payload.record;
       targetProfileId = request.owner_id;
       title = 'Nueva Solicitud de Adopción';
       body = 'Alguien está interesado en adoptar a tu mascota.';
       url = '/adopt';
    } else if (payload.table === 'services' && payload.type === 'INSERT') {
       // Example of notice/offer
       // You might want to notify specific users or skip, keeping it generic here.
       return NextResponse.json({ message: 'Event not mapped to push' });
    } else {
       // Return 200 for unhandled events to prevent webhook retries
       return NextResponse.json({ message: 'Event not handled for push' });
    }

    if (!targetProfileId) {
      return NextResponse.json({ error: 'No target profile found' }, { status: 400 });
    }

    // Fetch subscriptions for the target profile
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('profile_id', targetProfileId);

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found for user' });
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
          // Subscription expired or invalid, delete it
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
