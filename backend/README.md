# ⚙️ Backend - Cliente Oculto v2.0

> Lógica do servidor e integrações externas

## 📋 Status

🚧 **Em desenvolvimento** - Estrutura será criada em breve

## 🛠️ Stack

- Supabase Edge Functions (Deno)
- PostgreSQL
- OpenAI API
- Evolution API (WhatsApp)
- Cron Jobs (pg_cron)

## 📁 Estrutura Planejada

```
backend/
├── functions/
│   ├── handle-webhook/           # Recebe mensagens WhatsApp
│   ├── monitor-conversations/    # Processa conversas e IA
│   └── _shared/                  # Código compartilhado
│       ├── evolutionApi.ts       # Cliente Evolution API
│       ├── openaiClient.ts       # Cliente OpenAI
│       └── config/               # Configurações
├── migrations/                   # Migrations do banco
└── config.toml                   # Config Supabase
```

## 🚀 Como Deployar (quando implementado)

```bash
supabase login
supabase link --project-ref SEU_REF
supabase db push
supabase functions deploy
```

## 📖 Documentação

Leia [`FRONTEND_BACKEND_SEPARATION.md`](../docs/FRONTEND_BACKEND_SEPARATION.md) para entender responsabilidades do backend.

---

**Aguardando implementação inicial...**
