-- =====================================================
-- APLICAR TODAS AS MIGRATIONS NO SUPABASE
-- Execute este arquivo completo no SQL Editor do Supabase
-- URL: https://supabase.com/dashboard/project/hfvkrjehhihynqqdfhla/sql/new
-- =====================================================

-- =====================================================
-- MIGRATION 1: Initial Schema
-- Cria tabelas principais do sistema
-- =====================================================

-- Tabela: analysis_requests
-- Armazena cada análise de cliente oculto
CREATE TABLE IF NOT EXISTS analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Configuração da análise
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  objectives TEXT[] NOT NULL DEFAULT '{}',
  analysis_depth TEXT NOT NULL CHECK (analysis_depth IN ('quick', 'intermediate', 'deep')),
  evolution_instance TEXT NOT NULL CHECK (evolution_instance IN ('clienteoculto-homem', 'clienteoculto-mulher')),

  -- Estado da análise
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  next_ai_response_at TIMESTAMPTZ,

  -- Metadata (JSON flexível para informações dinâmicas)
  metadata JSONB DEFAULT '{}'::jsonb,
  /*
    Estrutura do metadata:
    {
      "next_ai_response_source": "webhook_planned" | "ai_planned",
      "next_follow_up_at": "2025-01-25T15:30:00Z",
      "follow_ups_sent": 0,
      "max_follow_ups": 3,
      "conversation_style": "casual" | "balanced" | "direct" | "detailed",
      "business_name": "Nome do negócio avaliado",
      "debug_logs": [
        {
          "timestamp": "2025-01-25T15:00:00Z",
          "level": "info" | "warning" | "error" | "success",
          "message": "Mensagem do log",
          "data": {}
        }
      ]
    }
  */

  -- Análise final (resultado após conversa completa)
  analysis_result JSONB,
  /*
    Estrutura do analysis_result:
    {
      "summary": "Resumo executivo da análise...",
      "sales_techniques": ["Técnica 1", "Técnica 2"],
      "positive_points": ["Ponto positivo 1", "Ponto positivo 2"],
      "improvement_areas": ["Área de melhoria 1", "Área de melhoria 2"],
      "objective_completion": {
        "Descobrir preço": true,
        "Entender produto": false
      },
      "scores": {
        "rapport": 8.5,
        "product_knowledge": 7.0,
        "objection_handling": 9.0,
        "closing": 6.5,
        "overall": 7.75
      }
    }
  */

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários das colunas (documentação no banco)
COMMENT ON TABLE analysis_requests IS 'Análises de cliente oculto - cada linha é uma conversa completa';
COMMENT ON COLUMN analysis_requests.customer_name IS 'Nome do perfil do cliente oculto (ex: João Silva)';
COMMENT ON COLUMN analysis_requests.customer_phone IS 'Telefone do vendedor (formato: 5511999999999)';
COMMENT ON COLUMN analysis_requests.objectives IS 'Lista de objetivos a alcançar na conversa';
COMMENT ON COLUMN analysis_requests.analysis_depth IS 'Profundidade da análise: quick (rápida), intermediate (média), deep (profunda)';
COMMENT ON COLUMN analysis_requests.evolution_instance IS 'Qual instância WhatsApp usar (perfil masculino ou feminino)';
COMMENT ON COLUMN analysis_requests.status IS 'Estado atual da análise';
COMMENT ON COLUMN analysis_requests.next_ai_response_at IS 'Quando a IA deve processar próxima resposta (janela de agrupamento)';
COMMENT ON COLUMN analysis_requests.metadata IS 'Dados dinâmicos (follow-ups, debug logs, config)';
COMMENT ON COLUMN analysis_requests.analysis_result IS 'Resultado final da análise após conversa completa';

-- =====================================================

-- Tabela: messages
-- Armazena todas as mensagens trocadas (usuário e IA)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analysis_requests(id) ON DELETE CASCADE,

  -- Conteúdo da mensagem
  role TEXT NOT NULL CHECK (role IN ('user', 'ai', 'system')),
  content TEXT NOT NULL,

  -- Controle de processamento
  processed BOOLEAN NOT NULL DEFAULT FALSE,

  -- Metadata WhatsApp
  whatsapp_message_id TEXT,
  chunk_index INTEGER,  -- Para mensagens quebradas em múltiplos chunks

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE messages IS 'Histórico completo de mensagens de cada análise';
COMMENT ON COLUMN messages.role IS 'Quem enviou: user (vendedor), ai (cliente oculto), system (avisos)';
COMMENT ON COLUMN messages.content IS 'Texto da mensagem';
COMMENT ON COLUMN messages.processed IS 'Se já foi processada pelo backend (evita duplicação)';
COMMENT ON COLUMN messages.whatsapp_message_id IS 'ID da mensagem no WhatsApp (rastreabilidade)';
COMMENT ON COLUMN messages.chunk_index IS 'Índice do chunk se mensagem foi quebrada (0, 1, 2...)';

-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analysis_requests_updated_at
  BEFORE UPDATE ON analysis_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column() IS 'Atualiza updated_at automaticamente ao modificar registro';

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

-- 🎉 MIGRATIONS APLICADAS COM SUCESSO!
-- Agora você pode:
-- 1. Criar análises via frontend (formulário)
-- 2. Ver análises em tempo real
-- 3. Conectar o backend para processar conversas
