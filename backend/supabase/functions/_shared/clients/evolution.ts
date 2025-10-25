// =====================================================
// Evolution API Client
// Cliente para enviar/receber mensagens no WhatsApp
// =====================================================

import { EvolutionInstance } from '../types/database.ts'

const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL')!
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY')!

if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
  throw new Error('Missing Evolution API environment variables')
}

export interface SendMessageParams {
  instanceName: EvolutionInstance
  phone: string
  message: string
}

export interface SendMessageResponse {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Envia mensagem de texto via Evolution API
 */
export async function sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
  const { instanceName, phone, message } = params

  try {
    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${instanceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: phone,
          text: message,
          delay: 1200 // Delay de 1.2s para parecer mais humano
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Evolution API error:', error)
      return { success: false, error }
    }

    const data = await response.json()
    return {
      success: true,
      messageId: data.key?.id || data.messageId
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Envia typing indicator (simulação de digitação)
 */
export async function sendTyping(instanceName: EvolutionInstance, phone: string): Promise<void> {
  try {
    await fetch(
      `${EVOLUTION_API_URL}/chat/presence/${instanceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: phone,
          presence: 'composing', // ou 'available', 'recording', etc
          delay: 3000 // 3 segundos
        })
      }
    )
  } catch (error) {
    console.error('Failed to send typing indicator:', error)
  }
}

/**
 * Marca mensagem como lida
 */
export async function markAsRead(
  instanceName: EvolutionInstance,
  phone: string,
  messageId: string
): Promise<void> {
  try {
    await fetch(
      `${EVOLUTION_API_URL}/chat/markMessageAsRead/${instanceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          readMessages: [{
            remoteJid: phone,
            id: messageId
          }]
        })
      }
    )
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }
}
