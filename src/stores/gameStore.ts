import { create } from 'zustand'
import type {
  LevelProgress,
  MistakeRecord,
  ReviewResult,
  StudentAnswer,
  MistakeType,
  AnswerHistoryRecord,
  HintType,
} from '@/types'
import { reviewAnswer } from '@/utils/reviewer'
import { getCaseById } from '@/data/cases'

interface GameState {
  levelProgress: Record<string, LevelProgress>
  mistakes: MistakeRecord[]
  answerHistory: AnswerHistoryRecord[]
  currentReview: ReviewResult | null
  currentAnswer: StudentAnswer | null
  currentHintsUsed: HintType[]

  submitAnswer: (answer: StudentAnswer) => ReviewResult
  clearCurrentReview: () => void
  setCurrentHintsUsed: (hints: HintType[]) => void
  removeMistakesByCase: (caseId: string) => void
  markMistakeMastered: (mistakeId: string) => void
  markCaseMastered: (caseId: string) => void
  getLevelProgress: (levelId: string) => LevelProgress
  getMistakesByType: (type: MistakeType) => MistakeRecord[]
  getMistakesByCase: (caseId: string) => MistakeRecord[]
  getAllMistakes: () => MistakeRecord[]
  getPendingMistakes: () => MistakeRecord[]
  getMasteredMistakes: () => MistakeRecord[]
  isCaseMastered: (caseId: string) => boolean
  getCompletedCaseCount: () => number
  getTotalScore: () => number
  getHistoryByLevel: (levelId: string) => AnswerHistoryRecord[]
  getHistoryByCase: (caseId: string) => AnswerHistoryRecord[]
  resetProgress: () => void
}

const STORAGE_KEY_PROGRESS = 'dental-progress'
const STORAGE_KEY_MISTAKES = 'dental-mistakes'
const STORAGE_KEY_HISTORY = 'dental-history'

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

function loadHistory(): AnswerHistoryRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_HISTORY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveHistory(history: AnswerHistoryRecord[]) {
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history))
}

export const useGameStore = create<GameState>((set, get) => ({
  levelProgress: loadProgress(),
  mistakes: loadMistakes(),
  answerHistory: loadHistory(),
  currentReview: null,
  currentAnswer: null,
  currentHintsUsed: [],

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

    const mistakeTypes = result.fieldReviews
      .flatMap((fr) => fr.mistakes.map((m) => m.type))

    const historyRecord: AnswerHistoryRecord = {
      id: answer.id,
      caseId: answer.caseId,
      levelId,
      totalScore: result.totalScore,
      maxScore: result.maxScore,
      starRating: result.starRating,
      timeSpent: answer.timeSpent,
      hintsUsed: answer.hintsUsed,
      mistakeTypes,
      submittedAt: answer.submittedAt,
    }

    const newHistory = [...get().answerHistory, historyRecord]
    saveHistory(newHistory)

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
          mastered: false,
          masteredAt: null,
        })),
      )

    let allMistakes = get().mistakes.filter((m) => m.studentAnswerId !== answer.id)
    allMistakes = [...allMistakes, ...newMistakes]
    saveMistakes(allMistakes)

    set({
      levelProgress: progress,
      mistakes: allMistakes,
      answerHistory: newHistory,
      currentReview: result,
      currentAnswer: answer,
    })

    return result
  },

  clearCurrentReview: () => set({ currentReview: null, currentAnswer: null, currentHintsUsed: [] }),

  setCurrentHintsUsed: (hints: HintType[]) => set({ currentHintsUsed: hints }),

  removeMistakesByCase: (caseId: string) => {
    const filtered = get().mistakes.filter((m) => m.caseId !== caseId)
    saveMistakes(filtered)
    set({ mistakes: filtered })
  },

  markMistakeMastered: (mistakeId: string) => {
    const updated = get().mistakes.map((m) =>
      m.id === mistakeId ? { ...m, mastered: true, masteredAt: new Date().toISOString() } : m
    )
    saveMistakes(updated)
    set({ mistakes: updated })
  },

  markCaseMastered: (caseId: string) => {
    const updated = get().mistakes.map((m) =>
      m.caseId === caseId ? { ...m, mastered: true, masteredAt: new Date().toISOString() } : m
    )
    saveMistakes(updated)
    set({ mistakes: updated })
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

  getMistakesByCase: (caseId: string) => {
    return get().mistakes.filter((m) => m.caseId === caseId)
  },

  getAllMistakes: () => get().mistakes,

  getPendingMistakes: () => get().mistakes.filter((m) => !m.mastered),

  getMasteredMistakes: () => get().mistakes.filter((m) => m.mastered),

  isCaseMastered: (caseId: string) => {
    const caseMistakes = get().mistakes.filter((m) => m.caseId === caseId)
    if (caseMistakes.length === 0) return false
    return caseMistakes.every((m) => m.mastered)
  },

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

  getHistoryByLevel: (levelId: string) => {
    return get().answerHistory.filter((h) => h.levelId === levelId)
  },

  getHistoryByCase: (caseId: string) => {
    return get().answerHistory.filter((h) => h.caseId === caseId)
  },

  resetProgress: () => {
    localStorage.removeItem(STORAGE_KEY_PROGRESS)
    localStorage.removeItem(STORAGE_KEY_MISTAKES)
    localStorage.removeItem(STORAGE_KEY_HISTORY)
    set({
      levelProgress: {},
      mistakes: [],
      answerHistory: [],
      currentReview: null,
      currentAnswer: null,
      currentHintsUsed: [],
    })
  },
}))
