# 🚀 Instruções de Deploy - Edge Functions

## Método 1: Deploy via Dashboard (Recomendado)

Abri a página de Functions no Supabase: https://supabase.com/dashboard/project/hfvkrjehhihynqqdfhla/functions

### 1️⃣ Deploy handle-webhook

1. Clique em **"Deploy a new function"**
2. Nome da função: `handle-webhook`
3. Upload do código:
   - **Opção A**: Conectar GitHub
     - Repository: `Agenciaflip/cliente-oculto-v2`
     - Branch: `main`
     - Root directory: `backend/supabase/functions/handle-webhook`

   - **Opção B**: Upload manual
     - Cole o conteúdo de: `backend/supabase/functions/handle-webhook/index.ts`

4. Configurações:
   - **Verify JWT**: ❌ DESABILITADO (para receber webhooks externos)
   - **Import map**: Deixe padrão

5. Clique em **"Deploy function"**

### 2️⃣ Deploy monitor-conversations

1. Clique em **"Deploy a new function"**
2. Nome da função: `monitor-conversations`
3. Upload do código:
   - **Opção A**: Conectar GitHub (mesmo repository)
     - Root directory: `backend/supabase/functions/monitor-conversations`

   - **Opção B**: Upload manual
     - Cole o conteúdo de: `backend/supabase/functions/monitor-conversations/index.ts`

4. Configurações:
   - **Verify JWT**: ✅ HABILITADO (função interna, protegida)
   - **Import map**: Deixe padrão

5. Clique em **"Deploy function"**

---

## Método 2: Deploy via CLI

Caso prefira usar CLI, você precisa fazer login primeiro:

```bash
# Pegar access token em: https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="seu_token_aqui"

# Deploy handle-webhook
cd /Users/felipezanonimini/Desktop/cliente-oculto-v2/backend
supabase functions deploy handle-webhook --project-ref hfvkrjehhihynqqdfhla --no-verify-jwt

# Deploy monitor-conversations
supabase functions deploy monitor-conversations --project-ref hfvkrjehhihynqqdfhla
```

---

## 3️⃣ Configurar Cron Job (monitor-conversations)

Após deploy, configure o cron:

1. Vá em: https://supabase.com/dashboard/project/hfvkrjehhihynqqdfhla/database/cron-jobs
2. Clique em **"Create a new cron job"**
3. Configurações:
   - **Name**: `monitor-conversations-cron`
   - **Schedule**: `*/30 * * * * *` (a cada 30 segundos)
   - **Command**:
     ```sql
     SELECT
       net.http_post(
         url := 'https://hfvkrjehhihynqqdfhla.supabase.co/functions/v1/monitor-conversations',
         headers := jsonb_build_object(
           'Content-Type', 'application/json',
           'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
         ),
         body := '{}'::jsonb
       ) AS request_id;
     ```
4. Clique em **"Create cron job"**

---

## 4️⃣ URLs das Functions (após deploy)

- **handle-webhook**: `https://hfvkrjehhihynqqdfhla.supabase.co/functions/v1/handle-webhook`
- **monitor-conversations**: `https://hfvkrjehhihynqqdfhla.supabase.co/functions/v1/monitor-conversations`

---

## 5️⃣ Configurar Webhook na Evolution API

Depois do deploy, configure o webhook:

```bash
curl -X POST \
  https://evolution-nova-versao-evolution-api.78s68s.easypanel.host/webhook/set/clienteoculto-mulher \
  -H 'apikey: F5910E4D802E-46A3-B0F5-4235BCD5F277' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://hfvkrjehhihynqqdfhla.supabase.co/functions/v1/handle-webhook",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "messages.upsert"
    ]
  }'
```

Repetir para `clienteoculto-homem`.

---

## ✅ Testar

Após tudo configurado:

1. Crie uma análise no frontend
2. Aguarde 30s (cron job)
3. IA deve enviar primeira mensagem
4. Responda pelo WhatsApp
5. IA deve responder em ~12s

---

## 🔍 Ver Logs

- **Logs das functions**: https://supabase.com/dashboard/project/hfvkrjehhihynqqdfhla/functions
- **Logs do cron**: Mesma página, aba "Logs"
