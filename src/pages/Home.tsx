import { useNavigate, Link } from 'react-router-dom'
import { ScanEye, Crosshair, GitBranch, Activity, BookOpen, Star, ChevronRight, RotateCcw, Trophy, ClipboardList } from 'lucide-react'
import { levels, getCasesByLevel } from '@/data/cases'
import { useGameStore } from '@/stores/gameStore'

const iconMap: Record<string, React.ElementType> = {
  ScanEye,
  Crosshair,
  GitBranch,
  Activity,
}

const levelGradients: Record<string, string> = {
  caries: 'from-teal-600 to-cyan-600',
  periapical: 'from-amber-600 to-orange-600',
  impacted: 'from-violet-600 to-purple-600',
  periodontal: 'from-rose-600 to-pink-600',
}

const levelAccents: Record<string, string> = {
  caries: 'bg-teal-100 text-teal-700',
  periapical: 'bg-amber-100 text-amber-700',
  impacted: 'bg-violet-100 text-violet-700',
  periodontal: 'bg-rose-100 text-rose-700',
}

export default function Home() {
  const navigate = useNavigate()
  const getLevelProgress = useGameStore((s) => s.getLevelProgress)
  const getCompletedCaseCount = useGameStore((s) => s.getCompletedCaseCount)
  const getTotalScore = useGameStore((s) => s.getTotalScore)
  const getAllMistakes = useGameStore((s) => s.getAllMistakes)
  const resetProgress = useGameStore((s) => s.resetProgress)

  const completedCount = getCompletedCaseCount()
  const totalScore = getTotalScore()
  const mistakes = getAllMistakes()

  const totalCases = levels.reduce((sum, l) => sum + getCasesByLevel(l.id).length, 0)

  return (
    <div className="min-h-screen bg-dental-bg">
      <header className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-teal-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full border border-white/30" />
          <div className="absolute bottom-5 right-20 w-60 h-60 rounded-full border border-white/20" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 py-10">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-7 h-7 opacity-80" />
              <span className="text-sm tracking-widest opacity-70 uppercase">Dental Radiology Training</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3">
              影像报告闯关训练
            </h1>
            <p className="text-lg opacity-80 max-w-xl leading-relaxed">
              系统训练口腔影像诊断报告书写能力，从龋病到牙周病，逐关挑战，精进技能
            </p>
          </div>

          <div className="animate-fade-in-up stagger-2 mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <div>
                <div className="text-xs opacity-60">已完成病例</div>
                <div className="text-xl font-bold">{completedCount}<span className="text-sm font-normal opacity-60">/{totalCases}</span></div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <Star className="w-5 h-5 text-yellow-300" />
              <div>
                <div className="text-xs opacity-60">累计得分</div>
                <div className="text-xl font-bold">{totalScore}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <ClipboardList className="w-5 h-5 text-red-300" />
              <div>
                <div className="text-xs opacity-60">待复习错题</div>
                <div className="text-xl font-bold">{mistakes.length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6 animate-fade-in-up stagger-3">
          <h2 className="font-serif text-2xl font-semibold text-gray-800">选择关卡</h2>
          <div className="flex gap-3">
            {mistakes.length > 0 && (
              <Link to="/mistakes" className="btn-accent flex items-center gap-2 text-sm">
                <ClipboardList className="w-4 h-4" />
                错题本 ({mistakes.length})
              </Link>
            )}
            {completedCount > 0 && (
              <button
                onClick={resetProgress}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                重置进度
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levels.map((level, index) => {
            const Icon = iconMap[level.icon] || ScanEye
            const cases = getCasesByLevel(level.id)
            const progress = getLevelProgress(level.id)
            const completedCount = progress.completedCaseIds.length
            const progressPercent = cases.length > 0 ? Math.round((completedCount / cases.length) * 100) : 0
            const totalStars = Object.values(progress.bestStars).reduce((a, b) => a + b, 0)
            const maxStars = cases.length * 3

            return (
              <div
                key={level.id}
                className={`card animate-fade-in-up stagger-${index + 1} group border border-dental-border hover:border-primary/30 overflow-hidden`}
              >
                <div className={`relative h-2 bg-gradient-to-r ${levelGradients[level.id]}`} />

                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${levelGradients[level.id]} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelAccents[level.id]}`}>
                          第{level.order}关
                        </span>
                        <h3 className="font-serif text-lg font-bold text-gray-800 truncate">
                          {level.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {level.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-500">完成进度</span>
                      <span className="font-semibold text-primary">{completedCount}/{cases.length}</span>
                    </div>
                    <div className="h-2 bg-dental-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${levelGradients[level.id]} rounded-full transition-all duration-700`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 3 }).map((_, i) => {
                      const filledCount = cases.filter((c) => (progress.bestStars[c.id] || 0) > i).length
                      const ratio = cases.length > 0 ? filledCount / cases.length : 0
                      return (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${ratio >= 0.5 ? 'text-yellow-400 fill-yellow-400' : ratio > 0 ? 'text-yellow-400 fill-yellow-400/50' : 'text-gray-300'}`}
                        />
                      )
                    })}
                    <span className="text-xs text-gray-400 ml-1">{totalStars}/{maxStars}</span>
                  </div>

                  <div className="space-y-1.5">
                    {cases.map((c) => {
                      const isCompleted = progress.completedCaseIds.includes(c.id)
                      const stars = progress.bestStars[c.id] || 0

                      return (
                        <button
                          key={c.id}
                          onClick={() => navigate(`/practice/${c.id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 hover:bg-primary/5 group/item"
                        >
                          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? 'bg-primary text-white'
                              : 'bg-dental-muted text-gray-400'
                          }`}>
                            {isCompleted ? '✓' : '○'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${isCompleted ? 'text-gray-700' : 'text-gray-500'}`}>
                              {c.title}
                            </div>
                          </div>
                          {isCompleted && (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover/item:text-primary transition-colors" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        口腔影像报告训练系统 · 仅供教学使用
      </footer>
    </div>
  )
}
