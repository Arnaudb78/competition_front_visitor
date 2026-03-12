const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export interface ParticipantInput {
  name: string;
  age: number;
}

export async function createGroup(participants: ParticipantInput[]): Promise<string> {
  const res = await fetch(`${API}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participants }),
  })
  if (!res.ok) throw new Error('Erreur création groupe')
  const data = await res.json()
  localStorage.setItem('visit_group_id', data._id)
  localStorage.setItem('visit_participants', JSON.stringify(participants.map((p) => p.name)))
  localStorage.setItem('visit_participants_data', JSON.stringify(participants))
  return data._id
}

export function getGroupId(): string | null {
  return localStorage.getItem('visit_group_id')
}

export async function getGroup(id: string) {
  const res = await fetch(`${API}/groups/${id}`)
  if (!res.ok) throw new Error('Groupe introuvable')
  return res.json()
}

export async function addScore(participantName: string, points: number) {
  const id = getGroupId()
  if (!id) return
  await fetch(`${API}/groups/${id}/score`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantName, points }),
  })
}

export async function completeModule(moduleId: number) {
  const id = getGroupId()
  if (!id) return
  await fetch(`${API}/groups/${id}/module`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleId }),
  })
}

export async function endVisit() {
  const id = getGroupId()
  if (!id) return
  await fetch(`${API}/groups/${id}/end`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  })
}
