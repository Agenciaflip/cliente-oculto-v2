// =====================================================
// Monitor Conversations - Edge Function (CRON)
// Processa conversas e envia respostas da IA
// Executa a cada 30 segundos
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_shared/clients/supabase.ts'
import { sendMessage, sendTyping } from '../_shared/clients/evolution.ts'
import { generateAIResponse, generateFinalAnalysis } from '../_shared/clients/openai.ts'
import { isPast, addMinutes, toISOString } from '../_shared/utils/date.ts'
import type { AnalysisRequest, Message } from '../_shared/types/database.ts'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Monitor started...')

    // Buscar análises que precisam processar resposta
    const now = new Date().toISOString()
    const { data: analyses, error: fetchError } = await supabase
      .from('analysis_requests')
      .select('*')
      .eq('status', 'in_progress')
      .lte('next_ai_response_at', now)
      .order('next_ai_response_at', { ascending: true })
      .limit(10) // Processar até 10 por vez

    if (fetchError) {
      throw fetchError
    }

    if (!analyses || analyses.length === 0) {
      console.log('✅ No analyses to process')
      return new Response(
        JSON.stringify({ processed: 0, message: 'No analyses pending' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📊 Found ${analyses.length} analyses to process`)

    const results = []

    for (const analysis of analyses) {
      try {
        console.log(`\n🎯 Processing analysis: ${analysis.id}`)
        const result = await processAnalysis(analysis as AnalysisRequest)
        results.push(result)
      } catch (error) {
        console.error(`❌ Error processing analysis ${analysis.id}:`, error)
        results.push({ analysisId: analysis.id, success: false, error: error.message })
      }
    }

    console.log('\n✅ Monitor completed')

    return new Response(
      JSON.stringify({
        processed: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Monitor error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * Processa uma análise individual
 */
async function processAnalysis(analysis: AnalysisRequest): Promise<any> {
  // Buscar todas as mensagens não processadas
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('analysis_id', analysis.id)
    .eq('processed', false)
    .order('created_at', { ascending: true })

  if (messagesError) {
    throw messagesError
  }

  // Se não tem mensagens novas, é um follow-up ou primeira mensagem
  if (!messages || messages.length === 0) {
    return await handleNoNewMessages(analysis)
  }

  // Agrupar mensagens do usuário (vendedor)
  const userMessages = messages.filter((m: Message) => m.role === 'user')

  if (userMessages.length === 0) {
    console.log('⚠️ No user messages to process')
    return { analysisId: analysis.id, action: 'skipped', reason: 'no_user_messages' }
  }

  console.log(`💬 Processing ${userMessages.length} new user messages`)

  // Buscar histórico completo da conversa
  const { data: allMessages, error: historyError } = await supabase
    .from('messages')
    .select('*')
    .eq('analysis_id', analysis.id)
    .order('created_at', { ascending: true })

  if (historyError) {
    throw historyError
  }

  // Converter para formato Claude
  const conversationHistory = (allMessages as Message[])
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content
    }))

  // Adicionar mensagens novas ao histórico
  for (const msg of userMessages) {
    conversationHistory.push({
      role: 'user',
      content: msg.content
    })
  }

  // Gerar resposta da IA
  console.log('🤖 Generating AI response...')
  const aiResult = await generateAIResponse({
    analysis,
    messages: allMessages as Message[],
    conversationHistory
  })

  console.log(`💭 AI Response: "${aiResult.message}"`)
  console.log(`📊 Should continue: ${aiResult.shouldContinue}`)

  // Enviar typing indicator
  await sendTyping(analysis.evolution_instance, analysis.customer_phone)

  // Aguardar 2-5 segundos (simular digitação)
  const typingDelay = Math.floor(Math.random() * 3000) + 2000
  await new Promise(resolve => setTimeout(resolve, typingDelay))

  // Enviar mensagem via WhatsApp
  const sendResult = await sendMessage({
    instanceName: analysis.evolution_instance,
    phone: analysis.customer_phone,
    message: aiResult.message
  })

  if (!sendResult.success) {
    throw new Error(`Failed to send message: ${sendResult.error}`)
  }

  console.log('✅ Message sent successfully')

  // Salvar resposta da IA no banco
  const { error: saveError } = await supabase
    .from('messages')
    .insert({
      analysis_id: analysis.id,
      role: 'ai',
      content: aiResult.message,
      processed: true,
      whatsapp_message_id: sendResult.messageId
    })

  if (saveError) {
    throw saveError
  }

  // Marcar mensagens do usuário como processadas
  const { error: updateMessagesError } = await supabase
    .from('messages')
    .update({ processed: true })
    .in('id', userMessages.map((m: Message) => m.id))

  if (updateMessagesError) {
    throw updateMessagesError
  }

  // Decidir próximo passo
  if (!aiResult.shouldContinue) {
    // Conversa encerrada - gerar análise final
    console.log('🏁 Conversation ended, generating final analysis...')
    await finalizeAnalysis(analysis, allMessages as Message[])
    return { analysisId: analysis.id, action: 'completed' }
  }

  // Continuar conversa - limpar next_ai_response_at e configurar follow-up
  const metadata = {
    ...analysis.metadata,
    follow_ups_sent: 0,
    max_follow_ups: 3,
    next_follow_up_at: addMinutes(new Date(), 30).toISOString() // 30min para follow-up
  }

  const { error: updateError } = await supabase
    .from('analysis_requests')
    .update({
      next_ai_response_at: null, // Limpa, aguarda resposta do vendedor
      metadata
    })
    .eq('id', analysis.id)

  if (updateError) {
    throw updateError
  }

  console.log('✅ Analysis updated, waiting for user response')

  return { analysisId: analysis.id, action: 'sent_message', waiting_for_response: true }
}

/**
 * Trata caso onde não há mensagens novas (follow-up)
 */
async function handleNoNewMessages(analysis: AnalysisRequest): Promise<any> {
  const metadata = analysis.metadata || {}
  const followUpsSent = metadata.follow_ups_sent || 0
  const maxFollowUps = metadata.max_follow_ups || 3
  const nextFollowUpAt = metadata.next_follow_up_at

  // Se ainda não é hora do follow-up
  if (nextFollowUpAt && !isPast(nextFollowUpAt)) {
    console.log('⏳ Not time for follow-up yet')
    return { analysisId: analysis.id, action: 'skipped', reason: 'not_time_yet' }
  }

  // Se atingiu limite de follow-ups, encerrar
  if (followUpsSent >= maxFollowUps) {
    console.log('🛑 Max follow-ups reached, ending conversation')
    await finalizeAnalysis(analysis, [])
    return { analysisId: analysis.id, action: 'completed', reason: 'max_follow_ups' }
  }

  // Enviar follow-up
  console.log(`📞 Sending follow-up ${followUpsSent + 1}/${maxFollowUps}`)

  const followUpMessages = [
    'Opa, ainda tá por aí? 😊',
    'E aí, conseguiu ver minha última mensagem?',
    'Tudo bem? Consegue me ajudar com isso?'
  ]

  const followUpMessage = followUpMessages[followUpsSent] || followUpMessages[0]

  // Enviar mensagem
  const sendResult = await sendMessage({
    instanceName: analysis.evolution_instance,
    phone: analysis.customer_phone,
    message: followUpMessage
  })

  if (!sendResult.success) {
    throw new Error(`Failed to send follow-up: ${sendResult.error}`)
  }

  // Salvar mensagem
  await supabase
    .from('messages')
    .insert({
      analysis_id: analysis.id,
      role: 'ai',
      content: followUpMessage,
      processed: true,
      whatsapp_message_id: sendResult.messageId
    })

  // Atualizar metadata
  const updatedMetadata = {
    ...metadata,
    follow_ups_sent: followUpsSent + 1,
    next_follow_up_at: addMinutes(new Date(), 30).toISOString()
  }

  await supabase
    .from('analysis_requests')
    .update({
      next_ai_response_at: null,
      metadata: updatedMetadata
    })
    .eq('id', analysis.id)

  console.log('✅ Follow-up sent')

  return { analysisId: analysis.id, action: 'sent_follow_up', followUpNumber: followUpsSent + 1 }
}

/**
 * Finaliza análise e gera relatório
 */
async function finalizeAnalysis(analysis: AnalysisRequest, messages: Message[]): Promise<void> {
  console.log('📝 Generating final analysis report...')

  try {
    const analysisResult = await generateFinalAnalysis(analysis, messages)

    await supabase
      .from('analysis_requests')
      .update({
        status: 'completed',
        analysis_result: analysisResult,
        next_ai_response_at: null
      })
      .eq('id', analysis.id)

    console.log('✅ Analysis completed and saved')
  } catch (error) {
    console.error('❌ Error generating final analysis:', error)

    // Marcar como failed se der erro
    await supabase
      .from('analysis_requests')
      .update({
        status: 'failed',
        next_ai_response_at: null,
        metadata: {
          ...analysis.metadata,
          error: error.message
        }
      })
      .eq('id', analysis.id)

    throw error
  }
}
