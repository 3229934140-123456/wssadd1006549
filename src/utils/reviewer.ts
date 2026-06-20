import type {
  StudentAnswer,
  StandardAnswer,
  ReviewResult,
  FieldReview,
  MistakeDetail,
  MistakeType,
  AnswerField,
} from '@/types'
import { ANSWER_FIELD_LABELS } from '@/types'

const STRICT_DIAGNOSIS_TERMS = [
  '根尖周炎', '根尖囊肿', '肉芽肿',
  '牙周炎', '牙髓炎', '冠周炎', '骨髓炎',
  '肿瘤', '骨折',
]

function findMissingKeywords(studentText: string, keywords: string[]): string[] {
  return keywords.filter((kw) => !studentText.includes(kw))
}

function checkDisorderedDescription(studentText: string, keywords: string[]): boolean {
  const positions: number[] = []
  for (const kw of keywords) {
    const idx = studentText.indexOf(kw)
    if (idx !== -1) {
      positions.push(idx)
    }
  }
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] < positions[i - 1]) {
      return true
    }
  }
  return false
}

function checkDiagnosisOverreach(
  studentText: string,
  standardFindingsText: string,
): string[] {
  const found: string[] = []
  for (const term of STRICT_DIAGNOSIS_TERMS) {
    if (studentText.includes(term) && !standardFindingsText.includes(term)) {
      found.push(term)
    }
  }
  return found
}

function calculateFieldScore(
  studentText: string,
  keywords: string[],
): { score: number; maxScore: number; matchedKeywords: string[]; missedKeywords: string[] } {
  const maxScore = keywords.length * 5
  const missed = findMissingKeywords(studentText, keywords)
  const matched = keywords.filter((kw) => studentText.includes(kw))
  let score = matched.length * 5

  if (studentText.trim().length === 0) {
    score = 0
  }

  return { score, maxScore, matchedKeywords: matched, missedKeywords: missed }
}

function reviewField(
  field: AnswerField,
  studentAnswer: string,
  standardAnswer: StandardAnswer,
): FieldReview {
  const label = ANSWER_FIELD_LABELS[field]
  const keywords = standardAnswer.keywords[field]
  const standardText = standardAnswer[field]
  const { score, maxScore, missedKeywords } = calculateFieldScore(studentAnswer, keywords)

  const mistakes: MistakeDetail[] = []

  if (field === 'toothPosition' && missedKeywords.length > 0) {
    mistakes.push({
      type: 'missing_tooth' as MistakeType,
      description: `牙位描述中未包含：${missedKeywords.join('、')}`,
      studentContent: studentAnswer,
      standardContent: standardText,
      rewriteSuggestion: `建议改为：${standardText}`,
    })
  }

  if (field === 'imagingFindings') {
    if (missedKeywords.length > 0) {
      mistakes.push({
        type: 'disordered_description' as MistakeType,
        description: `影像所见中遗漏以下关键描述：${missedKeywords.join('、')}`,
        studentContent: studentAnswer,
        standardContent: standardText,
        rewriteSuggestion: `建议补充遗漏项，按「部位→密度改变→范围→边界→邻近结构」顺序描述：${standardText}`,
      })
    }

    const overreachTerms = checkDiagnosisOverreach(studentAnswer, standardAnswer.imagingFindings)
    if (overreachTerms.length > 0) {
      mistakes.push({
        type: 'diagnosis_overreach' as MistakeType,
        description: `影像所见栏中出现了诊断性用语（${overreachTerms.join('、')}），应使用描述性用语`,
        studentContent: studentAnswer,
        standardContent: standardText,
        rewriteSuggestion: `影像所见应描述「看到了什么」而非「是什么病」。例如用「低密度透射影」代替「根尖周炎」，用「根尖区透射影」代替「肉芽肿」`,
      })
    }

    if (checkDisorderedDescription(studentAnswer, keywords)) {
      mistakes.push({
        type: 'disordered_description' as MistakeType,
        description: '影像描述顺序不规范，建议按规范顺序组织描述',
        studentContent: studentAnswer,
        standardContent: standardText,
        rewriteSuggestion: `建议按「部位→密度改变→范围→边界→邻近结构」顺序重新组织描述：${standardText}`,
      })
    }
  }

  if (field === 'preliminaryJudgment' && missedKeywords.length > 0) {
    mistakes.push({
      type: 'disordered_description' as MistakeType,
      description: `初步判断中遗漏关键词：${missedKeywords.join('、')}`,
      studentContent: studentAnswer,
      standardContent: standardText,
      rewriteSuggestion: `建议改为：${standardText}`,
    })
  }

  if (field === 'suggestedTreatment' && missedKeywords.length > 0) {
    const criticalMissed = missedKeywords.filter((kw) =>
      ['根管治疗', '拔除', '充填', '刮治', '翻瓣', 'CBCT'].some((t) => kw.includes(t))
    )
    if (criticalMissed.length > 0 || missedKeywords.length >= 2) {
      mistakes.push({
        type: 'improper_suggestion' as MistakeType,
        description: `建议处理中遗漏重要处理措施：${missedKeywords.join('、')}`,
        studentContent: studentAnswer,
        standardContent: standardText,
        rewriteSuggestion: `建议补充完善：${standardText}`,
      })
    }
  }

  let status: FieldReview['status'] = 'correct'
  if (studentAnswer.trim().length === 0) {
    status = 'wrong'
  } else if (mistakes.length > 0) {
    status = missedKeywords.length >= keywords.length * 0.6 ? 'wrong' : 'partial'
  }

  return {
    field,
    label,
    studentAnswer,
    standardAnswer: standardText,
    score,
    maxScore,
    status,
    mistakes,
  }
}

export function reviewAnswer(
  studentAnswer: StudentAnswer,
  standardAnswer: StandardAnswer,
): ReviewResult {
  const fields: AnswerField[] = [
    'toothPosition',
    'imagingFindings',
    'preliminaryJudgment',
    'suggestedTreatment',
  ]

  const fieldReviews: FieldReview[] = fields.map((field) =>
    reviewField(field, studentAnswer[field], standardAnswer),
  )

  const totalScore = fieldReviews.reduce((sum, r) => sum + r.score, 0)
  const maxScore = fieldReviews.reduce((sum, r) => sum + r.maxScore, 0)
  const percentage = maxScore > 0 ? totalScore / maxScore : 0

  let starRating = 1
  if (percentage >= 0.95) starRating = 5
  else if (percentage >= 0.8) starRating = 4
  else if (percentage >= 0.6) starRating = 3
  else if (percentage >= 0.4) starRating = 2

  return {
    caseId: studentAnswer.caseId,
    studentAnswerId: studentAnswer.id,
    totalScore,
    maxScore,
    starRating,
    fieldReviews,
    timeSpent: studentAnswer.timeSpent,
    hintsUsed: studentAnswer.hintsUsed,
  }
}
