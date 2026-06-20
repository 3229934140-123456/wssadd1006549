export interface Level {
  id: string
  title: string
  description: string
  icon: string
  order: number
}

export interface CaseData {
  id: string
  levelId: string
  title: string
  imageUrl: string
  chiefComplaint: string
  patientInfo: string
  standardAnswer: StandardAnswer
  hints: CaseHints
}

export interface StandardAnswer {
  toothPosition: string
  imagingFindings: string
  preliminaryJudgment: string
  suggestedTreatment: string
  keywords: AnswerKeywords
}

export interface AnswerKeywords {
  toothPosition: string[]
  imagingFindings: string[]
  preliminaryJudgment: string[]
  suggestedTreatment: string[]
}

export interface CaseHints {
  toothPosition: string
  observationOrder: string
  judgment: string
}

export type HintType = 'toothPosition' | 'observationOrder' | 'judgment'

export interface StudentAnswer {
  id: string
  caseId: string
  toothPosition: string
  imagingFindings: string
  preliminaryJudgment: string
  suggestedTreatment: string
  timeSpent: number
  submittedAt: string
  hintsUsed: HintType[]
}

export type AnswerField = 'toothPosition' | 'imagingFindings' | 'preliminaryJudgment' | 'suggestedTreatment'

export interface FieldReview {
  field: AnswerField
  label: string
  studentAnswer: string
  standardAnswer: string
  score: number
  maxScore: number
  status: 'correct' | 'partial' | 'wrong'
  mistakes: MistakeDetail[]
}

export interface MistakeDetail {
  type: MistakeType
  description: string
  studentContent: string
  standardContent: string
  rewriteSuggestion: string
}

export type MistakeType = 'missing_tooth' | 'disordered_description' | 'diagnosis_overreach' | 'improper_suggestion'

export interface ReviewResult {
  caseId: string
  studentAnswerId: string
  totalScore: number
  maxScore: number
  starRating: number
  fieldReviews: FieldReview[]
  timeSpent: number
  hintsUsed: HintType[]
}

export interface MistakeRecord {
  id: string
  caseId: string
  levelId: string
  caseTitle: string
  mistakeType: MistakeType
  field: AnswerField
  studentContent: string
  standardContent: string
  rewriteSuggestion: string
  createdAt: string
  studentAnswerId: string
  mastered: boolean
  masteredAt: string | null
}

export interface LevelProgress {
  levelId: string
  completedCaseIds: string[]
  bestScores: Record<string, number>
  bestStars: Record<string, number>
}

export interface AnswerHistoryRecord {
  id: string
  caseId: string
  levelId: string
  totalScore: number
  maxScore: number
  starRating: number
  timeSpent: number
  hintsUsed: HintType[]
  mistakeTypes: MistakeType[]
  submittedAt: string
}

export const MISTAKE_TYPE_LABELS: Record<MistakeType, string> = {
  missing_tooth: '漏写牙位',
  disordered_description: '描述顺序不清',
  diagnosis_overreach: '影像表现写成确诊',
  improper_suggestion: '建议处理不当',
}

export const ANSWER_FIELD_LABELS: Record<AnswerField, string> = {
  toothPosition: '牙位',
  imagingFindings: '影像所见',
  preliminaryJudgment: '初步判断',
  suggestedTreatment: '建议处理',
}

export const HINT_TYPE_LABELS: Record<HintType, string> = {
  toothPosition: '牙位提示',
  observationOrder: '观察顺序提示',
  judgment: '判断提示',
}
