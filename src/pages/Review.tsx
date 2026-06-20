import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Trophy,
  RotateCcw,
} from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { getCaseById } from '@/data/cases'
import { MISTAKE_TYPE_LABELS, ANSWER_FIELD_LABELS } from '@/types'
import type { FieldReview, MistakeDetail } from '@/types'

const STATUS_CONFIG = {
  correct: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: '✓' },
  partial: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: '△' },
  wrong: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: '✗' },
} as const

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={28}
          className={`transition-all duration-300 ${
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-none text-gray-300'
          }`}
          style={i < rating ? { animationDelay: `${i * 0.15}s` } : undefined}
        />
      ))}
    </div>
  )
}

function ScoreDisplay({ score, maxScore }: { score: number; maxScore: number }) {
  const [displayed, setDisplayed] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const duration = 1200
    const steps = 40
    const increment = score / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= score) {
        current = score
        clearInterval(interval)
        setRevealed(true)
      }
      setDisplayed(Math.round(current))
    }, duration / steps)
    return () => clearInterval(interval)
  }, [score])

  return (
    <div className="animate-scale-in text-center">
      <div className="font-serif font-bold tracking-tight" style={{ fontSize: '4rem', lineHeight: 1 }}>
        <span className={revealed ? 'text-primary' : 'text-primary/70'}>{displayed}</span>
        <span className="text-3xl text-gray-400 font-normal">/{maxScore}</span>
      </div>
    </div>
  )
}

function MistakeTypeBadge({ type }: { type: MistakeDetail['type'] }) {
  const label = MISTAKE_TYPE_LABELS[type]
  const colorMap: Record<string, string> = {
    missing_tooth: 'bg-red-100 text-red-700 border-red-200',
    disordered_description: 'bg-amber-100 text-amber-700 border-amber-200',
    diagnosis_overreach: 'bg-purple-100 text-purple-700 border-purple-200',
    improper_suggestion: 'bg-orange-100 text-orange-700 border-orange-200',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[type] ?? 'bg-gray-100 text-gray-700'}`}>
      {label}
    </span>
  )
}

function ErrorDetail({ mistake }: { mistake: MistakeDetail }) {
  const [expanded, setExpanded] = useState(false)

  const parts = mistake.rewriteSuggestion.split(/(「[^」]+」)/g)

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark transition-colors"
      >
        <Lightbulb size={14} />
        <span>{expanded ? '收起详情' : '查看详情'}</span>
        <RotateCcw
          size={12}
          className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="mt-2.5 space-y-2 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <MistakeTypeBadge type={mistake.type} />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{mistake.description}</p>
          <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3">
            <p className="text-sm leading-relaxed text-gray-700">
              {parts.map((part, i) => {
                if (part.startsWith('「') && part.endsWith('」')) {
                  return (
                    <span key={i} className="bg-blue-200/50 text-blue-800 font-medium rounded px-0.5">
                      {part}
                    </span>
                  )
                }
                return <span key={i}>{part}</span>
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function FieldCard({ review, index }: { review: FieldReview; index: number }) {
  const config = STATUS_CONFIG[review.status]
  const StatusIcon = config.icon

  return (
    <div
      className={`card animate-fade-in-up stagger-${index + 1} border ${config.border} ${config.bg}/40`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif font-semibold text-lg text-gray-800">
          {ANSWER_FIELD_LABELS[review.field]}
        </h3>
        <div className="flex items-center gap-2">
          <StatusIcon size={20} className={config.color} />
          <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
          <span className="text-sm text-gray-500">
            {review.score}/{review.maxScore}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-dental-bg p-3">
          <p className="text-xs text-gray-400 mb-1 font-medium">你的回答</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {review.studentAnswer || <span className="text-gray-300 italic">未作答</span>}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50/50 p-3">
          <p className="text-xs text-gray-400 mb-1 font-medium">标准答案</p>
          <p className="text-sm text-gray-700 leading-relaxed">{review.standardAnswer}</p>
        </div>
      </div>

      {review.mistakes.length > 0 && (
        <div className="mt-3 border-t border-dental-border pt-3">
          {review.mistakes.map((m, i) => (
            <ErrorDetail key={i} mistake={m} />
          ))}
        </div>
      )}
    </div>
  )
}

function CelebrationMessage() {
  return (
    <div className="animate-scale-in text-center py-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-4">
        <Trophy size={40} className="text-amber-500" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-primary mb-2">满分通过！</h2>
      <p className="text-gray-500">所有字段均完全正确，表现非常出色！</p>
    </div>
  )
}

export default function Review() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const currentReview = useGameStore((s) => s.currentReview)
  const currentAnswer = useGameStore((s) => s.currentAnswer)
  const clearCurrentReview = useGameStore((s) => s.clearCurrentReview)

  const caseData = caseId ? getCaseById(caseId) : undefined
  const isAllCorrect = currentReview
    ? currentReview.fieldReviews.every((f) => f.status === 'correct')
    : false

  useEffect(() => {
    return () => {
      clearCurrentReview()
    }
  }, [clearCurrentReview])

  if (!currentReview || !currentAnswer) {
    return (
      <div className="min-h-screen bg-dental-bg flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <p className="text-gray-400 mb-4">暂无评审结果</p>
          <button onClick={() => navigate('/')} className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dental-bg pb-12">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="text-center mb-8 animate-fade-in-up">
          {caseData && (
            <p className="text-sm text-gray-400 mb-1">{caseData.title}</p>
          )}
          <ScoreDisplay score={currentReview.totalScore} maxScore={currentReview.maxScore} />
          <div className="mt-3 flex items-center justify-center gap-4">
            <StarRating rating={currentReview.starRating} />
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <RotateCcw size={14} />
              {formatTime(currentReview.timeSpent)}
            </span>
          </div>
        </div>

        {isAllCorrect && <CelebrationMessage />}

        <div className="space-y-4">
          {currentReview.fieldReviews.map((review, i) => (
            <FieldCard key={review.field} review={review} index={i} />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 animate-fade-in-up stagger-4">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            返回关卡
          </button>
          <button
            onClick={() => navigate('/mistakes')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <BookOpen size={16} />
            查看错题本
          </button>
        </div>
      </div>
    </div>
  )
}
