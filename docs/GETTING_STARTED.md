# 🚀 Guia Rápido - Cliente Oculto v2.0

## 📖 Começando em 5 Minutos

Este guia vai te ajudar a configurar o projeto e começar a desenvolver rapidamente.

---

## 1️⃣ Clone o Projeto

```bash
git clone https://github.com/Agenciaflip/cliente-oculto-v2.git
cd cliente-oculto-v2
```

---

## 2️⃣ Configurar Frontend

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Criar arquivo de ambiente
cp .env.example .env.local

# Editar .env.local com suas credenciais:
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua_anon_key

# Rodar servidor de desenvolvimento
npm run dev

# ✅ Frontend rodando em http://localhost:5173
```

---

## 3️⃣ Configurar Backend

```bash
# Em outro terminal
cd backend

# Instalar Supabase CLI (se ainda não tiver)
brew install supabase/tap/supabase

# Login no Supabase
supabase login

# Vincular ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Aplicar migrations (criar tabelas)
supabase db push

# Configurar secrets no Supabase Dashboard
# Settings → Edge Functions → Secrets:
# - OPENAI_API_KEY
# - EVOLUTION_API_KEY
# - EVOLUTION_API_URL

# Deploy das functions
supabase functions deploy
```

---

## 4️⃣ Configurar Cron Job

No Supabase Dashboard → Database → Cron Jobs:

```sql
SELECT cron.schedule(
  'monitor-conversations',
  '*/30 * * * * *',  -- A cada 30 segundos
  $$
  SELECT net.http_post(
    url := 'https://SEU_PROJECT_REF.supabase.co/functions/v1/monitor-conversations',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
  );
  $$
);
```

---

## 5️⃣ Configurar Webhook Evolution API

No painel da Evolution API:

```
URL: https://SEU_PROJECT_REF.supabase.co/functions/v1/handle-webhook
Eventos: messages.upsert
Método: POST
```

---

## ✅ Testar o Sistema

### 1. Criar Análise
- Abra http://localhost:5173
- Clique em "Nova Análise"
- Preencha o formulário:
  - Nome: "João Silva"
  - Telefone: 5511999999999
  - Objetivos: "Descobrir preço do produto X"
  - Profundidade: Quick
  - Instância: Cliente Oculto Mulher

### 2. Verificar WhatsApp
- Vendedor deve receber mensagem inicial
- Responda no WhatsApp

### 3. Ver Logs
- No frontend, pressione `Ctrl+Shift+D`
- Veja logs em tempo real

### 4. Testar Agrupamento
- Envie 2 mensagens seguidas (< 5s intervalo)
- IA deve responder UMA VEZ após 10-15s

### 5. Testar Follow-up
- NÃO responda após mensagem da IA
- Após 1h30min, deve receber follow-up automático

---

## 🎯 Próximos Passos

Agora que o sistema está rodando:

1. **Leia a documentação:**
   - [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Entenda como funciona
   - [`TECH_STACK.md`](./TECH_STACK.md) - Tecnologias usadas
   - [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) - Estrutura de pastas
   - [`FRONTEND_BACKEND_SEPARATION.md`](./FRONTEND_BACKEND_SEPARATION.md) - Trabalho paralelo

2. **Escolha uma task do roadmap** (README.md)

3. **Comece a desenvolver!**

---

## 🐛 Problemas Comuns

### Frontend não conecta no Supabase
- ✅ Verifique se `.env.local` está configurado
- ✅ Confira se SUPABASE_URL e ANON_KEY estão corretos

### Backend não recebe webhooks
- ✅ Verifique URL do webhook na Evolution API
- ✅ Teste manualmente com curl
- ✅ Veja logs: `supabase functions logs handle-webhook`

### IA não responde
- ✅ Verifique se OPENAI_API_KEY está configurado
- ✅ Veja logs: `supabase functions logs monitor-conversations`
- ✅ Confira se cron job está ativo

### Mensagens não agrupam
- ✅ Abra Debug Logs (Ctrl+Shift+D)
- ✅ Procure por "🛑 JANELA ATIVA DETECTADA!"
- ✅ Se não aparecer, veja logs do backend

---

## 📞 Precisa de Ajuda?

- **Documentação:** [`/docs`](../docs/)
- **Issues:** [GitHub Issues](https://github.com/Agenciaflip/cliente-oculto-v2/issues)
- **Logs Backend:** `supabase functions logs --project-ref SEU_REF`
- **Logs Frontend:** Abra DevTools (F12) → Console

---

## 🎓 Dicas para Iniciantes

### Quero mudar a cor do botão
→ Vá para `frontend/src/components/ui/button.tsx`

### Quero mudar o tempo de follow-up
→ Vá para `backend/functions/_shared/config/depth-config.ts`

### Quero adicionar um novo campo
→ Crie migration em `backend/migrations/`

### Quero mudar o prompt da IA
→ Vá para `backend/functions/_shared/config/prompts.ts`

---

**Pronto! Você está configurado e pode começar a desenvolver! 🎉**
