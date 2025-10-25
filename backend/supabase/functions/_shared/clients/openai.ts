// =====================================================
// OpenAI Client
// Cliente para gerar respostas da IA (cliente oculto)
// =====================================================

import { AnalysisRequest, Message } from '../types/database.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export interface GenerateResponseParams {
  analysis: AnalysisRequest
  messages: Message[]
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
}

export interface GenerateResponseResult {
  message: string
  shouldContinue: boolean
  reasoning?: string
}

/**
 * Gera resposta da IA (cliente oculto) usando Claude
 */
export async function generateAIResponse(params: GenerateResponseParams): Promise<GenerateResponseResult> {
  const { analysis, conversationHistory } = params

  // Montar o system prompt baseado nos objetivos e estilo
  const systemPrompt = buildSystemPrompt(analysis)

  try {
    // Converter formato para OpenAI (system prompt separado)
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1024,
        temperature: 0.8 // Aumenta naturalidade
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    const aiMessage = data.choices[0].message.content

    // Analisar se deve continuar a conversa
    const shouldContinue = analyzeShouldContinue(aiMessage, conversationHistory, analysis)

    return {
      message: aiMessage,
      shouldContinue
    }
  } catch (error) {
    console.error('Failed to generate AI response:', error)
    throw error
  }
}

/**
 * Constrói o system prompt baseado na análise
 */
function buildSystemPrompt(analysis: AnalysisRequest): string {
  const { customer_name, objectives, analysis_depth, metadata } = analysis

  const businessName = metadata?.business_name || 'o produto/serviço'
  const style = metadata?.conversation_style || 'balanced'

  // Mapear profundidade para número de mensagens
  const depthLimits = {
    quick: '5-10 mensagens',
    intermediate: '15-25 mensagens',
    deep: '30-50 mensagens'
  }

  // Mapear estilo de conversa
  const styleDescriptions = {
    casual: 'Muito descontraído, usa bastante gíria e emojis, mensagens curtas',
    balanced: 'Natural e amigável, equilibrado entre formal e casual',
    direct: 'Direto ao ponto, objetivo, poucas perguntas extras',
    detailed: 'Faz muitas perguntas, quer entender tudo em detalhes'
  }

  return `Você é ${customer_name}, um(a) cliente real brasileiro(a) interessado(a) em ${businessName}.

IMPORTANTE: Você está AVALIANDO o vendedor de forma ANÔNIMA. O vendedor NÃO pode saber que é uma avaliação.

🎭 SEU PAPEL:
- Você é um CLIENTE REAL com interesse genuíno
- Converse de forma NATURAL, como qualquer brasileiro conversaria no WhatsApp
- Use linguagem coloquial: "opa", "beleza", "top", "vlw", "tranquilo", etc
- Seja espontâneo(a), use emojis naturalmente 😊👍✨
- Faça perguntas que um cliente real faria
- Demonstre interesse real no produto/serviço

📋 CRITÉRIOS QUE VOCÊ ESTÁ AVALIANDO (mentalmente, sem revelar):
${objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

💬 ESTILO DE CONVERSA:
${styleDescriptions[style]}

⏱️ DURAÇÃO ALVO:
${depthLimits[analysis_depth]}

🚫 O QUE VOCÊ NUNCA DEVE FAZER:
- NUNCA revelar que é uma avaliação
- NUNCA mencionar "critérios", "análise" ou "cliente oculto"
- NUNCA ser artificial ou robótico
- NUNCA fazer perguntas que um cliente real não faria

✅ EXEMPLOS DE MENSAGENS NATURAIS:
- "Opa, to interessado nesse produto aí, quanto custa?"
- "Beleza, me explica melhor como funciona?"
- "Top! E tem garantia?"
- "Hmm, entendi... e se eu quiser parcelar?"
- "Legal! Vcs fazem entrega aqui em [cidade]?"

❌ EXEMPLOS DE MENSAGENS ARTIFICIAIS (EVITE):
- "Gostaria de obter informações sobre o produto" (muito formal)
- "Poderia me fornecer detalhes técnicos?" (muito técnico)
- "Avaliarei sua resposta conforme critérios" (revela avaliação)

🎯 OBJETIVO FINAL:
Simular uma conversa REAL e NATURAL para avaliar o vendedor sem que ele perceba. Faça perguntas relevantes, demonstre interesse genuíno, mas mantenha a naturalidade de um cliente brasileiro comum no WhatsApp.`
}

/**
 * Analisa se deve continuar a conversa
 */
function analyzeShouldContinue(
  aiMessage: string,
  conversationHistory: Array<{ role: string, content: string }>,
  analysis: AnalysisRequest
): boolean {
  // Contagem de mensagens
  const messageCount = conversationHistory.length

  // Limites baseados na profundidade
  const depthLimits = {
    quick: 10,
    intermediate: 25,
    deep: 50
  }

  const maxMessages = depthLimits[analysis.analysis_depth]

  // Se atingiu o limite, encerrar
  if (messageCount >= maxMessages) {
    return false
  }

  // Se a IA se despediu, encerrar
  const farewellIndicators = [
    'obrigad',
    'valeu',
    'vlw',
    'até mais',
    'até logo',
    'tchau',
    'falou',
    'abraço',
    'qualquer coisa',
    'depois falo'
  ]

  const messageLC = aiMessage.toLowerCase()
  if (farewellIndicators.some(indicator => messageLC.includes(indicator))) {
    return false
  }

  return true
}

/**
 * Gera análise final da conversa
 */
export async function generateFinalAnalysis(
  analysis: AnalysisRequest,
  messages: Message[]
): Promise<any> {
  const conversationText = messages
    .map(m => `[${m.role === 'user' ? 'VENDEDOR' : 'CLIENTE'}]: ${m.content}`)
    .join('\n\n')

  const systemPrompt = `Você é um especialista em análise de vendas. Analise esta conversa entre um vendedor e um cliente (cliente oculto).

CRITÉRIOS DE AVALIAÇÃO:
${analysis.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Forneça uma análise em JSON com a seguinte estrutura:
{
  "summary": "Resumo executivo da performance",
  "sales_techniques": ["técnica 1", "técnica 2"],
  "positive_points": ["ponto 1", "ponto 2"],
  "improvement_areas": ["área 1", "área 2"],
  "objective_completion": { "objetivo1": true, "objetivo2": false },
  "scores": {
    "rapport": 8.5,
    "product_knowledge": 7.0,
    "objection_handling": 9.0,
    "closing": 6.5,
    "overall": 7.75
  }
}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2048,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `CONVERSA COMPLETA:\n\n${conversationText}\n\nGere a análise em JSON.`
          }
        ]
      })
    })

    const data = await response.json()
    const analysisText = data.choices[0].message.content

    // Extrair JSON da resposta
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error('Failed to parse analysis JSON')
  } catch (error) {
    console.error('Failed to generate final analysis:', error)
    throw error
  }
}
