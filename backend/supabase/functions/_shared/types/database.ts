// =====================================================
// Types do Banco de Dados
// Espelha a estrutura das tabelas PostgreSQL
// =====================================================

export type AnalysisStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
export type AnalysisDepth = 'quick' | 'intermediate' | 'deep'
export type EvolutionInstance = 'clienteoculto-homem' | 'clienteoculto-mulher'
export type MessageRole = 'user' | 'ai' | 'system'
export type ConversationStyle = 'casual' | 'balanced' | 'direct' | 'detailed'

export interface AnalysisRequest {
  id: string
  customer_name: string
  customer_phone: string
  objectives: string[]
  analysis_depth: AnalysisDepth
  evolution_instance: EvolutionInstance
  status: AnalysisStatus
  next_ai_response_at: string | null
  metadata: AnalysisMetadata
  analysis_result: AnalysisResult | null
  created_at: string
  updated_at: string
}

export interface AnalysisMetadata {
  next_ai_response_source?: 'webhook_planned' | 'ai_planned'
  next_follow_up_at?: string
  follow_ups_sent?: number
  max_follow_ups?: number
  conversation_style?: ConversationStyle
  business_name?: string
  debug_logs?: DebugLog[]
}

export interface DebugLog {
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  data?: Record<string, unknown>
}

export interface AnalysisResult {
  summary: string
  sales_techniques: string[]
  positive_points: string[]
  improvement_areas: string[]
  objective_completion: Record<string, boolean>
  scores: {
    rapport: number
    product_knowledge: number
    objection_handling: number
    closing: number
    overall: number
  }
}

export interface Message {
  id: string
  analysis_id: string
  role: MessageRole
  content: string
  processed: boolean
  whatsapp_message_id: string | null
  chunk_index: number | null
  created_at: string
}
