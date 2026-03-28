'use client'

import { useState, useRef, useEffect } from 'react'
import { Task, Module, Message } from '@/types'

// 模拟OpenAI API调用
const mockOpenAICall = async (prompt: string, taskContext: string): Promise<string> => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 根据任务内容生成针对性回复
  if (taskContext.includes('调研方法')) {
    return `关于调研方法，我建议你：

1. 首先明确调研目标，确定你想要了解的具体问题
2. 选择合适的调研方法，如问卷、访谈、观察等
3. 设计调研工具，如问卷问题、访谈提纲
4. 收集数据并进行分析
5. 撰写调研报告，总结发现和建议

如果需要更具体的帮助，请告诉我你的具体问题。`
  } else if (taskContext.includes('实地考察')) {
    return `关于实地考察，我建议你：

1. 提前准备观察记录表，明确观察要点
2. 选择2-3个重点展品进行深度观察
3. 记录展品的外观、交互方式、展示内容
4. 观察观众的反应和互动情况
5. 拍摄照片作为参考资料

需要更多实地考察的技巧吗？`
  } else if (taskContext.includes('创新设计')) {
    return `关于创新设计，我建议你：

1. 整理前期调研发现的问题和用户痛点
2. 进行头脑风暴，提出多个解决方案
3. 评估每个方案的可行性和创新性
4. 绘制设计草图，明确设计细节
5. 撰写完整的设计方案

需要我帮你 brainstorm一些创新点子吗？`
  } else {
    return `我理解你的问题。关于这个主题，我建议你：

1. 仔细阅读任务要求和学习材料
2. 参考课程提供的资源和示例
3. 按照任务步骤逐步完成
4. 如有具体问题，随时向我咨询

你还有其他需要了解的方面吗？`
  }
}

interface CenterPanelProps {
  selectedTask?: Task | null
  currentModule?: Module | null
  user?: any
}

