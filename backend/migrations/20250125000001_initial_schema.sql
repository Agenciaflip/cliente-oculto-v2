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
