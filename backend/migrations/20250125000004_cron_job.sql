-- =====================================================
-- MIGRATION 4: Cron Job
-- Configura execução automática do monitor a cada 30s
-- =====================================================

-- Habilitar extensão pg_cron (se não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar cron job para monitor-conversations
-- Executa a cada 30 segundos
SELECT cron.schedule(
  'monitor-conversations-cron',
  '*/30 * * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://hfvkrjehhihynqqdfhla.supabase.co/functions/v1/monitor-conversations',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmdmtyamVoaGloeW5xcWRmaGxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMxMTg3MCwiZXhwIjoyMDczODg3ODcwfQ.aXp7bVZJDuqQJxSVaMlqYmU03YTGeFq80MjAcQhBuok'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Verificar se foi criado
SELECT * FROM cron.job WHERE jobname = 'monitor-conversations-cron';

COMMENT ON EXTENSION pg_cron IS 'Executa tarefas agendadas no PostgreSQL';
