import type {
  Agent,
  AnalyticsOverview,
  ExecutionTrace,
  Task,
  TaskAcceptedResponse,
} from './types'

const API_BASE = '/api/v1'

export async function fetchHealth(): Promise<{ status: string; project: string; version: string }> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error('Falha ao verificar saúde do backend')
  return res.json()
}

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/agents/`)
  if (!res.ok) throw new Error('Falha ao carregar lista de agentes')
  return res.json()
}

export async function createAgent(data: {
  name: string
  description?: string
  system_prompt: string
  model: string
  temperature: number
}): Promise<Agent> {
  const res = await fetch(`${API_BASE}/agents/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Falha ao criar novo agente')
  return res.json()
}

export async function fetchTasks(limit = 20): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks?limit=${limit}`)
  if (!res.ok) throw new Error('Falha ao buscar tarefas recentes')
  return res.json()
}

export async function fetchTask(taskId: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`)
  if (!res.ok) throw new Error(`Falha ao buscar tarefa ${taskId}`)
  return res.json()
}

export async function fetchTaskTraces(taskId: string): Promise<ExecutionTrace[]> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/traces`)
  if (!res.ok) throw new Error(`Falha ao carregar traces da tarefa ${taskId}`)
  return res.json()
}

export async function dispatchTask(agentId: string, inputPrompt: string): Promise<TaskAcceptedResponse> {
  const res = await fetch(`${API_BASE}/agents/${agentId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_prompt: inputPrompt }),
  })
  if (!res.ok) throw new Error('Falha ao despachar tarefa assíncrona')
  return res.json()
}

export async function fetchAnalytics(): Promise<AnalyticsOverview> {
  const res = await fetch(`${API_BASE}/analytics/overview`)
  if (!res.ok) throw new Error('Falha ao carregar métricas analíticas')
  return res.json()
}
