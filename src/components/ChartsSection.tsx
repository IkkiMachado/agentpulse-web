import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Wrench, PieChart, ShieldCheck } from 'lucide-react'
import type { AnalyticsOverview } from '../types'

interface ChartsSectionProps {
  analytics: AnalyticsOverview | null
}

const COLORS = ['#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#f59e0b']

export const ChartsSection: React.FC<ChartsSectionProps> = ({ analytics }) => {
  if (!analytics) return null

  const toolData = analytics.top_tools_used.length > 0
    ? analytics.top_tools_used.map(t => ({
        name: t.tool_name,
        chamadas: t.call_count,
        latencia: t.avg_duration_ms
      }))
    : [
        { name: 'search_knowledge_base', chamadas: 2, latencia: 120 },
        { name: 'calculate_math', chamadas: 0, latencia: 0 },
        { name: 'get_stock_price', chamadas: 0, latencia: 0 }
      ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Gráfico de Uso de Ferramentas */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Ferramentas Mais Acionadas (Tool Calls)</h3>
              <p className="text-xs text-slate-400">Frequência de disparo e orquestração de ferramentas no ciclo ReAct</p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800/80 text-cyan-400 border border-slate-700">
            Top Tools
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={toolData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
                formatter={(value: any, name: any) => [
                  name === 'chamadas' ? `${value} execuções` : `${value} ms`,
                  name === 'chamadas' ? 'Total Chamadas' : 'Latência Média'
                ]}
              />
              <Bar dataKey="chamadas" radius={[0, 6, 6, 0]}>
                {toolData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card de Governança & Eficiência */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Governança & Telemetria</h3>
              <p className="text-xs text-slate-400">Controle de qualidade das execuções</p>
            </div>
          </div>

          <div className="space-y-4 my-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Eficiência de Tokens</span>
                <span className="text-cyan-400 font-mono font-medium">
                  {analytics.completed_tasks > 0 
                    ? `${(analytics.total_tokens_consumed / analytics.completed_tasks).toFixed(0)} tokens/task`
                    : '0 tokens/task'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Custo Médio por Requisição</span>
                <span className="text-purple-400 font-mono font-medium">
                  {analytics.completed_tasks > 0
                    ? `$${(analytics.total_estimated_cost_usd / analytics.completed_tasks).toFixed(6)}`
                    : '$0.000000'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Confiabilidade do Modelo</span>
                <span className="text-emerald-400 font-mono font-medium">
                  {analytics.success_rate_percent}% de sucesso
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${analytics.success_rate_percent}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-slate-500" />
            Dados em tempo real
          </span>
          <span className="text-slate-500 font-mono">SQLite / PostgreSQL</span>
        </div>
      </div>

    </div>
  )
}
