# 🕵️ Cliente Oculto WhatsApp - v2.0

> Sistema automatizado para análise de atendimento via WhatsApp usando IA

## 🎯 Sobre o Projeto

Sistema que simula um cliente oculto conversando com vendedores no WhatsApp para avaliar qualidade de atendimento, técnicas de vendas e alcance de objetivos.

### Como Funciona

1. **Usuário configura análise** → Define objetivos e escolhe perfil (homem/mulher)
2. **IA inicia conversa** → Envia mensagem via WhatsApp (Evolution API)
3. **Conversa natural** → IA responde de forma humana e contextual (GPT-4o)
4. **Follow-ups inteligentes** → Sistema tenta até 3x se vendedor não responder
5. **Análise completa** → Gera relatório com técnicas de vendas e pontos de melhoria

## 🏗️ Arquitetura (Clean & Simple)

```
cliente-oculto-v2/
├── frontend/          # React + Vite + TypeScript (Interface visual)
├── backend/           # Supabase Functions (Lógica do servidor)
├── docs/              # Documentação completa
└── README.md          # Este arquivo
```

### Stack Tecnológica

- **Frontend:** React 18, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **IA:** OpenAI GPT-4o / GPT-4o-mini
- **WhatsApp:** Evolution API (auto-hospedado)
- **Deploy:** Lovable (frontend) + Supabase Cloud (backend)

## 📋 Status do Projeto

**Versão:** 2.0.0-alpha
**Status:** 🚧 Em desenvolvimento inicial
**Última Atualização:** Janeiro 2025

### v2.0 vs v1.0

**O que melhoramos:**
- ✅ Arquitetura limpa desde o início (frontend/backend separados)
- ✅ Código organizado em módulos pequenos
- ✅ Documentação completa desde o dia 1
- ✅ Testes desde o início
- ✅ Retry logic e error handling robusto
- ✅ Sistema de filas para escalabilidade

**O que mantivemos:**
- ✅ Agrupamento de mensagens (10-15s)
- ✅ Follow-ups progressivos (3 tentativas)
- ✅ Debug logs em tempo real
- ✅ Suporte a múltiplas instâncias (homem/mulher)

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase (free tier suficiente)
- Evolution API configurada
- OpenAI API key

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Agenciaflip/cliente-oculto-v2.git
cd cliente-oculto-v2

# Instalar frontend
cd frontend
npm install
npm run dev  # http://localhost:5173

# Configurar backend (em outro terminal)
cd ../backend
npm install -g supabase
supabase login
supabase init
supabase link --project-ref SEU_PROJECT_REF
```

### Configuração

```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key

# Backend (Supabase Secrets)
OPENAI_API_KEY=sk-proj-...
EVOLUTION_API_KEY=sua_key
EVOLUTION_API_URL=https://sua-evolution.com
```

## 📚 Documentação

- [Arquitetura Completa](./docs/ARCHITECTURE.md) - Visão geral do sistema
- [Stack Tecnológica](./docs/TECH_STACK.md) - Tecnologias e justificativas
- [Estrutura do Projeto](./docs/PROJECT_STRUCTURE.md) - Navegação no código
- [Frontend/Backend](./docs/FRONTEND_BACKEND_SEPARATION.md) - Trabalho paralelo
- [Guia de Desenvolvimento](./docs/DEVELOPMENT_GUIDE.md) - Como desenvolver

## 🤝 Contribuindo

### Para Desenvolvedores Frontend

```bash
cd frontend/
# Trabalhe apenas em arquivos da pasta frontend/
# Leia: docs/FRONTEND_BACKEND_SEPARATION.md
```

### Para Desenvolvedores Backend

```bash
cd backend/
# Trabalhe apenas em arquivos da pasta backend/
# Leia: docs/FRONTEND_BACKEND_SEPARATION.md
```

### Para Agentes de IA

Cada agente deve ler os documentos relevantes em `docs/` antes de começar a trabalhar:

```
Agent Frontend: Leia FRONTEND_BACKEND_SEPARATION.md seção "Frontend Developer"
Agent Backend: Leia FRONTEND_BACKEND_SEPARATION.md seção "Backend Developer"
Agent Database: Leia ARCHITECTURE.md seção "Banco de Dados"
```

## 🎯 Roadmap

### Fase 1: MVP (Em Desenvolvimento)
- [ ] Setup inicial do projeto
- [ ] Estrutura frontend básica
- [ ] Estrutura backend básica
- [ ] Integração Evolution API
- [ ] Integração OpenAI
- [ ] CRUD de análises
- [ ] Sistema de conversação básico

### Fase 2: Features Core
- [ ] Agrupamento de mensagens
- [ ] Follow-ups inteligentes
- [ ] Debug logs visual
- [ ] Análise final de vendas
- [ ] Timer de próxima ação
- [ ] Suporte a 2 instâncias (homem/mulher)

### Fase 3: Melhorias
- [ ] Retry logic robusto
- [ ] Sistema de filas
- [ ] Exportar PDF
- [ ] Dashboard de métricas
- [ ] Pesquisa com Perplexity AI
- [ ] A/B testing de estilos

### Fase 4: Escalabilidade
- [ ] Otimização de performance
- [ ] Caching inteligente
- [ ] Multi-tenant
- [ ] API pública

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma issue com:
- Descrição do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Logs capturados

## 📞 Suporte

- **Documentação:** [`/docs`](./docs/)
- **Issues:** [GitHub Issues](https://github.com/Agenciaflip/cliente-oculto-v2/issues)
- **Discussões:** [GitHub Discussions](https://github.com/Agenciaflip/cliente-oculto-v2/discussions)

## 📝 Licença

Este projeto é privado e pertence à Agência Flip.

---

## 🎓 Para Iniciantes

**"Quero mexer na cor do botão"** → Vá para `frontend/src/components/`
**"Quero mudar tempo de follow-up"** → Vá para `backend/functions/monitor-conversations/`
**"Quero adicionar um campo novo"** → Vá para `backend/migrations/`
**"Quero mudar prompt da IA"** → Vá para `backend/functions/_shared/config/prompts.ts`

Sempre leia a documentação relevante em `docs/` antes de começar! 📖

---

**Feito com ❤️ pela Agência Flip**
