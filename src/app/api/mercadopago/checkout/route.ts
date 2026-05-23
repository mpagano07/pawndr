import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Mercado Pago access token not configured' }, { status: 500 })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
    })
    const preapproval = new PreApproval(client)
    const body = await req.json()

    const authClient = createClient()
    const { data: { user } } = await authClient.auth.getUser()
    const payerEmail = user?.email || body?.payerEmail || 'test_user_123456@testuser.com'

    // Esperamos recibir todos los datos del servicio desde el cliente
    const name = body?.name
    const type = body?.type
    const description = body?.description
    const address = body?.address
    const googleMapsUrl = body?.google_maps_url
    const phone = body?.phone
    const photos = body?.photos || []

    if (!name || !type || !description) {
      return NextResponse.json({ error: 'Missing service data' }, { status: 400 })
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

    const tempServiceId = crypto.randomUUID()

    const response = await preapproval.create({
      body: {
        payer_email: payerEmail,
        reason: 'Suscripción mensual de servicio promocionado',
        external_reference: tempServiceId,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 20000,
          currency_id: 'ARS',
          // El free_trial directo a veces es ignorado por la API de preapproval,
          // la mejor forma de dar 1 mes gratis es configurando el start_date 30 días en el futuro.
          start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        back_url: `${origin}/services?checkout=success&ref=${tempServiceId}`
      }
    })

    console.log('[MercadoPago Checkout] Response:', response)
    
    // Manejo de respuesta - puede venir como response o directamente con init_point
    const preapprovalId = response?.id || response?.response?.id
    const initPoint = response?.init_point || response?.response?.init_point
    
    if (!preapprovalId || !initPoint) {
      console.error('[MercadoPago Checkout] Invalid response structure:', response)
      return NextResponse.json({ error: 'No se pudo generar el link de pago. Intenta más tarde.' }, { status: 500 })
    }

    // Devolvemos el tempServiceId y preapprovalId para que el frontend lo pueda guardar temporalmente
    return NextResponse.json({ url: initPoint, tempServiceId, preapprovalId })
  } catch (error: any) {
    console.error('[MercadoPago Checkout Error]', error)
    console.error('[MercadoPago Checkout] Error details:', {
      message: error.message,
      status: error.status,
      response: error.response,
    })
    return NextResponse.json({ 
      error: error.message || 'Error en Mercado Pago Checkout',
      details: error.response?.data?.message || undefined
    }, { status: 500 })
  }
}
