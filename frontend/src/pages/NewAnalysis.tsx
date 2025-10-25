import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

// Schema de validação com Zod
const analysisSchema = z.object({
  customer_name: z.string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo"),

  customer_phone: z.string()
    .regex(/^55\d{10,11}$/, "Formato: 55 + DDD + número (ex: 5511999999999)")
    .length(13, "Deve ter 13 dígitos (55 + DDD + número)"),

  objectives: z.string()
    .min(10, "Descreva os objetivos com mais detalhes")
    .max(1000, "Objetivos muito longos"),

  analysis_depth: z.enum(["quick", "intermediate", "deep"], {
    required_error: "Selecione a profundidade da análise"
  }),

  evolution_instance: z.enum(["clienteoculto-homem", "clienteoculto-mulher"], {
    required_error: "Selecione o perfil do cliente oculto"
  })
})

type AnalysisFormData = z.infer<typeof analysisSchema>

export default function NewAnalysis() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      analysis_depth: "intermediate",
      evolution_instance: "clienteoculto-mulher"
    }
  })

  async function onSubmit(data: AnalysisFormData) {
    setIsSubmitting(true)

    try {
      // Converter objetivos de string para array
      const objectivesArray = data.objectives
        .split('\n')
        .map(obj => obj.trim())
        .filter(obj => obj.length > 0)

      // Criar análise no Supabase
      const { data: analysis, error } = await supabase
        .from('analysis_requests')
        .insert({
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          objectives: objectivesArray,
          analysis_depth: data.analysis_depth,
          evolution_instance: data.evolution_instance,
          status: 'pending',
          metadata: {
            created_from: 'web',
            conversation_style: 'balanced'
          }
        })
        .select()
        .single()

      if (error) throw error

      // Mostrar sucesso
      setShowSuccess(true)
      reset()

      // Redirecionar após 2s
      setTimeout(() => {
        navigate('/')
      }, 2000)

    } catch (error: any) {
      console.error('Erro ao criar análise:', error)
      alert(`Erro: ${error.message || 'Falha ao criar análise'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Análise Criada com Sucesso!
            </h2>
            <p className="text-gray-600 mb-4">
              Redirecionando para a página inicial...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">Cliente Oculto</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Form */}
      <section className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl">Nova Análise</CardTitle>
            <CardDescription>
              Configure uma nova análise de cliente oculto via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome do Cliente Oculto */}
              <div className="space-y-2">
                <Label htmlFor="customer_name">
                  Nome do Cliente Oculto
                </Label>
                <Input
                  id="customer_name"
                  placeholder="Ex: João Silva"
                  {...register("customer_name")}
                  className={errors.customer_name ? "border-red-500" : ""}
                />
                {errors.customer_name && (
                  <p className="text-sm text-red-600">{errors.customer_name.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Nome que aparecerá no WhatsApp para o vendedor
                </p>
              </div>

              {/* Telefone do Vendedor */}
              <div className="space-y-2">
                <Label htmlFor="customer_phone">
                  Telefone do Vendedor (WhatsApp)
                </Label>
                <Input
                  id="customer_phone"
                  placeholder="5511999999999"
                  {...register("customer_phone")}
                  className={errors.customer_phone ? "border-red-500" : ""}
                />
                {errors.customer_phone && (
                  <p className="text-sm text-red-600">{errors.customer_phone.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Formato: 55 + DDD + número (sem espaços ou caracteres especiais)
                </p>
              </div>

              {/* Objetivos */}
              <div className="space-y-2">
                <Label htmlFor="objectives">
                  Objetivos da Conversa
                </Label>
                <Textarea
                  id="objectives"
                  placeholder="Ex:&#10;Descobrir preço do produto X&#10;Entender forma de pagamento&#10;Avaliar tempo de resposta"
                  rows={5}
                  {...register("objectives")}
                  className={errors.objectives ? "border-red-500" : ""}
                />
                {errors.objectives && (
                  <p className="text-sm text-red-600">{errors.objectives.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Um objetivo por linha. A IA tentará alcançar todos os objetivos na conversa.
                </p>
              </div>

              {/* Profundidade */}
              <div className="space-y-2">
                <Label htmlFor="analysis_depth">
                  Profundidade da Análise
                </Label>
                <select
                  id="analysis_depth"
                  {...register("analysis_depth")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="quick">Rápida (5-10 mensagens)</option>
                  <option value="intermediate">Intermediária (15-25 mensagens)</option>
                  <option value="deep">Profunda (30-50 mensagens)</option>
                </select>
                {errors.analysis_depth && (
                  <p className="text-sm text-red-600">{errors.analysis_depth.message}</p>
                )}
              </div>

              {/* Perfil */}
              <div className="space-y-2">
                <Label htmlFor="evolution_instance">
                  Perfil do Cliente Oculto
                </Label>
                <select
                  id="evolution_instance"
                  {...register("evolution_instance")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="clienteoculto-mulher">👩 Cliente Oculto Mulher</option>
                  <option value="clienteoculto-homem">👨 Cliente Oculto Homem</option>
                </select>
                {errors.evolution_instance && (
                  <p className="text-sm text-red-600">{errors.evolution_instance.message}</p>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Análise'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
