import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente não configuradas!\n' +
    'Crie o arquivo .env.local com:\n' +
    'VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=sua_anon_key'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Sem autenticação por enquanto
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Otimizado para 500+ clientes simultâneos
    },
  },
})

// Helper para tratar erros de forma consistente
export function handleSupabaseError(error: any) {
  console.error('Supabase Error:', error)
  return {
    message: error.message || 'Erro desconhecido',
    code: error.code,
    details: error.details,
  }
}
