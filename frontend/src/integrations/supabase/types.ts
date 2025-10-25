export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Tipos das tabelas do banco
export interface Database {
  public: {
    Tables: {
      analysis_requests: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          objectives: string[]
          analysis_depth: 'quick' | 'intermediate' | 'deep'
          evolution_instance: 'clienteoculto-homem' | 'clienteoculto-mulher'
          status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          next_ai_response_at: string | null
          metadata: Json
          analysis_result: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          objectives: string[]
          analysis_depth: 'quick' | 'intermediate' | 'deep'
          evolution_instance: 'clienteoculto-homem' | 'clienteoculto-mulher'
          status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          next_ai_response_at?: string | null
          metadata?: Json
          analysis_result?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string
          objectives?: string[]
          analysis_depth?: 'quick' | 'intermediate' | 'deep'
          evolution_instance?: 'clienteoculto-homem' | 'clienteoculto-mulher'
          status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          next_ai_response_at?: string | null
          metadata?: Json
          analysis_result?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          analysis_id: string
          role: 'user' | 'ai' | 'system'
          content: string
          processed: boolean
          whatsapp_message_id: string | null
          chunk_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          analysis_id: string
          role: 'user' | 'ai' | 'system'
          content: string
          processed?: boolean
          whatsapp_message_id?: string | null
          chunk_index?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string
          role?: 'user' | 'ai' | 'system'
          content?: string
          processed?: boolean
          whatsapp_message_id?: string | null
          chunk_index?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos auxiliares para facilitar uso
export type AnalysisRequest = Database['public']['Tables']['analysis_requests']['Row']
export type AnalysisRequestInsert = Database['public']['Tables']['analysis_requests']['Insert']
export type AnalysisRequestUpdate = Database['public']['Tables']['analysis_requests']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

// Tipos do metadata (estrutura conhecida)
export interface AnalysisMetadata {
  next_ai_response_source?: 'webhook_planned' | 'ai_planned'
  next_follow_up_at?: string
  follow_ups_sent?: number
  max_follow_ups?: number
  conversation_style?: 'casual' | 'balanced' | 'direct' | 'detailed'
  debug_logs?: DebugLog[]
}

export interface DebugLog {
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  data?: any
}

// Tipos do analysis_result (estrutura conhecida)
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
