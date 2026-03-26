'use client'

import { useState } from 'react'
import { Task } from '@/types'

interface RightSidebarProps {
  selectedTask?: Task | null
  completedTasks?: number
  totalTasks?: number
  role?: 'student' | 'teacher'
  user?: any
}

export default function RightSidebar({ selectedTask = null, completedTasks = 0, totalTasks = 0, role = 'student', user }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')

  // 计算剩余时间
  const getRemainingTime = () => {
    const now = new Date()
    const deadline = new Date('2026-03-25T23:59:59')
    const diff = deadline.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return { days, hours }
  }

  const { days, hours } = getRemainingTime()

  const taskChecklist = [
    { id: 1, text: '调研报告PDF格式', checked: true },
    { id: 2, text: '1000字以上', checked: true },
    { id: 3, text: '包含访谈记录', checked: true },
    { id: 4, text: '3张以上照片', checked: false },
  ]

  const historyTasks = [
    { id: 1, title: '课时1：产品认知入门', score: 92, status: 'completed' },
    { id: 2, title: '课前调研问卷', score: null, status: 'completed' },
  ]

  return (
    <aside className="w-80 lg:w-72 bg-slate-50 border-l border-slate-200 flex flex-col h-full shrink-0 overflow-y-auto hidden lg:flex">
      <div className="p-4 space-y-4">
        {/* 倒计时卡片 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8-8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            <span className="text-xs text-slate-500">当前任务截止</span>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {days}天{hours}时
          </div>
          <div className="text-xs text-slate-400">2026年3月25日 23:59</div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'current'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            当前任务
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            历史任务
          </button>
        </div>

        {activeTab === 'current' ? (
          <>
            {/* 任务清单 */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                任务清单
              </h3>
              <div className="space-y-2">
                {taskChecklist.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                      item.checked 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-slate-300 group-hover:border-blue-500'
                    }`}>
                      {item.checked && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 提交状态 */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                提交状态
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-sm text-yellow-700">待提交</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">历史任务</h3>
            <div className="space-y-3">
              {historyTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-700">{task.title}</span>
                  {task.score ? (
                    <span className="text-sm font-medium text-green-600">{task.score}分</span>
                  ) : (
                    <span className="text-xs text-slate-400">已完成</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
