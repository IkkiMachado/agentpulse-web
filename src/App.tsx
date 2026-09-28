import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { MetricsCards } from './components/MetricsCards'
import { ChartsSection } from './components/ChartsSection'
import { Playground } from './components/Playground'
import { TraceViewer } from './components/TraceViewer'
import { RecentTasks } from './components/RecentTasks'
import type { Agent, AnalyticsOverview, Task } from './types'
import {
  fetchHealth,
  fetchAgents,
  fetchTasks,
  fetchAnalytics,
  createAgent
} from './api'
import { RefreshCw } from 'lucide-react'

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'playground' | 'traces' | 'tasks'>('dashboard')
  const [isOnline, setIsOnline] = useState<boolean>(false)
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Carrega os dados da API
  const loadData = async () => {
    setIsRefreshing(true)
    try {
      await fetchHealth()
      setIsOnline(true)

      const [agentsData, tasksData, analyticsData] = await Promise.all([
        fetchAgents(),
        fetchTasks(30),
        fetchAnalytics()
      ])

      // Se não houver nenhum agente cadastrado ainda, cria um padrão
      if (agentsData.length === 0) {
        const defaultAgent = await createAgent({
          name: 'Especialista em Tendências & IA',
          description: 'Agente padrão para análises e projeções de mercado',
          system_prompt: 'Você é um analista sênior de inteligência artificial e novas tecnologias.',
          model: 'gemini-2.5-flash',
          temperature: 0.3
        })
        setAgents([defaultAgent])
      } else {
        setAgents(agentsData)
      }

      setTasks(tasksData)
      setAnalytics(analyticsData)
    } catch (err) {
      setIsOnline(false)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    // Atualização periódica leve a cada 10 segundos
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleTaskCompleted = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev.filter(t => t.id !== newTask.id)])
    loadData()
  }

  const handleViewTraces = (taskId: string) => {
    setSelectedTaskId(taskId)
    setActiveTab('traces')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header Fixo */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner de Aviso caso o Backend esteja offline */}
        {!isOnline && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between shadow-lg">
            <div>
              <strong>Atenção:</strong> O backend FastAPI não está respondendo em <code className="font-mono bg-rose-950 px-1 py-0.5 rounded">http://localhost:8000</code>.
              Inicie a API com <code className="font-mono bg-rose-950 px-1 py-0.5 rounded">uvicorn app.main:app --port 8000</code> para habilitar dados em tempo real.
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 border border-rose-700 text-xs font-medium cursor-pointer"
            >
              Reconectar
            </button>
          </div>
        )}

        {/* Barra de Ações Rápidas */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white capitalize">
              {activeTab === 'dashboard' && 'Dashboard de Telemetria & LLMOps'}
              {activeTab === 'playground' && 'Playground de Execução de Agentes'}
              {activeTab === 'traces' && 'Árvore de Traces & Observabilidade ReAct'}
              {activeTab === 'tasks' && 'Histórico de Tarefas & Auditoria'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Orquestração assíncrona, medição de custos e monitoramento contínuo
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Atualizar dados agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <MetricsCards analytics={analytics} />
            <ChartsSection analytics={analytics} />
            <RecentTasks tasks={tasks.slice(0, 5)} onSelectTask={handleViewTraces} />
          </div>
        )}

        {/* Tab: Playground */}
        {activeTab === 'playground' && (
          <div className="space-y-8">
            <MetricsCards analytics={analytics} />
            <Playground
              agents={agents}
              onTaskCompleted={handleTaskCompleted}
              onViewTraces={handleViewTraces}
            />
          </div>
        )}

        {/* Tab: Traces & ReAct */}
        {activeTab === 'traces' && (
          <TraceViewer
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
          />
        )}

        {/* Tab: Tarefas */}
        {activeTab === 'tasks' && (
          <RecentTasks tasks={tasks} onSelectTask={handleViewTraces} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <p>⚡ AgentPulse Platform • Desenvolvido por Henrique Machado • 2026</p>
      </footer>

    </div>
  )
}

export default App
