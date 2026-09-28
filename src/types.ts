export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
export type StepType = 'THOUGHT' | 'TOOL_CALL' | 'TOOL_RESULT' | 'FINAL_ANSWER'

export interface Agent {
  id: string
  name: string
  description?: string
  system_prompt: string
  model: string
  temperature: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  agent_id: string
  input_prompt: string
  status: TaskStatus
  output_result?: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  estimated_cost_usd: number
  duration_ms: number
  error_message?: string
  created_at: string
  finished_at?: string
}

export interface ExecutionTrace {
  id: string
  task_id: string
  step_number: number
  step_type: StepType
  tool_name?: string
  tool_input?: string
  tool_output?: string
  thought_content?: string
  duration_ms: number
  created_at: string
}

export interface ToolUsageStat {
  tool_name: string
  call_count: number
  avg_duration_ms: number
}

export interface AnalyticsOverview {
  total_tasks: number
  completed_tasks: number
  failed_tasks: number
  pending_tasks: number
  success_rate_percent: number
  total_tokens_consumed: number
  total_estimated_cost_usd: number
  avg_duration_ms: number
  top_tools_used: ToolUsageStat[]
}

export interface TaskAcceptedResponse {
  task_id: string
  agent_id: string
  status: TaskStatus
  message: string
  status_url: string
}
