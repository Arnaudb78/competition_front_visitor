import { apiFetch } from './api'

export interface ChallengeAnswer {
  text: string
  isCorrect: boolean
}

export interface ChallengeQuestionItem {
  _id: string
  text: string
  ageGroup: string
  answers: ChallengeAnswer[]
}

export interface ChallengeQuestion {
  childQuestion: ChallengeQuestionItem | null
  adultQuestion: ChallengeQuestionItem | null
}

export interface Challenge {
  _id: string
  name: string
  description: string
  imageUrl: string
  questions: ChallengeQuestion[]
  isVisible: boolean
}

export interface ChallengeCompletion {
  _id: string
  challengeId: { _id: string; name: string; imageUrl: string } | string
  score: number
  completedAt: string
}

export interface MyProfile {
  trophies: number
  firstName: string
  age: number
}

export async function getChallenges(): Promise<Challenge[]> {
  try {
    return await apiFetch<Challenge[]>('/challenges')
  } catch {
    return []
  }
}

export async function getChallenge(id: string): Promise<Challenge | null> {
  try {
    return await apiFetch<Challenge>(`/challenges/${id}`)
  } catch {
    return null
  }
}

export async function completeChallenge(id: string, score: number): Promise<void> {
  try {
    await apiFetch<void>(`/challenges/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    })
  } catch {
    // fire & forget — don't crash the UI
  }
}

export async function getMyCompletions(): Promise<ChallengeCompletion[]> {
  try {
    return await apiFetch<ChallengeCompletion[]>('/challenges/completions')
  } catch {
    return []
  }
}

export async function getMyProfile(): Promise<MyProfile | null> {
  try {
    return await apiFetch<MyProfile>('/accounts/me')
  } catch {
    return null
  }
}
