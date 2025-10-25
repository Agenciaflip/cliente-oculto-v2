// =====================================================
// Supabase Client para Edge Functions
// Client com service_role para operações privilegiadas
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Variáveis de ambiente injetadas automaticamente pelo Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client com service_role (bypass RLS, acesso total)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
