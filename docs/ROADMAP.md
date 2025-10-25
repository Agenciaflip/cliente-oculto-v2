# 🗺️ Roadmap - Cliente Oculto v2.0

## 🎯 Visão Geral

Plano de desenvolvimento do sistema Cliente Oculto v2.0, dividido em fases incrementais.

---

## 📅 Fase 1: Setup Inicial (1-2 dias)

**Objetivo:** Estrutura básica funcionando

### Frontend
- [ ] Criar projeto Vite + React + TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Instalar shadcn/ui
- [ ] Configurar Supabase Client
- [ ] Criar estrutura de pastas
- [ ] Página inicial placeholder

### Backend
- [ ] Inicializar projeto Supabase
- [ ] Criar migrations iniciais (tabelas)
- [ ] Configurar Edge Functions básicas
- [ ] Testar deploy no Supabase

### Infraestrutura
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Configurar linting (ESLint)
- [ ] Configurar formatação (Prettier)
- [ ] Criar .env.example

**Entregável:** Projeto roda localmente (frontend + backend conectados)

---

## 📅 Fase 2: CRUD Análises (2-3 dias)

**Objetivo:** Criar e listar análises

### Frontend
- [ ] Página de lista de análises
- [ ] Componente Card de análise
- [ ] Modal/página de criar análise
- [ ] Formulário validado (Zod)
- [ ] Estados de loading
- [ ] Tratamento de erros

### Backend
- [ ] RLS policies (Row Level Security)
- [ ] Trigger de updated_at
- [ ] Validações no banco
- [ ] Índices de performance

### Features
- [ ] Criar análise (nome, telefone, objetivos, profundidade)
- [ ] Listar análises (grid de cards)
- [ ] Ver detalhes de análise
- [ ] Filtrar por status
- [ ] Buscar por nome/telefone

**Entregável:** Usuário consegue criar e ver análises

---

## 📅 Fase 3: Integração WhatsApp (3-4 dias)

**Objetivo:** Enviar/receber mensagens via Evolution API

### Backend
- [ ] Função `evolutionApi.ts` (send/receive)
- [ ] Função `handle-webhook` (recebe msgs)
- [ ] Validar payload do webhook
- [ ] Salvar mensagem no banco
- [ ] Testes unitários

### Frontend
- [ ] Exibir mensagens no chat
- [ ] Componente MessageBubble
- [ ] Scroll automático
- [ ] Estados vazios (sem mensagens)

### Testes
- [ ] Enviar mensagem manual
- [ ] Receber mensagem do vendedor
- [ ] Validar persistência no banco
- [ ] Testar com múltiplas análises

**Entregável:** Mensagens aparecem no sistema em tempo real

---

## 📅 Fase 4: IA Conversacional (4-5 dias)

**Objetivo:** IA responde de forma natural

### Backend
- [ ] Cliente OpenAI configurado
- [ ] Prompts base (system, casual, direct)
- [ ] Função `generateResponse()`
- [ ] Gerenciar contexto da conversa
- [ ] Limitar tokens (evitar overflow)

### Features
- [ ] IA responde automaticamente
- [ ] Considera histórico completo
- [ ] Estilo baseado em config (A/B testing)
- [ ] Typing indicators (simulação)
- [ ] Quebrar msgs longas em chunks

### Testes
- [ ] Conversa de 10+ mensagens
- [ ] Testar diferentes estilos
- [ ] Validar contexto mantido
- [ ] Testar timeout e edge cases

**Entregável:** IA conversa naturalmente com vendedor

---

## 📅 Fase 5: Agrupamento de Mensagens (2-3 dias)

**Objetivo:** IA aguarda múltiplas mensagens antes de responder

### Backend
- [ ] Janela de agrupamento (10-15s)
- [ ] Timer `next_ai_response_at`
- [ ] Lógica de detecção de janela ativa
- [ ] Early return quando janela ativa
- [ ] Agrupar mensagens unprocessed

### Frontend
- [ ] Timer de próxima resposta
- [ ] Countdown visual
- [ ] "Respondendo agora..." quando expirar

