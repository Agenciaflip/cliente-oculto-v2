-- =====================================================
-- MIGRATION 3: Realtime & Row Level Security
-- Habilita atualizações em tempo real e políticas de acesso
-- =====================================================

-- Habilitar Realtime para as tabelas
-- Isso permite que o frontend receba atualizações automáticas

ALTER PUBLICATION supabase_realtime ADD TABLE analysis_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

COMMENT ON PUBLICATION supabase_realtime IS 'Publica mudanças nas tabelas para WebSocket (frontend recebe em tempo real)';

-- =====================================================

-- Row Level Security (RLS)
-- Por enquanto: políticas ABERTAS (sem autenticação)
-- Quando adicionar auth: substituir por políticas baseadas em auth.uid()

ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver todas as análises (TEMPORÁRIO)
CREATE POLICY "allow_all_select_analysis_requests"
  ON analysis_requests
  FOR SELECT
  USING (true);

-- Política: Todos podem criar análises (TEMPORÁRIO)
CREATE POLICY "allow_all_insert_analysis_requests"
  ON analysis_requests
  FOR INSERT
  WITH CHECK (true);

-- Política: Todos podem atualizar análises (TEMPORÁRIO)
CREATE POLICY "allow_all_update_analysis_requests"
  ON analysis_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política: Apenas backend pode deletar análises
CREATE POLICY "allow_service_role_delete_analysis_requests"
  ON analysis_requests
  FOR DELETE
  USING (auth.role() = 'service_role');

-- =====================================================

-- Política: Todos podem ver mensagens (TEMPORÁRIO)
CREATE POLICY "allow_all_select_messages"
  ON messages
  FOR SELECT
  USING (true);

-- Política: Backend pode inserir mensagens
-- Frontend NÃO deve criar mensagens (apenas backend via webhook/cron)
CREATE POLICY "allow_service_role_insert_messages"
  ON messages
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'anon');

-- Política: Backend pode atualizar mensagens
CREATE POLICY "allow_service_role_update_messages"
  ON messages
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Política: Backend pode deletar mensagens
CREATE POLICY "allow_service_role_delete_messages"
  ON messages
  FOR DELETE
  USING (auth.role() = 'service_role');

-- =====================================================

-- Comentários
COMMENT ON POLICY "allow_all_select_analysis_requests" ON analysis_requests IS 'TEMPORÁRIO: Permite todos verem todas análises. Quando adicionar auth, mudar para: auth.uid() = user_id';
COMMENT ON POLICY "allow_all_insert_analysis_requests" ON analysis_requests IS 'TEMPORÁRIO: Permite criar análises sem autenticação. Quando adicionar auth, mudar para: auth.uid() = user_id';

-- =====================================================

-- 🔒 QUANDO ADICIONAR AUTENTICAÇÃO, SUBSTITUIR PELAS POLÍTICAS ABAIXO:

/*
-- Adicionar coluna user_id (descomentar quando tiver auth):
ALTER TABLE analysis_requests ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Políticas com autenticação:
DROP POLICY "allow_all_select_analysis_requests" ON analysis_requests;
DROP POLICY "allow_all_insert_analysis_requests" ON analysis_requests;
DROP POLICY "allow_all_update_analysis_requests" ON analysis_requests;

CREATE POLICY "users_see_own_analyses"
  ON analysis_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_create_own_analyses"
  ON analysis_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_analyses"
  ON analysis_requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
*/
