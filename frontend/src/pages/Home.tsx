import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, BarChart3, CheckCircle2, Clock, Zap } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import type { AnalysisRequest } from "@/integrations/supabase/types"

export default function Home() {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState<AnalysisRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar análises do banco
  useEffect(() => {
    loadAnalyses()

    // Escutar atualizações em tempo real
    const channel = supabase
      .channel('analyses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analysis_requests'
        },
        () => {
          loadAnalyses() // Recarrega quando houver mudança
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  async function loadAnalyses() {
    try {
      const { data, error } = await supabase
        .from('analysis_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnalyses(data || [])
    } catch (error) {
      console.error('Erro ao carregar análises:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular estatísticas
  const totalAnalyses = analyses.length
  const completedAnalyses = analyses.filter(a => a.status === 'completed').length
  const inProgressAnalyses = analyses.filter(a => a.status === 'in_progress').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">Cliente Oculto</h1>
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>Análises</Button>
            <Button variant="default" onClick={() => navigate('/new')}>Nova Análise</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Análise Automatizada de <span className="text-primary">Vendas no WhatsApp</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            IA avalia conversas de vendedores em tempo real. Insights profundos, métricas precisas, melhoria contínua.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate('/new')}>
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" onClick={() => navigate('/')}>
              Ver Demo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total de Análises</p>
                  <p className="text-3xl font-bold">
                    {loading ? '...' : totalAnalyses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Concluídas</p>
                  <p className="text-3xl font-bold">
                    {loading ? '...' : completedAnalyses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Em Andamento</p>
                  <p className="text-3xl font-bold">
                    {loading ? '...' : inProgressAnalyses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análises Recentes */}
        {analyses.length > 0 && (
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-8">Análises Recentes</h3>
            <div className="grid gap-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold">{analysis.customer_name}</h4>
                          {analysis.status === 'pending' && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                              Pendente
                            </span>
                          )}
                          {analysis.status === 'in_progress' && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Em Andamento
                            </span>
                          )}
                          {analysis.status === 'completed' && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Concluída
                            </span>
                          )}
                          {analysis.status === 'failed' && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              Falhou
                            </span>
                          )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Telefone:</span> {analysis.customer_phone}
                          </div>
                          <div>
                            <span className="font-medium">Profundidade:</span>{' '}
                            {analysis.analysis_depth === 'quick' && 'Rápida'}
                            {analysis.analysis_depth === 'intermediate' && 'Intermediária'}
                            {analysis.analysis_depth === 'deep' && 'Profunda'}
                          </div>
                          <div>
                            <span className="font-medium">Criado:</span>{' '}
                            {new Date(analysis.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        {analysis.metadata?.business_name && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Negócio:</span> {analysis.metadata.business_name}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="ml-4">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">Como Funciona</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>1. Configure a Análise</CardTitle>
                <CardDescription>
                  Defina objetivos, escolha perfil (homem/mulher) e profundidade da análise
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>2. IA Conversa</CardTitle>
                <CardDescription>
                  Sistema inicia conversa natural via WhatsApp, avaliando técnicas de vendas em tempo real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>3. Receba Análise</CardTitle>
                <CardDescription>
                  Relatório completo com métricas, pontos fortes, áreas de melhoria e score detalhado
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
          <CardContent className="py-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Pronto para Começar?</h3>
            <p className="text-lg mb-6 text-blue-50">
              Crie sua primeira análise em menos de 2 minutos
            </p>
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base" onClick={() => navigate('/new')}>
              Criar Primeira Análise
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="font-semibold text-gray-900">Cliente Oculto v2.0</span>
            </div>
            <p className="text-sm text-gray-500">
              Sistema de análise automatizada de vendas via WhatsApp
            </p>
            <p className="text-sm text-gray-400">
              Feito com ❤️ pela Agência Flip
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
