#!/bin/bash
# =====================================================
# Monitor Trigger - Chama a Edge Function a cada 30s
# =====================================================

FUNCTION_URL="https://hfvkrjehhihynqqdfhla.supabase.co/functions/v1/monitor-conversations"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmdmtyamVoaGloeW5xcWRmaGxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMxMTg3MCwiZXhwIjoyMDczODg3ODcwfQ.aXp7bVZJDuqQJxSVaMlqYmU03YTGeFq80MjAcQhBuok"

# Fazer requisição
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{}' \
  > /dev/null 2>&1

# Exit code 0 (sucesso)
exit 0
