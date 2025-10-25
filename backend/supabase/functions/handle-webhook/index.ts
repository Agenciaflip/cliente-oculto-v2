// =====================================================
// Handle Webhook - Edge Function
// Recebe mensagens do WhatsApp (Evolution API) e salva no banco
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_shared/clients/supabase.ts'
import { addSeconds, toISOString } from '../_shared/utils/date.ts'

interface WebhookPayload {
  event: string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
    message?: {
      conversation?: string
      extendedTextMessage?: {
        text?: string
      }
    }
    messageType: string
    pushName?: string
  }
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse webhook payload
    const payload: WebhookPayload = await req.json()

    console.log('📩 Webhook received:', {
      event: payload.event,
      instance: payload.instance,
      from: payload.data.key.remoteJid,
      fromMe: payload.data.key.fromMe
    })

    // Ignorar mensagens que não são do tipo texto
    if (!['conversation', 'messages.upsert'].includes(payload.event)) {
      console.log('⏭️ Ignoring non-message event:', payload.event)
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Ignorar mensagens enviadas por nós mesmos
    if (payload.data.key.fromMe) {
      console.log('⏭️ Ignoring message from self')
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Extrair telefone e mensagem
    const phone = payload.data.key.remoteJid.split('@')[0]
    const messageText = payload.data.message?.conversation ||
                        payload.data.message?.extendedTextMessage?.text ||
                        ''

    if (!messageText) {
      console.log('⏭️ Ignoring empty message')
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`💬 Message from ${phone}: "${messageText}"`)

    // Buscar análise ativa para este telefone
    const { data: analysis, error: findError } = await supabase
      .from('analysis_requests')
      .select('*')
      .eq('customer_phone', phone)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (findError || !analysis) {
      console.log('⚠️ No active analysis found for phone:', phone)
      return new Response(JSON.stringify({
        received: true,
        message: 'No active analysis for this phone'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Found analysis:', analysis.id)

    // Salvar mensagem do usuário
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        analysis_id: analysis.id,
        role: 'user',
        content: messageText,
        processed: false,
        whatsapp_message_id: payload.data.key.id
      })

    if (insertError) {
      console.error('❌ Error saving message:', insertError)
      throw insertError
    }

    // Agendar processamento da IA após 10-15 segundos (janela de agrupamento)
    // Isso permite que o vendedor envie várias mensagens seguidas
    const now = new Date()
    const nextResponseAt = addSeconds(now, 12) // 12 segundos

    // Atualizar análise
    const { error: updateError } = await supabase
      .from('analysis_requests')
      .update({
        status: 'in_progress',
        next_ai_response_at: toISOString(nextResponseAt),
        metadata: {
          ...analysis.metadata,
          next_ai_response_source: 'webhook_planned'
        }
      })
      .eq('id', analysis.id)

    if (updateError) {
      console.error('❌ Error updating analysis:', updateError)
      throw updateError
    }

    console.log(`✅ Message saved and processing scheduled for ${nextResponseAt.toISOString()}`)

    return new Response(
      JSON.stringify({
        success: true,
        analysisId: analysis.id,
        nextProcessingAt: nextResponseAt.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error handling webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
