'use client'

import { useState } from 'react'
import { Module, Task } from '@/types'

interface LeftSidebarProps {
  modules?: Module[]
  activeModule?: string
  selectedTask?: Task | null
  onSelectModule?: (moduleId: string) => void
  onSelectTask?: (task: Task) => void
  completedTasks?: number
  totalTasks?: number
}

export default function LeftSidebar({
  modules = [],
  activeModule = '',
  selectedTask = null,
  onSelectModule = () => {},
  onSelectTask = () => {},
  completedTasks = 0,
  totalTasks = 0,
}: LeftSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(['1'])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    )
  }

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <aside className="w-72 md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 h-full hidden md:flex">
      {/* 左上：课程地图（60%） */}
      <div className="flex-[60] flex flex-col min-h-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">🗺️ 课程地图</h3>
            <span className="text-xs text-slate-400">{completedTasks}/{totalTasks} 课时</span>
          </div>
          {/* 进度条 */}
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {modules.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">暂无课程模块</div>
          ) : (
            modules.map((module) => {
              const isExpanded = expandedModules.includes(module.id)
              const isActive = activeModule === module.id
              const moduleCompleted = module.tasks?.filter((t) => t.status === 'completed').length || 0

              return (
                <div key={module.id}>
                  <button
                    onClick={() => {
                      onSelectModule(module.id)
                      toggleModule(module.id)
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 transition ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="font-medium text-sm truncate">{module.title}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {moduleCompleted}/{module.tasks?.length || 0}
                    </span>
                  </button>

                  {isExpanded && module.tasks && (
                    <div className="pl-8 pr-4">
                      {module.tasks.map((task) => {
                        const isSelected = selectedTask?.id === task.id
                        return (
                          <button
                            key={task.id}
                            onClick={() => onSelectTask(task)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition mb-1 ${
                              isSelected
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span className="text-sm">
                              {task.status === 'completed' ? '✓' : task.status === 'ongoing' ? '●' : '○'}
                            </span>
                            <span className="text-sm truncate flex-1">{task.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 分隔线 */}
      <div className="h-px bg-slate-200 shrink-0" />

      {/* 左下：资源列表（40%） */}
      <div className="flex-[40] flex flex-col min-h-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 shrink-0">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">📚 资源列表</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="space-y-1">
            {[
              { name: '调研报告模板.docx', size: '156KB' },
              { name: 'PRD撰写指南.pdf', size: '1.8MB' },
              { name: '用户研究方法.mp4', size: '45MB' },
              { name: '优秀案例集.pdf', size: '5.2MB' },
            ].map((resource, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-white rounded-lg transition text-sm"
              >
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 truncate">{resource.name}</p>
                  <p className="text-xs text-slate-400">{resource.size}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
