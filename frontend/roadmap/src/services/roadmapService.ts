const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export interface RoadmapStageInput {
  title: string
  description?: string
  order_index?: number
  tasks?: {
    title: string
    description?: string
    resource_link?: string
    is_optional?: boolean
    order_index?: number
  }[]
}

export interface RoadmapInput {
  user_id?: string | null
  current_role?: string
  target_role?: string
  known_skills?: string[]
  expected_salary?: number
  stages?: RoadmapStageInput[]
}

export async function createRoadmap(payload: RoadmapInput) {
  const res = await fetch(`${API_BASE}/api/roadmaps/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to create roadmap')
  return json
}

export async function fetchRoadmap(id: string) {
  const res = await fetch(`${API_BASE}/api/roadmaps/${id}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to fetch roadmap')
  return json.roadmap
}
