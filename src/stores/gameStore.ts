import { create } from 'zustand'
import type { LevelProgress, MistakeRecord, ReviewResult, StudentAnswer, MistakeType } from '@/types'
import { reviewAnswer } from '@/utils/reviewer'
import { getCaseById } from '@/data/cases'

interface GameState {
  levelProgress: Record<string, LevelProgress>
  mistakes: MistakeRecord[]
  currentReview: ReviewResult | null
  currentAnswer: StudentAnswer | null

  submitAnswer: (answer: StudentAnswer) => ReviewResult
  clearCurrentReview: () => void
  removeMistakesByCase: (caseId: string) => void
  getLevelProgress: (levelId: string) => LevelProgress
  getMistakesByType: (type: MistakeType) => MistakeRecord[]
  getAllMistakes: () => MistakeRecord[]
  getCompletedCaseCount: () => number
  getTotalScore: () => number
  resetProgress: () => void
}

const STORAGE_KEY_PROGRESS = 'dental-progress'
const STORAGE_KEY_MISTAKES = 'dental-mistakes'

function loadProgress(): Record<string, LevelProgress> {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PROGRESS)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveProgress(progress: Record<string, LevelProgress>) {
  localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress))
}

function loadMistakes(): MistakeRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MISTAKES)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveMistakes(mistakes: MistakeRecord[]) {
  localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(mistakes))
}

export const useGameStore = create<GameState>((set, get) => ({
  levelProgress: loadProgress(),
  mistakes: loadMistakes(),
  currentReview: null,
  currentAnswer: null,

  submitAnswer: (answer: StudentAnswer) => {
    const caseData = getCaseById(answer.caseId)
    if (!caseData) throw new Error('Case not found')

    const result = reviewAnswer(answer, caseData.standardAnswer)

    const levelId = caseData.levelId
    const progress = { ...get().levelProgress }
    const levelProg = progress[levelId] || {
      levelId,
      completedCaseIds: [],
      bestScores: {} as Record<string, number>,
      bestStars: {} as Record<string, number>,
    }

    if (!levelProg.completedCaseIds.includes(answer.caseId)) {
      levelProg.completedCaseIds = [...levelProg.completedCaseIds, answer.caseId]
    }

    const prevScore = levelProg.bestScores[answer.caseId] || 0
    if (result.totalScore > prevScore) {
      levelProg.bestScores = { ...levelProg.bestScores, [answer.caseId]: result.totalScore }
    }

    const prevStar = levelProg.bestStars[answer.caseId] || 0
    if (result.starRating > prevStar) {
      levelProg.bestStars = { ...levelProg.bestStars, [answer.caseId]: result.starRating }
    }

    progress[levelId] = levelProg
    saveProgress(progress)

    const newMistakes: MistakeRecord[] = result.fieldReviews
      .filter((fr) => fr.mistakes.length > 0)
      .flatMap((fr) =>
        fr.mistakes.map((m) => ({
          id: `${answer.id}-${fr.field}-${m.type}`,
          caseId: answer.caseId,
          levelId,
          caseTitle: caseData.title,
          mistakeType: m.type,
          field: fr.field,
          studentContent: m.studentContent,
          standardContent: m.standardContent,
          rewriteSuggestion: m.rewriteSuggestion,
          createdAt: answer.submittedAt,
          studentAnswerId: answer.id,
        })),
      )

    let allMistakes = get().mistakes.filter((m) => m.studentAnswerId !== answer.id)
    allMistakes = [...allMistakes, ...newMistakes]
    saveMistakes(allMistakes)

    set({
      levelProgress: progress,
      mistakes: allMistakes,
      currentReview: result,
      currentAnswer: answer,
    })

    return result
  },

  clearCurrentReview: () => set({ currentReview: null, currentAnswer: null }),

  removeMistakesByCase: (caseId: string) => {
    const filtered = get().mistakes.filter((m) => m.caseId !== caseId)
    saveMistakes(filtered)
    set({ mistakes: filtered })
  },

  getLevelProgress: (levelId: string) => {
    return get().levelProgress[levelId] || {
      levelId,
      completedCaseIds: [],
      bestScores: {},
      bestStars: {},
    }
  },

  getMistakesByType: (type: MistakeType) => {
    return get().mistakes.filter((m) => m.mistakeType === type)
  },

  getAllMistakes: () => get().mistakes,

  getCompletedCaseCount: () => {
    const progress = get().levelProgress
    let count = 0
    for (const lp of Object.values(progress)) {
      count += lp.completedCaseIds.length
    }
    return count
  },

  getTotalScore: () => {
    const progress = get().levelProgress
    let total = 0
    for (const lp of Object.values(progress)) {
      for (const score of Object.values(lp.bestScores)) {
        total += score
      }
    }
    return total
  },

  resetProgress: () => {
    localStorage.removeItem(STORAGE_KEY_PROGRESS)
    localStorage.removeItem(STORAGE_KEY_MISTAKES)
    set({
      levelProgress: {},
      mistakes: [],
      currentReview: null,
      currentAnswer: null,
    })
  },
}))
