import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, RotateCcw, AlertTriangle, FileWarning, ClipboardList, Trash2, Filter, CheckCircle2, BookmarkCheck } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { getLevelById } from '@/data/cases'
import { MISTAKE_TYPE_LABELS, ANSWER_FIELD_LABELS } from '@/types'
import type { MistakeType, MistakeRecord } from '@/types'

const MISTAKE_TYPE_COLORS: Record<MistakeType, { bg: string; text: string; border: string; light: string }> = {
  missing_tooth: {
    bg: 'bg-red-500',
    text: 'text-red-700',
    border: 'border-red-300',
    light: 'bg-red-50',
  },
  disordered_description: {
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-300',
    light: 'bg-amber-50',
  },
  diagnosis_overreach: {
    bg: 'bg-orange-500',
    text: 'text-orange-700',
    border: 'border-orange-300',
    light: 'bg-orange-50',
  },
  improper_suggestion: {
    bg: 'bg-purple-500',
    text: 'text-purple-700',
    border: 'border-purple-300',
    light: 'bg-purple-50',
  },
}

const MISTAKE_TYPE_ICONS: Record<MistakeType, typeof AlertTriangle> = {
  missing_tooth: FileWarning,
  disordered_description: ClipboardList,
  diagnosis_overreach: AlertTriangle,
  improper_suggestion: AlertTriangle,
}

type FilterTab = 'all' | MistakeType
type StatusTab = 'pending' | 'mastered' | 'all'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'missing_tooth', label: '漏写牙位' },
  { key: 'disordered_description', label: '描述顺序不清' },
  { key: 'diagnosis_overreach', label: '影像表现写成确诊' },
  { key: 'improper_suggestion', label: '建议处理不当' },
]

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: 'pending', label: '待重做' },
  { key: 'mastered', label: '已掌握' },
  { key: 'all', label: '全部' },
]