### Testes
- [ ] Enviar 2 msgs em 5s → IA responde 1x
- [ ] Enviar 1 msg → IA responde após 10-15s
- [ ] Enviar 5 msgs seguidas → todas agrupadas

**Entregável:** Sistema agrupa mensagens corretamente

---

## 📅 Fase 6: Follow-ups Inteligentes (3-4 dias)

**Objetivo:** Sistema tenta reengajar vendedor automaticamente

### Backend
- [ ] Calcular `next_follow_up_at`
- [ ] 3 níveis de follow-up (gentil/médio/final)
- [ ] Delays progressivos (1h30 / 4h / 8h)
- [ ] Encerrar após 3 tentativas
- [ ] Configurável por profundidade

### Frontend
- [ ] Timer de follow-up (diferente de resposta)
- [ ] "Próximo follow-up em: Xh Ymin"
- [ ] Mostrar tentativas restantes (X/3)
- [ ] Badge visual (follow-up ativo)

### Testes
- [ ] NÃO responder → recebe follow-up #1
- [ ] Ainda não responder → follow-up #2
- [ ] Ainda não responder → follow-up #3 + encerra
- [ ] Responder entre follow-ups → cancela próximos

**Entregável:** Follow-ups funcionam automaticamente

---

## 📅 Fase 7: Análise Final (3-4 dias)

**Objetivo:** Gerar relatório de qualidade de vendas

### Backend
- [ ] Prompt de análise profunda
- [ ] Usar GPT-4o (mais tokens)
- [ ] Estrutura JSON padronizada
- [ ] Análise de técnicas de vendas
- [ ] Score por critério (rapport, produto, fechamento)
- [ ] Identificar objeções tratadas

### Frontend
- [ ] Página de análise final
- [ ] Cards por seção (resumo, técnicas, pontos fortes)
- [ ] Gráfico de radar (scores)
- [ ] Lista de objetivos alcançados
- [ ] Botão de exportar PDF (futuro)

### Testes
- [ ] Gerar análise de conversa curta (5 msgs)
- [ ] Gerar análise de conversa longa (50 msgs)
- [ ] Validar JSON retornado
- [ ] Verificar qualidade da análise

**Entregável:** Relatório completo ao final da conversa

---

## 📅 Fase 8: Debug & Monitoramento (2-3 dias)

**Objetivo:** Visibilidade total do sistema

### Backend
- [ ] Função `saveDebugLog()`
- [ ] Logs em pontos críticos (8+ pontos)
- [ ] Salvar no metadata (últimos 100)
- [ ] Estrutura padronizada (level, message, data)

### Frontend
- [ ] Componente DebugLogs (Ctrl+Shift+D)
- [ ] Realtime subscription
- [ ] UI estilo terminal
- [ ] Filtros por nível
- [ ] Expandir dados JSON

### Features
- [ ] Ver logs em tempo real
- [ ] Logs persistem (não somem ao refresh)
- [ ] Cores por nível (info/warning/error/success)
- [ ] Timestamp formatado

**Entregável:** Sistema totalmente observável

---

## 📅 Fase 9: Retry & Error Handling (2-3 dias)

**Objetivo:** Sistema robusto que não perde mensagens

### Backend
- [ ] Função `retryWithBackoff()`
- [ ] Retry em Evolution API (3x)
- [ ] Retry em OpenAI API (3x)
- [ ] Exponential backoff
- [ ] Dead letter queue (falhas > 3x)
- [ ] Alertas de falhas críticas

### Testes
- [ ] Simular Evolution API offline
- [ ] Simular OpenAI rate limit
- [ ] Verificar retries automáticos
- [ ] Validar logs de erro

**Entregável:** Sistema resiliente a falhas temporárias

---

## 📅 Fase 10: Múltiplas Instâncias (1-2 dias)

**Objetivo:** Suportar cliente oculto homem e mulher

### Backend
- [ ] Criar instância `clienteoculto-homem`
- [ ] Conectar número masculino
- [ ] Testar envio/recebimento

### Frontend
- [ ] Dropdown de seleção
- [ ] Ícones diferenciados (♂️ / ♀️)
- [ ] Exibir instância ativa

### Testes
- [ ] Criar análise com instância homem
- [ ] Criar análise com instância mulher
- [ ] Ambas funcionando em paralelo

