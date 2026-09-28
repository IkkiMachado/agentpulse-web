import React from 'react'
import { CheckCircle2, Clock, Coins, Flame, Layers } from 'lucide-react'
import type { AnalyticsOverview } from '../types'

interface MetricsCardsProps {
  analytics: AnalyticsOverview | null
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ analytics }) => {
  if (!analytics) return null

  const cards = [
    {
      title: 'Total de Execuções',
      value: analytics.total_tasks,
      subValue: `${analytics.completed_tasks} concluídas • ${analytics.failed_tasks} falhas`,
      icon: Layers,
      color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
      badge: 'Job Queue',
    },
    {
      title: 'Taxa de Sucesso',
      value: `${analytics.success_rate_percent.toFixed(1)}%`,
      subValue: analytics.total_tasks > 0 ? 'Confiabilidade em produção' : 'Aguardando tarefas',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: 'SLA',
    },
    {
      title: 'Latência Média',
      value: `${analytics.avg_duration_ms.toFixed(0)} ms`,
      subValue: 'Tempo de resposta do agente',
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      badge: 'Performance',
    },
    {
      title: 'Custo Total Estimado',
      value: `$${analytics.total_estimated_cost_usd.toFixed(6)}`,
      subValue: 'Tarifação baseada em uso (USD)',
      icon: Coins,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      badge: 'LLMOps',
    },
    {
      title: 'Tokens Consumidos',
      value: analytics.total_tokens_consumed.toLocaleString('pt-BR'),
      subValue: 'Prompt + Completion',
      icon: Flame,
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
      badge: 'Telemetry',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700/80 hover:bg-slate-900/60"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                {card.badge}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold tracking-tight text-white font-mono">
                  {card.value}
                </div>
                <div className="text-xs text-slate-400 mt-1">{card.subValue}</div>
              </div>

              <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
