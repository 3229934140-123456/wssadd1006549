import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Clock, Target, BarChart3, Lightbulb, Award } from 'lucide-react'
import { levels, getCasesByLevel } from '@/data/cases'
import { useGameStore } from '@/stores/gameStore'
import { MISTAKE_TYPE_LABELS } from '@/types'
import type { MistakeType, AnswerHistoryRecord } from '@/types'

const levelGradients: Record<string, string> = {
  caries: 'from-teal-600 to-cyan-600',
  periapical: 'from-amber-600 to-orange-600',
  impacted: 'from-violet-600 to-purple-600',
  periodontal: 'from-rose-600 to-pink-600',
}

const levelAccents: Record<string, string> = {
  caries: 'text-teal-700',
  periapical: 'text-amber-700',
  impacted: 'text-violet-700',
  periodontal: 'text-rose-700',
}

const MISTAKE_TYPE_BAR_COLORS: Record<MistakeType, string> = {
  missing_tooth: 'bg-red-500',
  disordered_description: 'bg-amber-500',
  diagnosis_overreach: 'bg-orange-500',
  improper_suggestion: 'bg-purple-500',
}

const MISTAKE_TYPE_TEXT_COLORS: Record<MistakeType, string> = {
  missing_tooth: 'text-red-600',
  disordered_description: 'text-amber-600',
  diagnosis_overreach: 'text-orange-600',
  improper_suggestion: 'text-purple-600',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
}

