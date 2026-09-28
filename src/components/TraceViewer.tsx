import React, { useState, useEffect } from 'react'
import {
  Activity,
  Brain,
  Wrench,
  Terminal,
  CheckCircle,
  Clock,
  Coins,
  Layers,
  ChevronRight,
  Loader2
} from 'lucide-react'
import type { ExecutionTrace, Task } from '../types'
import { fetchTaskTraces } from '../api'

interface TraceViewerProps {
  tasks: Task[]
  selectedTaskId: string | null
  onSelectTask: (taskId: string) => void
}

export const TraceViewer: React.FC<TraceViewerProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask
}) => {
  const [traces, setTraces] = useState<ExecutionTrace[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const currentTaskId = selectedTaskId || (tasks.length > 0 ? tasks[0].id : '')
  const currentTask = tasks.find(t => t.id === currentTaskId)

  useEffect(() => {
    if (!currentTaskId) return

    setIsLoading(true)
    fetchTaskTraces(currentTaskId)
      .then((data) => {
        setTraces(data)
        setIsLoading(false)
      })
      .catch(() => {
        setTraces([])
        setIsLoading(false)
      })
  }, [currentTaskId])

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'THOUGHT':
        return <Brain className="w-4 h-4 text-purple-400" />
      case 'TOOL_CALL':
        return <Wrench className="w-4 h-4 text-cyan-400" />
      case 'TOOL_RESULT':
        return <Terminal className="w-4 h-4 text-amber-400" />
      case 'FINAL_ANSWER':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      default:
        return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  const getStepBadge = (type: string) => {
    switch (type) {
      case 'THOUGHT':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60'
      case 'TOOL_CALL':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
      case 'TOOL_RESULT':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60'
      case 'FINAL_ANSWER':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Seletor de Tarefas */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-lg backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Observabilidade & Tracing (Estilo Langfuse)</h2>
            <p className="text-xs text-slate-400">Inspecione cada decisão, ferramenta e raciocínio do agente</p>
          </div>
        </div>

        {/* Seletor de Tarefa */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Tarefa:</span>
          <select
            value={currentTaskId}
            onChange={(e) => onSelectTask(e.target.value)}
            className="w-full sm:w-72 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.input_prompt.slice(0, 30)}... ({task.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Principal: Timeline de Traces & Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timeline dos Passos (8 Colunas) */}
        <div className="lg:col-span-8 space-y-4">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center border border-slate-800 rounded-2xl bg-slate-900/30">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
              <span className="text-xs text-slate-400">Carregando árvore de traces...</span>
            </div>
          ) : traces.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
              <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Nenhum trace encontrado para esta tarefa.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {traces.map((trace) => (
                <div
                  key={trace.id}
                  className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700"
                >
                  {/* Ponto indicador na linha da timeline */}
                  <div className="absolute -left-[31px] top-6 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-500 shadow-sm" />

                  {/* Cabeçalho do Passo */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                        {getStepIcon(trace.step_type)}
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        Passo #{trace.step_number}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getStepBadge(trace.step_type)}`}>
                        {trace.step_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span>{trace.duration_ms} ms</span>
                    </div>
                  </div>

                  {/* Conteúdo do Passo */}
                  {trace.thought_content && (
                    <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] font-mono text-purple-400 block mb-1 uppercase font-semibold">
                        Raciocínio Interno:
                      </span>
                      {trace.thought_content}
                    </div>
                  )}

                  {trace.tool_name && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Ferramenta acionada:</span>
                        <code className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono text-[11px]">
                          {trace.tool_name}()
                        </code>
                      </div>

                      {trace.tool_input && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-cyan-200 overflow-x-auto">
                          <span className="text-[10px] text-slate-500 block mb-1 uppercase">Entrada (Arguments):</span>
                          {trace.tool_input}
                        </div>
                      )}

                      {trace.tool_output && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-amber-200 overflow-x-auto">
                          <span className="text-[10px] text-slate-500 block mb-1 uppercase">Retorno (Output):</span>
                          {trace.tool_output}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Painel Lateral: Metadados da Execução (4 Colunas) */}
        <div className="lg:col-span-4 space-y-4">
          {currentTask ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg backdrop-blur-sm space-y-4 sticky top-24">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Metadados da Tarefa
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">ID da Execução:</span>
                  <code className="text-slate-300 font-mono text-[11px]">{currentTask.id}</code>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Status:</span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    {currentTask.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tokens Prompt:</span>
                    <span className="text-slate-300">{currentTask.prompt_tokens}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tokens Resposta:</span>
                    <span className="text-slate-300">{currentTask.completion_tokens}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5">
                    <span className="text-slate-400 font-bold">Total Tokens:</span>
                    <span className="text-cyan-400 font-bold">{currentTask.total_tokens}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Custo Estimado:</span>
                    <span className="text-purple-400 font-bold">${currentTask.estimated_cost_usd.toFixed(6)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px] mb-1">Prompt Enviado:</span>
                  <p className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    "{currentTask.input_prompt}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 text-center text-xs text-slate-500">
              Selecione uma tarefa para inspecionar os metadados.
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