export default function CenterPanel({ selectedTask = null, currentModule, user }: CenterPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'task'>('content')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '你好！我是你的AI学习助手。选择左侧任务后，我可以为你提供针对性的学习帮助。',
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [taskContent, setTaskContent] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickQuestions = [
    '调研报告怎么写？',
    '什么是用户画像？',
    '任务要求有哪些？',
    '优秀案例',
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 当选择新任务时，重置提交状态
  useEffect(() => {
    setTaskContent('')
    setAttachments([])
    setSubmitSuccess(false)
    setActiveTab('content')
  }, [selectedTask?.id])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')

    // 模拟AI回复
    try {
      const taskContext = selectedTask?.content || ''
      const aiResponse = await mockOpenAICall(inputMessage, taskContext)
      
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiReply])
    } catch (error) {
      console.error('AI response error:', error)
      const errorReply: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '抱歉，我暂时无法回答你的问题，请稍后再试。',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorReply])
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitTask = async () => {
    if (!taskContent.trim() && attachments.length === 0) {
      alert('请输入任务内容或上传附件')
      return
    }

    setSubmitting(true)

    try {
      // 模拟提交过程
      setTimeout(() => {
        setSubmitting(false)
        setSubmitSuccess(true)
        // 3秒后重置成功状态
        setTimeout(() => setSubmitSuccess(false), 3000)
      }, 1500)
    } catch (error) {
      setSubmitting(false)
      alert('提交失败，请重试')
      console.error('Task submission error:', error)
    }
  }

  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 缩放功能
  const handleZoomIn = () => {
    if (zoomLevel < 150) {
      setZoomLevel(zoomLevel + 10)
    }
  }

  const handleZoomOut = () => {
    if (zoomLevel > 70) {
      setZoomLevel(zoomLevel - 10)
    }
  }

  const handleZoomReset = () => {
    setZoomLevel(100)
  }

  // 全屏功能
  const handleFullscreen = () => {
    if (!isFullscreen) {
      // 进入全屏
      const element = document.documentElement as any
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      // 退出全屏
      const doc = document as any
      if (doc.exitFullscreen) {
        doc.exitFullscreen()
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen()
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any
      setIsFullscreen(
        !!doc.fullscreenElement ||
        !!doc.webkitFullscreenElement ||
        !!doc.msFullscreenElement
      )
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-white h-full min-w-0 md:min-w-[300px]">
      {/* 学习中心 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {selectedTask ? (
          <>
            {/* 课时标题栏 */}
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{currentModule?.title} · {selectedTask.title}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {selectedTask.duration || '45分钟'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    包含1个任务
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    128人已学习
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* 缩放控制 */}
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                  <button
                    onClick={handleZoomOut}
                    className="px-2 py-1 text-xs hover:bg-slate-100 rounded transition"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <span className="px-2 text-xs text-slate-600">{zoomLevel}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="px-2 py-1 text-xs hover:bg-slate-100 rounded transition"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                {/* 全屏按钮 */}
                <button
                  onClick={handleFullscreen}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                  </svg>
                  {isFullscreen ? '退出全屏' : '全屏'}
                </button>
                {/* AI助手切换按钮 */}
                <button
                  onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-purple-300 bg-purple-50 text-purple-600 rounded-lg text-xs hover:bg-purple-100 transition shadow-sm"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${
                    aiAssistantOpen ? 'rotate-180' : ''
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {aiAssistantOpen ? '收起助手' : 'AI助手'}
                </button>
              </div>
            </div>

            {/* 内容切换标签 */}
            <div className="px-6 border-b border-slate-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === 'content'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  学习内容
                </button>
                <button
                  onClick={() => setActiveTab('task')}
                  className={`py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === 'task'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  任务提交
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              {/* 内容区域 */}
              <div 
                className="flex-1 overflow-y-auto px-6 py-6 transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
              >
                {activeTab === 'content' ? (
                  <div className="space-y-6">
                    {/* 学习任务 */}
                    <div className="bg-slate-50 rounded-xl p-5">
                      <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs">📋</span>
                        学习任务
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {selectedTask.content}
                      </p>
                    </div>

                    {/* 任务要求 */}
                    {selectedTask.requirements && selectedTask.requirements.length > 0 && (
                      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                        <h3 className="text-base font-semibold text-amber-800 mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xs">✓</span>
                          任务要求
                        </h3>
                        <ul className="space-y-2">
                          {selectedTask.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                              <span className="w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 学习资源 */}
                    {selectedTask.resources && selectedTask.resources.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs">📚</span>
                          学习资源
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedTask.resources.map((resource) => (
                            <div
                              key={resource.id}
                              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 cursor-pointer transition"
                            >
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                {resource.type === 'pdf' && <span className="text-red-500 text-xs font-bold">PDF</span>}
                                {resource.type === 'doc' && <span className="text-blue-500 text-xs font-bold">DOC</span>}
                                {resource.type === 'video' && <span className="text-purple-500 text-xs font-bold">▶</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{resource.name}</p>
                                <p className="text-xs text-slate-400">{resource.size}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 视频讲解 */}
                    <div>
                      <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs">▶</span>
                        视频讲解
                      </h3>
                      <div className="bg-slate-800 rounded-xl aspect-video flex items-center justify-center cursor-pointer hover:bg-slate-700 transition">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 提交成功提示 */}
                    {submitSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">任务提交成功！</p>
                          <p className="text-sm text-green-600">老师批改后会通知你</p>
                        </div>
                      </div>
                    )}

                    {/* 任务提交表单 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">任务</span>
                        <h4 className="font-semibold text-slate-800">{selectedTask.title}</h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        请根据学习内容，完成相应的任务提交。支持文字、图片、文档等多种格式。
                      </p>
                      
                      {/* 文本输入 */}
                      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
                        <textarea
                          value={taskContent}
                          onChange={(e) => setTaskContent(e.target.value)}
                          className="w-full h-40 resize-none border-none outline-none text-sm"
                          placeholder="请输入你的任务内容..."
                        />
                      </div>

                      {/* 附件列表 */}
                      {attachments.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700">{file.name}</p>
                                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeAttachment(index)}
                                className="text-slate-400 hover:text-red-500 transition"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:border-blue-400 transition cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          添加附件
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={handleSubmitTask}
                          disabled={submitting}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              提交中...
                            </>
                          ) : (
                            '提交任务'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 课时导航 */}
              <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                {/* 左侧：上一课 */}
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  上一课
                </button>
                
                {/* 右侧：下一课 */}
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition">
                  下一课
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p>请从左侧选择一个课时开始学习</p>
            </div>
          </div>
        )}
      </div>

      {/* AI助手 - 可折叠 */}
      {aiAssistantOpen && (
        <div className="bg-white border-t border-slate-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out shadow-lg">
          {/* 聊天区域 */}
          <div className="max-h-[250px] overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                  msg.type === 'ai'
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 提示文字 */}
          <div className="px-4 py-1 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
            使用@question提问，@judge提交评审
          </div>

          {/* 输入框 */}
          <div className="px-4 py-2 flex gap-2 border-t border-gray-100">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入消息..."
              className="flex-1 px-3 py-2 border-2 border-purple-300 rounded-lg text-sm outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSendMessage}
              className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center hover:bg-purple-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
