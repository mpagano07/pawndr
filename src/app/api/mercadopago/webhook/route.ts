import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'
import { createAdminClient } from '@/utils/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Mercado Pago access token not configured' }, { status: 500 })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
    })
    const payment = new Payment(client)
    const preapproval = new PreApproval(client)
    const body = await req.json()
    console.log('[MercadoPago Webhook] Event received', body)

    const supabase = createAdminClient()
    if (!supabase) {
      console.error('[MercadoPago Webhook] SUPABASE_SERVICE_ROLE_KEY not configured')
      return NextResponse.json({ error: 'Server not configured: SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 })
    }

    if (body.type === 'payment') {
      const paymentId = body.data?.id
      console.log('[MercadoPago Webhook] Payment event for payment id:', paymentId)
      if (paymentId) {
        const paymentResponse = await payment.get({
          id: paymentId
        })
        const preapprovalId = paymentResponse.preapproval_id || paymentResponse.subscription_id
        if (preapprovalId) {
          const updates: any = { mp_status: paymentResponse.status }
          // Si el pago fue aprobado, activar el servicio
          if (paymentResponse.status === 'approved') {
            updates.is_active = true
          }
          await supabase
            .from('services')
            .update(updates)
            .eq('mp_preapproval_id', preapprovalId)
        }
      }
    }

    if (body.type === 'preapproval') {
      const preapprovalId = body.data?.id
      console.log('[MercadoPago Webhook] Preapproval event for id:', preapprovalId)
      if (preapprovalId) {
        const preapprovalResponse = await preapproval.get({
          id: preapprovalId
        })
        const updates: any = { mp_status: preapprovalResponse.status }
        // Activar servicio si la preaprobación quedó autorizada/activa
        if (preapprovalResponse.status === 'authorized' || preapprovalResponse.status === 'active' || preapprovalResponse.status === 'approved') {
          updates.is_active = true
        } else if (preapprovalResponse.status === 'cancelled' || preapprovalResponse.status === 'paused') {
          updates.is_active = false
        }
        await supabase
          .from('services')
          .update(updates)
          .eq('mp_preapproval_id', preapprovalId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[MercadoPago Webhook Error]', error)
    return NextResponse.json({ error: error.message || 'Error en webhook de Mercado Pago' }, { status: 500 })
  }
}
