-- =====================================================
-- MIGRATION 2: Indexes
-- Cria índices para otimizar performance
-- =====================================================

-- Índices para analysis_requests

-- Buscar por status (ex: todas as análises "in_progress")
CREATE INDEX IF NOT EXISTS idx_analysis_requests_status
  ON analysis_requests(status);

-- Buscar análises que precisam processar resposta
CREATE INDEX IF NOT EXISTS idx_analysis_requests_next_response
  ON analysis_requests(next_ai_response_at)
  WHERE next_ai_response_at IS NOT NULL;

-- Buscar por telefone (verificar se já existe análise para esse vendedor)
CREATE INDEX IF NOT EXISTS idx_analysis_requests_phone
  ON analysis_requests(customer_phone);

-- Buscar análises recentes (ordenar por created_at)
CREATE INDEX IF NOT EXISTS idx_analysis_requests_created
  ON analysis_requests(created_at DESC);

-- Buscar por instância (filtrar por perfil masculino/feminino)
CREATE INDEX IF NOT EXISTS idx_analysis_requests_instance
  ON analysis_requests(evolution_instance);

-- =====================================================

-- Índices para messages

-- Buscar mensagens de uma análise (mais comum!)
CREATE INDEX IF NOT EXISTS idx_messages_analysis_id
  ON messages(analysis_id, created_at DESC);

-- Buscar mensagens não processadas (backend precisa processar)
CREATE INDEX IF NOT EXISTS idx_messages_unprocessed
  ON messages(analysis_id, processed)
  WHERE processed = FALSE;

-- Buscar por role (ex: todas msgs do usuário)
CREATE INDEX IF NOT EXISTS idx_messages_role
  ON messages(analysis_id, role);

-- =====================================================

-- Comentários
COMMENT ON INDEX idx_analysis_requests_status IS 'Otimiza filtro por status (pending, in_progress, completed)';
COMMENT ON INDEX idx_analysis_requests_next_response IS 'Otimiza cron job que busca análises para processar';
COMMENT ON INDEX idx_analysis_requests_phone IS 'Otimiza busca de análises existentes para um vendedor';
COMMENT ON INDEX idx_analysis_requests_created IS 'Otimiza listagem ordenada por data';
COMMENT ON INDEX idx_messages_analysis_id IS 'Otimiza busca de mensagens de uma análise específica';
COMMENT ON INDEX idx_messages_unprocessed IS 'Otimiza busca de mensagens pendentes de processamento';
