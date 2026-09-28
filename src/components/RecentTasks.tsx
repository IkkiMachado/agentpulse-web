import React from 'react'
import { CheckCircle2, Clock, Eye, Layers, XCircle, ArrowUpRight } from 'lucide-react'
import type { Task } from '../types'

interface RecentTasksProps {
  tasks: Task[]
  onSelectTask: (taskId: string) => void
}

export const RecentTasks: React.FC<RecentTasksProps> = ({ tasks, onSelectTask }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            COMPLETED
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-rose-950/80 text-rose-300 border border-rose-800">
            <XCircle className="w-3 h-3 text-rose-400" />
            FAILED
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-800">
            <Clock className="w-3 h-3 text-amber-400 animate-spin" />
            {status}
          </span>
        )
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Histórico de Execuções Recentes</h2>
          <p className="text-xs text-slate-400">Acompanhe tarefas assíncronas despachadas para os agentes</p>
        </div>
        <span className="text-xs font-mono text-slate-500">
          Total: {tasks.length} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Task ID</th>
              <th className="px-4 py-3">Prompt da Missão</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Duração</th>
              <th className="px-4 py-3">Tokens</th>
              <th className="px-4 py-3">Custo (USD)</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-mono text-slate-400">
                  {task.id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-slate-200">
                  {task.input_prompt}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(task.status)}
                </td>
                <td className="px-4 py-3 font-mono text-slate-400">
                  {task.duration_ms} ms
                </td>
                <td className="px-4 py-3 font-mono text-cyan-400">
                  {task.total_tokens}
                </td>
                <td className="px-4 py-3 font-mono text-purple-400">
                  ${task.estimated_cost_usd.toFixed(6)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSelectTask(task.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-all"
                  >
                    <span>Traces</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
