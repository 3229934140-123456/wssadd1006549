import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Send, ZoomIn, User, Stethoscope } from 'lucide-react'
import { getCaseById } from '@/data/cases'
import { useGameStore } from '@/stores/gameStore'
import type { AnswerField, StudentAnswer } from '@/types'
import { ANSWER_FIELD_LABELS } from '@/types'

const HINTS: Record<AnswerField, string> = {
  toothPosition: '如：16远中邻面',
  imagingFindings: '描述你在影像上看到的异常表现...',
  preliminaryJudgment: '基于影像所见做出的判断...',
  suggestedTreatment: '建议的后续处理方案...',
}

const FIELDS: AnswerField[] = ['toothPosition', 'imagingFindings', 'preliminaryJudgment', 'suggestedTreatment']

export default function Practice() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const submitAnswer = useGameStore((s) => s.submitAnswer)
  const clearCurrentReview = useGameStore((s) => s.clearCurrentReview)

  const caseData = caseId ? getCaseById(caseId) : undefined

  const [form, setForm] = useState<Record<AnswerField, string>>({
    toothPosition: '',
    imagingFindings: '',
    preliminaryJudgment: '',
    suggestedTreatment: '',
  })
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [isHovering, setIsHovering] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  useEffect(() => {
    clearCurrentReview()
  }, [clearCurrentReview])

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewerRef.current) return
    const rect = viewerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }, [])

  const handleFieldChange = useCallback((field: AnswerField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(() => {
    if (!caseId || isSubmitting) return
    const hasContent = FIELDS.some((f) => form[f].trim().length > 0)
    if (!hasContent) return

    setIsSubmitting(true)
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)

    const answer: StudentAnswer = {
      id,
      caseId,
      toothPosition: form.toothPosition.trim(),
      imagingFindings: form.imagingFindings.trim(),
      preliminaryJudgment: form.preliminaryJudgment.trim(),
      suggestedTreatment: form.suggestedTreatment.trim(),
      timeSpent,
      submittedAt: new Date().toISOString(),
    }

    submitAnswer(answer)
    navigate(`/review/${caseId}`)
  }, [caseId, form, isSubmitting, startTime, submitAnswer, navigate])

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen dental-bg">
        <div className="card p-8 text-center">
          <p className="text-lg text-primary font-serif">未找到该病例</p>
          <button className="btn-primary mt-4" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dental-bg">
      <div className="flex items-center justify-between px-4 py-3 border-b dental-border bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <button
          className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">返回</span>
        </button>
        <h1 className="font-serif text-lg font-semibold text-primary truncate mx-4">{caseData.title}</h1>
        <div className="flex items-center gap-2 text-primary font-mono text-sm bg-primary/5 px-3 py-1.5 rounded-lg">
          <Clock className="w-4 h-4" />
          <span>{formatTime(elapsed)}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-[1440px] mx-auto">
        <div className="lg:w-3/5 flex flex-col gap-3">
          <div
            ref={viewerRef}
            className="relative bg-[#1a1a2e] rounded-xl overflow-hidden border-4 border-[#2a2a3e] shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] aspect-[4/3] cursor-crosshair group"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-white/[0.03]" />
            </div>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-2 text-white/40">
                  <ZoomIn className="w-8 h-8 animate-pulse" />
                  <span className="text-sm">加载影像中...</span>
                </div>
              </div>
            )}
            <img
              src={caseData.imageUrl}
              alt={caseData.title}
              className={`w-full h-full object-contain transition-transform duration-300 ${isHovering ? 'scale-[2.5]' : 'scale-100'}`}
              style={{
                transformOrigin: isHovering ? `${zoomPos.x}% ${zoomPos.y}%` : 'center center',
              }}
              onLoad={() => setImgLoaded(true)}
              draggable={false}
            />
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/60 text-white/70 text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
              <ZoomIn className="w-3 h-3" />
              <span>悬停放大</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          </div>

          <div className="card flex flex-col gap-2 px-4 py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-primary font-medium">
                <User className="w-4 h-4" />
                {caseData.patientInfo}
              </span>
              <span className="w-px h-4 bg-dental-border" />
              <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Stethoscope className="w-4 h-4 text-accent" />
                {caseData.chiefComplaint}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:w-2/5 flex flex-col gap-3">
          <div className="card flex flex-col gap-4 flex-1">
            <h2 className="font-serif text-lg font-semibold text-primary border-b border-dental-border pb-2">
              书写报告
            </h2>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] lg:max-h-[calc(100vh-220px)] pr-1">
              {FIELDS.map((field) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text flex items-center justify-between">
                    <span>{ANSWER_FIELD_LABELS[field]}</span>
                    <span className="text-xs text-text-muted font-mono">
                      {form[field].length}
                    </span>
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-dental-border bg-white px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-text-muted/60"
                    rows={field === 'toothPosition' ? 2 : 3}
                    placeholder={HINTS[field]}
                    value={form[field]}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button
              className={`btn-accent w-full flex items-center justify-center gap-2 mt-2 py-3 text-base ${
                !FIELDS.some((f) => form[f].trim().length > 0) || isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              onClick={handleSubmit}
              disabled={!FIELDS.some((f) => form[f].trim().length > 0) || isSubmitting}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? '提交中...' : '提交报告'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