export default function Mistakes() {
  const navigate = useNavigate()
  const getAllMistakes = useGameStore((s) => s.getAllMistakes)
  const getMistakesByType = useGameStore((s) => s.getMistakesByType)
  const removeMistakesByCase = useGameStore((s) => s.removeMistakesByCase)
  const getPendingMistakes = useGameStore((s) => s.getPendingMistakes)
  const getMasteredMistakes = useGameStore((s) => s.getMasteredMistakes)
  const markMistakeMastered = useGameStore((s) => s.markMistakeMastered)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [statusTab, setStatusTab] = useState<StatusTab>('pending')

  const allMistakes = getAllMistakes()
  const pendingMistakes = getPendingMistakes()
  const masteredMistakes = getMasteredMistakes()

  const baseMistakes: MistakeRecord[] =
    statusTab === 'pending'
      ? pendingMistakes
      : statusTab === 'mastered'
        ? masteredMistakes
        : allMistakes

  const filteredMistakes: MistakeRecord[] =
    activeTab === 'all' ? baseMistakes : baseMistakes.filter((m) => m.mistakeType === activeTab)

  const typeCounts: Record<MistakeType, number> = {
    missing_tooth: getMistakesByType('missing_tooth').length,
    disordered_description: getMistakesByType('disordered_description').length,
    diagnosis_overreach: getMistakesByType('diagnosis_overreach').length,
    improper_suggestion: getMistakesByType('improper_suggestion').length,
  }

  const handleRedo = (caseId: string) => {
    navigate(`/practice/${caseId}`)
  }

  const handleClearCase = (caseId: string) => {
    removeMistakesByCase(caseId)
  }

  const handleMarkAllMastered = () => {
    filteredMistakes.forEach((m) => {
      if (!m.mastered) {
        markMistakeMastered(m.id)
      }
    })
  }

  const formatMasteredDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-dental-bg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-dental-card shadow-sm hover:shadow-md transition-all text-primary"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-bold text-primary flex items-center gap-2">
              <BookOpen size={24} />
              错题本
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">回顾错误，巩固知识，温故知新</p>
          </div>
        </div>

        <div className="card mb-6 animate-fade-in-up stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">错题统计</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-lg bg-dental-muted/50 p-3 text-center">
              <div className="text-2xl font-bold text-primary">{allMistakes.length}</div>
              <div className="text-xs text-gray-500 mt-1">总错题数</div>
            </div>
            {(Object.keys(MISTAKE_TYPE_LABELS) as MistakeType[]).map((type) => {
              const colors = MISTAKE_TYPE_COLORS[type]
              return (
                <div key={type} className={`rounded-lg ${colors.light} p-3 text-center border ${colors.border}`}>
                  <div className={`text-2xl font-bold ${colors.text}`}>{typeCounts[type]}</div>
                  <div className={`text-xs ${colors.text} mt-1`}>{MISTAKE_TYPE_LABELS[type]}</div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-dental-border flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-amber-600">
              <RotateCcw size={14} />
              待重做 <span className="font-bold">{pendingMistakes.length}</span> 项
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 size={14} />
              已掌握 <span className="font-bold">{masteredMistakes.length}</span> 项
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 animate-fade-in-up stagger-2">
          <div className="flex gap-1 bg-dental-card rounded-full p-1 border border-dental-border">
            {STATUS_TABS.map((tab) => {
              const isActive = statusTab === tab.key
              const count = tab.key === 'pending' ? pendingMistakes.length : tab.key === 'mastered' ? masteredMistakes.length : allMistakes.length
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusTab(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? tab.key === 'pending'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : tab.key === 'mastered'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-primary text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 animate-fade-in-up stagger-2 scrollbar-thin">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const mistakeType = tab.key !== 'all' ? (tab.key as MistakeType) : null
            const colors = mistakeType ? MISTAKE_TYPE_COLORS[mistakeType] : null
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? mistakeType
                      ? `${colors!.bg} text-white shadow-md`
                      : 'bg-primary text-white shadow-md'
                    : 'bg-dental-card text-gray-600 hover:bg-dental-muted border border-dental-border'
                }`}
              >
                {tab.label}
                {tab.key !== 'all' && typeCounts[tab.key as MistakeType] > 0 && (
                  <span className="ml-1.5 text-xs opacity-80">
                    ({typeCounts[tab.key as MistakeType]})
                  </span>
                )}
              </button>
            )
          })}

          {filteredMistakes.some((m) => !m.mastered) && (
            <button
              onClick={handleMarkAllMastered}
              className="flex-shrink-0 ml-auto px-4 py-2 rounded-full text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200 shadow-sm flex items-center gap-1.5"
            >
              <BookmarkCheck size={14} />
              全部标记已掌握
            </button>
          )}
        </div>

        {filteredMistakes.length === 0 ? (
          <div className="card text-center py-16 animate-fade-in-up stagger-3">
            <BookOpen size={48} className="mx-auto text-dental-border mb-4" />
            <p className="text-gray-400 font-serif text-lg">
              {statusTab !== 'all'
                ? statusTab === 'pending' ? '没有待重做的错题，太棒了！' : '还没有已掌握的错题'
                : activeTab === 'all'
                  ? '暂无错题记录'
                  : `暂无「${TABS.find((t) => t.key === activeTab)?.label}」类型错题`}
            </p>
            <p className="text-gray-400 text-sm mt-2">完成练习后，错误的题目会出现在这里</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMistakes.map((mistake, index) => {
              const level = getLevelById(mistake.levelId)
              const colors = MISTAKE_TYPE_COLORS[mistake.mistakeType]
              const Icon = MISTAKE_TYPE_ICONS[mistake.mistakeType]
              const isMastered = mistake.mastered
              return (
                <div
                  key={mistake.id}
                  className={`card animate-fade-in-up border-l-4 ${isMastered ? 'border-emerald-300 opacity-70' : colors.border}`}
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s`, opacity: 0 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-serif font-bold truncate ${isMastered ? 'text-gray-500' : 'text-gray-800'}`}>
                        {mistake.caseTitle}
                      </h3>
                      {level && (
                        <span className="text-xs text-gray-400 mt-0.5 block">
                          {level.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                      {isMastered && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          已掌握
                        </span>
                      )}
                      <button
                        onClick={() => handleClearCase(mistake.caseId)}
                        className="p-1.5 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                        title="清除该病例错题"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isMastered ? 'bg-gray-100 text-gray-500 border-gray-200' : `${colors.light} ${colors.text} ${colors.border}`} border`}
                    >
                      <Icon size={12} />
                      {MISTAKE_TYPE_LABELS[mistake.mistakeType]}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isMastered ? 'bg-gray-100 text-gray-400' : 'bg-dental-muted text-gray-600'}`}>
                      {ANSWER_FIELD_LABELS[mistake.field]}
                    </span>
                  </div>

                  <div className="space-y-2.5 mb-4">
                    <div className={`rounded-lg border p-3 ${isMastered ? 'bg-gray-50 border-gray-100' : 'bg-red-50/70 border-red-100'}`}>
                      <div className={`text-xs font-medium mb-1 ${isMastered ? 'text-gray-400' : 'text-red-400'}`}>你的作答</div>
                      <p className={`text-sm leading-relaxed ${isMastered ? 'text-gray-500' : 'text-red-800'}`}>
                        {mistake.studentContent}
                      </p>
                    </div>

                    <div className={`rounded-lg border p-3 ${isMastered ? 'bg-gray-50 border-gray-100' : 'bg-emerald-50/70 border-emerald-100'}`}>
                      <div className={`text-xs font-medium mb-1 ${isMastered ? 'text-emerald-400' : 'text-emerald-500'}`}>标准答案</div>
                      <p className={`text-sm leading-relaxed ${isMastered ? 'text-emerald-600' : 'text-emerald-800'}`}>
                        {mistake.standardContent}
                      </p>
                    </div>

                    {mistake.rewriteSuggestion && (
                      <div className={`rounded-lg border p-3 ${isMastered ? 'bg-gray-50 border-gray-100' : 'bg-blue-50/70 border-blue-100'}`}>
                        <div className={`text-xs font-medium mb-1 ${isMastered ? 'text-gray-400' : 'text-blue-400'}`}>改写建议</div>
                        <p className={`text-sm leading-relaxed ${isMastered ? 'text-gray-500' : 'text-blue-800'}`}>
                          {mistake.rewriteSuggestion}
                        </p>
                      </div>
                    )}
                  </div>

                  {isMastered && mistake.masteredAt && (
                    <p className="text-xs text-gray-400 mb-3">
                      掌握于 {formatMasteredDate(mistake.masteredAt)}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {!isMastered && (
                      <button
                        onClick={() => markMistakeMastered(mistake.id)}
                        className="flex-1 flex items-center gap-2 justify-center text-sm px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all font-medium"
                      >
                        <BookmarkCheck size={14} />
                        标记已掌握
                      </button>
                    )}
                    <button
                      onClick={() => handleRedo(mistake.caseId)}
                      className={`flex items-center gap-2 justify-center text-sm px-4 py-2 rounded-lg transition-all font-medium ${
                        isMastered
                          ? 'flex-1 bg-dental-muted text-gray-600 hover:bg-dental-border'
                          : 'btn-accent'
                      }`}
                    >
                      <RotateCcw size={14} />
                      重做此题
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