**Entregável:** 2 perfis de cliente oculto ativos

---

## 📅 Fase 11: Melhorias UX (2-3 dias)

**Objetivo:** Interface polida e profissional

### Frontend
- [ ] Animações suaves (Framer Motion)
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Confirmações de ações destrutivas
- [ ] Empty states bonitos
- [ ] Dark mode (opcional)

### Backend
- [ ] Otimizar queries (N+1 problem)
- [ ] Adicionar índices
- [ ] Caching de dados estáticos

**Entregável:** Experiência de usuário excelente

---

## 📅 Fase 12: Exportar PDF (2-3 dias)

**Objetivo:** Relatório compartilhável

### Backend
- [ ] Função `export-analysis`
- [ ] Gerar PDF com pdf-lib
- [ ] Incluir logo e branding
- [ ] Gráficos em PNG
- [ ] Formatação profissional

### Frontend
- [ ] Botão "Exportar PDF"
- [ ] Loading durante geração
- [ ] Download automático

**Entregável:** PDF profissional da análise

---

## 📅 Fase 13: Dashboard Métricas (3-4 dias)

**Objetivo:** Visão geral de performance

### Frontend
- [ ] Página de dashboard
- [ ] Cards de métricas principais
- [ ] Gráficos (Chart.js ou Recharts)
- [ ] Filtros por período
- [ ] Comparativo entre análises

### Features
- [ ] Total de análises (por status)
- [ ] Taxa de conversão
- [ ] Tempo médio de resposta
- [ ] Score médio por vendedor
- [ ] Top 5 vendedores

**Entregável:** Dashboard executivo

---

## 📅 Fase 14: Pesquisa com Perplexity (2-3 dias)

**Objetivo:** IA pesquisa informações externas

### Backend
- [ ] Cliente Perplexity API
- [ ] Detectar quando pesquisar
- [ ] Limitar pesquisas (custo)
- [ ] Cache de resultados

### Features
- [ ] IA pesquisa sobre produto mencionado
- [ ] IA pesquisa sobre empresa
- [ ] Contexto enriquecido

**Entregável:** IA com conhecimento atualizado

---

## 📅 Fase 15: Sistema de Filas (3-4 dias)

**Objetivo:** Processar conversas em paralelo

### Backend
- [ ] Implementar fila (Bull ou Supabase Queues)
- [ ] Workers separados
- [ ] Retry automático
- [ ] Dashboard de filas

### Benefits
- [ ] Processar 100+ análises simultâneas
- [ ] Não bloqueia cron job
- [ ] Priorização de tasks

**Entregável:** Sistema escalável

---

## 🎯 Resumo de Prioridades

### Must Have (MVP)
- ✅ Setup inicial
- ✅ CRUD análises
- ✅ Integração WhatsApp
- ✅ IA conversacional
- ✅ Agrupamento de mensagens
- ✅ Follow-ups
- ✅ Análise final

### Should Have (v1.0)
- ✅ Debug logs
- ✅ Retry logic
- ✅ Múltiplas instâncias
- ✅ Exportar PDF

### Could Have (v1.1+)
- 🔄 Dashboard métricas
- 🔄 Perplexity AI
- 🔄 Sistema de filas
- 🔄 Dark mode
- 🔄 Multi-idioma

---

## 📊 Estimativa de Tempo

- **MVP (Fases 1-7):** 18-27 dias (~4-6 semanas)
- **v1.0 (Fases 8-11):** +9-13 dias (~2-3 semanas)
- **v1.1+ (Fases 12-15):** +10-14 dias (~2-3 semanas)

**Total:** 37-54 dias (~2-3 meses com 1 dev full-time)

**Com múltiplos devs/agentes:** Reduzir para 1-1.5 mês (trabalho paralelo)

---

## 🤝 Divisão de Trabalho (Paralelo)

### Agent 1: Frontend
- Fases 2, 6, 7, 11, 12, 13

### Agent 2: Backend
- Fases 3, 4, 5, 8, 9, 14

### Agent 3: Database/Infra
- Fase 1, 10, 15

---

**Última Atualização:** Janeiro 2025