function getBarColor(pct: number): string {
  if (pct > 80) return 'bg-emerald-500'
  if (pct > 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function ScoreBarChart({ records }: { records: AnswerHistoryRecord[] }) {
  const last5 = records.slice(-5)
  if (last5.length === 0) return null

  return (
    <div className="flex items-end gap-2 h-24">
      {last5.map((r, i) => {
        const pct = r.maxScore > 0 ? Math.round((r.totalScore / r.maxScore) * 100) : 0
        const height = Math.max(pct, 8)
        return (
          <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-gray-600">{pct}%</span>
            <div className="w-full relative" style={{ height: '80px' }}>
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-500 ${getBarColor(pct)}`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400">#{records.length - last5.length + i + 1}</span>
          </div>
        )
      })}
    </div>
  )
}

function MistakeStackedBar({ counts }: { counts: Record<MistakeType, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (total === 0) {
    return <div className="h-4 rounded-full bg-dental-muted" />
  }

  return (
    <div className="flex h-4 rounded-full overflow-hidden">
      {(Object.keys(MISTAKE_TYPE_LABELS) as MistakeType[]).map((type) => {
        const pct = total > 0 ? (counts[type] / total) * 100 : 0
        if (pct === 0) return null
        return (
          <div
            key={type}
            className={`${MISTAKE_TYPE_BAR_COLORS[type]} transition-all duration-500`}
            style={{ width: `${pct}%` }}
            title={`${MISTAKE_TYPE_LABELS[type]}: ${counts[type]} (${Math.round(pct)}%)`}
          />
        )
      })}
    </div>
  )
}

function OverallMistakeBar({ counts }: { counts: Record<MistakeType, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-3">
      {(Object.keys(MISTAKE_TYPE_LABELS) as MistakeType[]).map((type) => {
        const pct = total > 0 ? (counts[type] / total) * 100 : 0
        return (
          <div key={type} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-28 flex-shrink-0">{MISTAKE_TYPE_LABELS[type]}</span>
            <div className="flex-1 h-6 bg-dental-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${MISTAKE_TYPE_BAR_COLORS[type]} rounded-full transition-all duration-700`}
                style={{ width: `${Math.max(pct, 0)}%` }}
              />
            </div>
            <span className={`text-sm font-semibold w-16 text-right ${MISTAKE_TYPE_TEXT_COLORS[type]}`}>
              {Math.round(pct)}%
            </span>
            <span className="text-xs text-gray-400 w-8 text-right">{counts[type]}</span>
          </div>
        )
      })}
    </div>
  )
}

function LevelSection({ levelId, levelTitle, order, index }: { levelId: string; levelTitle: string; order: number; index: number }) {
  const getHistoryByLevel = useGameStore((s) => s.getHistoryByLevel)
  const getAllMistakes = useGameStore((s) => s.getAllMistakes)

  const history = getHistoryByLevel(levelId)
  const allMistakes = getAllMistakes()
  const levelMistakes = allMistakes.filter((m) => m.levelId === levelId)

  const mistakeCounts: Record<MistakeType, number> = {
    missing_tooth: 0,
    disordered_description: 0,
    diagnosis_overreach: 0,
    improper_suggestion: 0,
  }
  levelMistakes.forEach((m) => {
    mistakeCounts[m.mistakeType]++
  })

  const totalHints = history.reduce((sum, r) => sum + r.hintsUsed.length, 0)
  const avgTime = history.length > 0
    ? Math.round(history.reduce((sum, r) => sum + r.timeSpent, 0) / history.length)
    : 0

  const gradient = levelGradients[levelId]
  const accent = levelAccents[levelId]

  return (
    <div className={`card border border-dental-border overflow-hidden animate-fade-in-up stagger-${index + 1}`}>
      <div className={`relative h-2 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
            <Target size={20} className="text-white" />
          </div>
          <div>
            <span className={`text-xs font-semibold ${accent}`}>第{order}关</span>
            <h3 className={`font-serif text-lg font-bold ${accent}`}>{levelTitle}</h3>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-sm text-gray-400">
            <BarChart3 size={14} />
            <span>{history.length}次练习</span>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">暂无练习记录</p>
        ) : (
          <>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-sm font-semibold text-gray-700">近期得分趋势</span>
              </div>
              <ScoreBarChart records={history} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-lg bg-dental-muted/40 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-500">平均用时</span>
                </div>
                <span className="text-lg font-bold text-gray-800">{formatTime(avgTime)}</span>
              </div>
              <div className="rounded-lg bg-dental-muted/40 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-500">提示使用</span>
                </div>
                <span className="text-lg font-bold text-gray-800">{totalHints}次</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} className="text-primary" />
                <span className="text-sm font-semibold text-gray-700">错误类型分布</span>
              </div>
              <MistakeStackedBar counts={mistakeCounts} />
              <div className="flex flex-wrap gap-3 mt-2.5">
                {(Object.keys(MISTAKE_TYPE_LABELS) as MistakeType[]).map((type) => {
                  if (mistakeCounts[type] === 0) return null
                  return (
                    <span key={type} className={`text-xs ${MISTAKE_TYPE_TEXT_COLORS[type]}`}>
                      {MISTAKE_TYPE_LABELS[type]} {mistakeCounts[type]}
                    </span>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Progress() {
  const navigate = useNavigate()
  const getHistoryByLevel = useGameStore((s) => s.getHistoryByLevel)
  const getAllMistakes = useGameStore((s) => s.getAllMistakes)
  const getMasteredMistakes = useGameStore((s) => s.getMasteredMistakes)
  const getCompletedCaseCount = useGameStore((s) => s.getCompletedCaseCount)

  const allMistakes = getAllMistakes()
  const masteredMistakes = getMasteredMistakes()
  const completedCount = getCompletedCaseCount()

  let totalAttempts = 0
  let totalScorePct = 0
  let totalTime = 0
  let scorePctCount = 0

  const overallMistakeCounts: Record<MistakeType, number> = {
    missing_tooth: 0,
    disordered_description: 0,
    diagnosis_overreach: 0,
    improper_suggestion: 0,
  }

  levels.forEach((level) => {
    const history = getHistoryByLevel(level.id)
    totalAttempts += history.length
    history.forEach((r) => {
      if (r.maxScore > 0) {
        totalScorePct += (r.totalScore / r.maxScore) * 100
        scorePctCount++
      }
      totalTime += r.timeSpent
    })
  })

  allMistakes.forEach((m) => {
    overallMistakeCounts[m.mistakeType]++
  })

  const avgScorePct = scorePctCount > 0 ? Math.round(totalScorePct / scorePctCount) : 0
  const avgTime = totalAttempts > 0 ? Math.round(totalTime / totalAttempts) : 0
  const masteryRate = allMistakes.length > 0
    ? Math.round((masteredMistakes.length / allMistakes.length) * 100)
    : 0

  const hasHistory = totalAttempts > 0
  const totalCases = levels.reduce((sum, l) => sum + getCasesByLevel(l.id).length, 0)

  return (
    <div className="min-h-screen bg-dental-bg">
      <div className="max-w-5xl mx-auto px-5 py-6">
        <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-dental-card shadow-sm hover:shadow-md transition-all text-primary"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-bold text-primary flex items-center gap-2">
              <TrendingUp size={24} />
              学习进步
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">查看训练数据，了解进步轨迹</p>
          </div>
        </div>

        {!hasHistory ? (
          <div className="card text-center py-20 animate-fade-in-up stagger-1">
            <Award size={56} className="mx-auto text-dental-border mb-5" />
            <p className="text-gray-400 font-serif text-lg">
              暂无练习记录，完成首次练习后即可查看进步数据
            </p>
          </div>
        ) : (
          <>
            <div className="card mb-6 animate-fade-in-up stagger-1 border border-dental-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <BarChart3 size={14} className="text-primary" />
                    <span className="text-xs text-gray-500">总练习次数</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{totalAttempts}</div>
                  <div className="text-xs text-gray-400 mt-0.5">已完成 {completedCount}/{totalCases} 病例</div>
                </div>
                <div className="text-center p-3">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Target size={14} className="text-primary" />
                    <span className="text-xs text-gray-500">平均得分率</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{avgScorePct}%</div>
                  <div className="text-xs text-gray-400 mt-0.5">综合表现</div>
                </div>
                <div className="text-center p-3">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Clock size={14} className="text-primary" />
                    <span className="text-xs text-gray-500">平均用时</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{formatTime(avgTime)}</div>
                  <div className="text-xs text-gray-400 mt-0.5">单次练习</div>
                </div>
                <div className="text-center p-3">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Award size={14} className="text-primary" />
                    <span className="text-xs text-gray-500">掌握率</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{masteryRate}%</div>
                  <div className="text-xs text-gray-400 mt-0.5">{masteredMistakes.length}/{allMistakes.length} 已掌握</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {levels.map((level, index) => (
                <LevelSection
                  key={level.id}
                  levelId={level.id}
                  levelTitle={level.title}
                  order={level.order}
                  index={index}
                />
              ))}
            </div>

            <div className="card border border-dental-border animate-fade-in-up stagger-5">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={18} className="text-primary" />
                <h2 className="font-serif text-lg font-bold text-gray-800">常见错误分布</h2>
                <span className="text-xs text-gray-400 ml-auto">共 {allMistakes.length} 项错误</span>
              </div>
              {allMistakes.length === 0 ? (
                <p className="text-center text-gray-400 py-6">暂无错误记录</p>
              ) : (
                <OverallMistakeBar counts={overallMistakeCounts} />
              )}
            </div>
          </>
        )}
      </div>

      <footer className="text-center py-6 text-xs text-gray-400">
        口腔影像报告训练系统 · 仅供教学使用
      </footer>
    </div>
  )
}
