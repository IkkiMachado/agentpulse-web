import React, { useState } from 'react'
import {
  Bot,
  Play,
  Loader2,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Coins,
  Clock,
  Layers,
  FileText
} from 'lucide-react'
import type { Agent, Task } from '../types'
import { dispatchTask, fetchTask } from '../api'

interface PlaygroundProps {
  agents: Agent[]
  onTaskCompleted: (task: Task) => void
  onViewTraces: (taskId: string) => void
}

const SAMPLE_PROMPTS = [
  'Quais as 3 principais tendências de tecnologia e projeções para 2026?',
  'Pesquise as projeções do mercado de agentes de IA e apresente um resumo executivo.',
  'Calcule a estimativa de crescimento anual se o mercado atual for 1500 e crescer 38% ao ano.',
  'Consulte a cotação estimada da ação da Apple (AAPL) e da Google (GOOGL).'
]

export const Playground: React.FC<PlaygroundProps> = ({
  agents,
  onTaskCompleted,
  onViewTraces
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '')
  const [prompt, setPrompt] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [stepStatus, setStepStatus] = useState<string>('')

  // Atualiza agente selecionado se a lista mudar
  React.useEffect(() => {
    if (!selectedAgentId && agents.length > 0) {
      setSelectedAgentId(agents[0].id)
    }
  }, [agents, selectedAgentId])

  const handleRun = async () => {
    if (!selectedAgentId || !prompt.trim()) return

    setIsLoading(true)
    setCurrentTask(null)
    setStepStatus('Disparando tarefa assíncrona (POST 202 Accepted)...')

    try {
      // 1. Dispara tarefa assíncrona
      const res = await dispatchTask(selectedAgentId, prompt)
      setStepStatus(`Enfileirado com sucesso! Task ID: ${res.task_id.slice(0, 8)}...`)

      // 2. Polling até concluir
      let attempts = 0
      const maxAttempts = 20

      const pollInterval = setInterval(async () => {
        attempts++
        try {
          const taskData = await fetchTask(res.task_id)
          
          if (taskData.status === 'RUNNING') {
            setStepStatus('Agente em execução: avaliando ciclo ReAct e ferramentas...')
          }

          if (taskData.status === 'COMPLETED' || taskData.status === 'FAILED') {
            clearInterval(pollInterval)
            setCurrentTask(taskData)
            setIsLoading(false)
            setStepStatus(
              taskData.status === 'COMPLETED'
                ? 'Concluído com sucesso!'
                : `Falha na execução: ${taskData.error_message || 'Erro desconhecido'}`
            )
            onTaskCompleted(taskData)
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            setIsLoading(false)
            setStepStatus('Tempo limite de polling atingido.')
          }
        } catch (err) {
          clearInterval(pollInterval)
          setIsLoading(false)
          setStepStatus('Erro ao consultar status da tarefa.')
        }
      }, 600)

    } catch (err: any) {
      setIsLoading(false)
      setStepStatus(`Erro ao despachar tarefa: ${err.message}`)
    }
  }

  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Coluna da Esquerda: Formulário de Execução */}
      <div className="lg:col-span-6 space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Executar Missão do Agente</h2>
              <p className="text-xs text-slate-400">Envie instruções e acompanhe o fluxo assíncrono em tempo real</p>
            </div>
          </div>

          {/* Seleção do Agente */}
          <div className="space-y-2 mb-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Selecionar Agente de IA:
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.model})
                </option>
              ))}
            </select>

            {selectedAgent && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div><span className="text-slate-200 font-medium">Prompt Mestre:</span> {selectedAgent.system_prompt}</div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                  <span>Modelo: {selectedAgent.model}</span>
                  <span>Temperatura: {selectedAgent.temperature}</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="space-y-2 mb-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Prompt da Tarefa:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Pesquise as 3 principais tendências de tecnologia para 2026..."
              rows={4}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none font-mono"
            />
          </div>

          {/* Sugestões Rápidas */}
          <div className="space-y-2 mb-6">
            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Sugestões rápidas de teste:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(sample)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-left"
                >
                  {sample.slice(0, 45)}...
                </button>
              ))}
            </div>
          </div>

          {/* Botão de Disparo */}
          <button
            onClick={handleRun}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando em Background...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Disparar Tarefa (Async)</span>
              </>
            )}
          </button>

          {/* Status Tracker */}
          {stepStatus && (
            <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-xs">
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
              ) : currentTask?.status === 'COMPLETED' ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
              )}
              <span className="text-slate-300 font-mono text-[11px]">{stepStatus}</span>
            </div>
          )}

        </div>
      </div>

      {/* Coluna da Direita: Resposta Final & Métricas da Execução */}
      <div className="lg:col-span-6 space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur-sm h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Resultado & Telemetria</h3>
                  <p className="text-xs text-slate-400">Resposta final sintetizada pelo agente autônomo</p>
                </div>
              </div>

              {currentTask && (
                <button
                  onClick={() => onViewTraces(currentTask.id)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <span>Ver Traces</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {currentTask ? (
              <div className="space-y-4">
                {/* Telemetria Rápida */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> Duração
                    </span>
                    <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                      {currentTask.duration_ms} ms
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1 font-semibold">
                      <Layers className="w-3 h-3" /> Tokens
                    </span>
                    <span className="text-sm font-mono font-bold text-cyan-400 mt-0.5 block">
                      {currentTask.total_tokens}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1 font-semibold">
                      <Coins className="w-3 h-3" /> Custo
                    </span>
                    <span className="text-sm font-mono font-bold text-purple-400 mt-0.5 block">
                      ${currentTask.estimated_cost_usd.toFixed(6)}
                    </span>
                  </div>
                </div>

                {/* Caixa de Texto do Resultado */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 max-h-72 overflow-y-auto">
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                    {currentTask.output_result}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                <Bot className="w-10 h-10 text-slate-700 mb-2" />
                <p className="text-xs text-slate-400 font-medium">Nenhuma execução ativa no momento</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Selecione um agente à esquerda, digite sua instrução e clique em disparar.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Padrão ReAct • Asynchronous Job</span>
            <span className="font-mono text-cyan-500/80">Gemini 2.5 Flash</span>
          </div>

        </div>
      </div>

    </div>
  )
}
