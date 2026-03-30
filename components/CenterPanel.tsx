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

  // 模拟PPT数据
  const pptData = {
    title: '科技馆调研方法',
    pages: [
      { id: 1, title: '课程介绍', content: '科技馆调研方法课程内容概述' },
      { id: 2, title: '调研目的', content: '明确调研的目标和意义' },
      { id: 3, title: '调研方法', content: '常用的调研方法介绍' },
      { id: 4, title: '数据收集', content: '如何有效收集调研数据' },
      { id: 5, title: '数据分析', content: '调研数据的分析方法' },
      { id: 6, title: '报告撰写', content: '如何撰写调研报告' },
    ],
    currentPage: 2
  }

  // 模拟任务看板数据
  const taskBoard = {
    todo: [
      { id: 1, title: '完成调研计划', priority: 'high', dueDate: '2026-04-01' },
      { id: 2, title: '设计调研问卷', priority: 'medium', dueDate: '2026-04-02' },
    ],
    inProgress: [
      { id: 3, title: '科技馆实地考察', priority: 'high', dueDate: '2026-04-03' },
    ],
    completed: [
      { id: 4, title: '学习调研方法理论', priority: 'low', dueDate: '2026-03-28' },
    ]
  }

  // 模拟资源模板数据
  const resourceTemplates = [
    { id: 1, name: '调研计划模板.docx', type: 'doc', size: '2.5MB' },
    { id: 2, name: '调研问卷模板.xlsx', type: 'excel', size: '1.8MB' },
    { id: 3, name: '观察记录表.pdf', type: 'pdf', size: '1.2MB' },
    { id: 4, name: '调研报告模板.pptx', type: 'ppt', size: '3.5MB' },
  ]

  const [currentPptPage, setCurrentPptPage] = useState(2)
  const [pptZoom, setPptZoom] = useState(100)

  // PPT导航功能
  const handlePptPrev = () => {
    if (currentPptPage > 1) {
      setCurrentPptPage(currentPptPage - 1)
    }
  }

  const handlePptNext = () => {
    if (currentPptPage < pptData.pages.length) {
      setCurrentPptPage(currentPptPage + 1)
    }
  }

  // PPT缩放功能
  const handlePptZoomIn = () => {
    if (pptZoom < 150) {
      setPptZoom(pptZoom + 10)
    }
  }

  const handlePptZoomOut = () => {
    if (pptZoom > 70) {
      setPptZoom(pptZoom - 10)
    }
  }

  // PPT全屏功能
  const handlePptFullscreen = () => {
    const pptElement = document.getElementById('ppt-container')
    if (pptElement) {
      if (!document.fullscreenElement) {
        pptElement.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err)
        })
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full min-w-0 md:min-w-[300px]">
      {/* 课时标题栏 */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          {/* 课程信息 */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <h2 className="font-medium text-slate-800">{currentModule?.title} · {selectedTask?.title || '未选择任务'}</h2>
            <div className="flex items-center gap-3 text-slate-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedTask?.duration || '45分钟'}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                128人已学习
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 三栏布局 */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* 左侧：PPT展示区域 */}
        <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-medium text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PPT展示
            </h3>
            <div className="flex items-center gap-2">
              {/* PPT缩放控制 */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                <button
                  onClick={handlePptZoomOut}
                  className="px-2 py-1 text-xs hover:bg-slate-100 rounded transition"
                  title="缩小"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <span className="px-2 text-xs text-slate-600">{pptZoom}%</span>
                <button
                  onClick={handlePptZoomIn}
                  className="px-2 py-1 text-xs hover:bg-slate-100 rounded transition"
                  title="放大"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              {/* 全屏按钮 */}
              <button
                onClick={handlePptFullscreen}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition"
                title="全屏"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* PPT内容 */}
          <div className="flex-1 overflow-hidden relative" id="ppt-container">
            <div 
              className="h-full w-full flex items-center justify-center p-4 transition-transform duration-300"
              style={{ transform: `scale(${pptZoom / 100})` }}
            >
              <div className="bg-white border border-slate-200 rounded-lg shadow-md w-full max-w-md aspect-video flex flex-col">
                <div className="bg-slate-100 border-b border-slate-200 p-3 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-slate-800">{pptData.title}</h4>
                  <span className="text-xs text-slate-500">第 {currentPptPage} 页，共 {pptData.pages.length} 页</span>
                </div>
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <h5 className="text-lg font-medium text-slate-800 mb-2">{pptData.pages[currentPptPage - 1].title}</h5>
                    <p className="text-slate-600">{pptData.pages[currentPptPage - 1].content}</p>
                    <div className="mt-4 w-32 h-16 bg-slate-200 rounded mx-auto flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* PPT导航 */}
          <div className="p-4 border-t border-slate-200 flex justify-between items-center">
            <button
              onClick={handlePptPrev}
              disabled={currentPptPage === 1}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              上一页
            </button>
            <div className="flex-1 mx-4">
              <input
                type="range"
                min="1"
                max={pptData.pages.length}
                value={currentPptPage}
                onChange={(e) => setCurrentPptPage(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <button
              onClick={handlePptNext}
              disabled={currentPptPage === pptData.pages.length}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 中间：任务展示区域 */}
        <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-medium text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              任务中心
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 学习进度 */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-800">学习进度</h4>
                <span className="text-xs text-blue-600 font-medium">{Math.round((selectedTask?.status === 'completed' ? 100 : selectedTask?.status === 'ongoing' ? 50 : 0))}%</span>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${selectedTask?.status === 'completed' ? 100 : selectedTask?.status === 'ongoing' ? 50 : 0}%` }}
                />
              </div>
            </div>
            
            {/* 当前任务 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-slate-800">当前任务</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedTask?.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedTask?.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTask?.status === 'completed' ? '已完成' :
                   selectedTask?.status === 'ongoing' ? '进行中' :
                   '待开始'}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {selectedTask?.content || '请选择一个任务'}
              </p>
              
              {/* 任务详情 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-500">预计耗时：</span>
                  <span className="text-slate-700 font-medium">{selectedTask?.duration || '45分钟'}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="text-slate-500">完成标准：</span>
                    <ul className="mt-1 space-y-1">
                      {selectedTask?.requirements && selectedTask?.requirements.map((req, index) => (
                        <li key={index} className="text-slate-700">• {req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* 任务操作 */}
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition">
                  开始学习
                </button>
                <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition">
                  标记完成
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：任务看板和资源模板 */}
        <div className="w-full md:w-1/3 flex flex-col">
          {/* 任务看板 */}
          <div className="flex-1 border-b border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                任务看板
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* 待完成任务 */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                  <h4 className="text-sm font-medium text-slate-700">待完成 ({taskBoard.todo.length})</h4>
                </div>
                <div className="space-y-2 pl-5">
                  {taskBoard.todo.map((task) => (
                    <div key={task.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-sm font-medium text-slate-800">{task.title}</h5>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority === 'high' ? '高' :
                           task.priority === 'medium' ? '中' :
                           '低'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">截止日期：{task.dueDate}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 进行中任务 */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <h4 className="text-sm font-medium text-slate-700">进行中 ({taskBoard.inProgress.length})</h4>
                </div>
                <div className="space-y-2 pl-5">
                  {taskBoard.inProgress.map((task) => (
                    <div key={task.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-sm font-medium text-slate-800">{task.title}</h5>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority === 'high' ? '高' :
                           task.priority === 'medium' ? '中' :
                           '低'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">截止日期：{task.dueDate}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 已完成任务 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <h4 className="text-sm font-medium text-slate-700">已完成 ({taskBoard.completed.length})</h4>
                </div>
                <div className="space-y-2 pl-5">
                  {taskBoard.completed.map((task) => (
                    <div key={task.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm opacity-70">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-sm font-medium text-slate-800 line-through">{task.title}</h5>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority === 'high' ? '高' :
                           task.priority === 'medium' ? '中' :
                           '低'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">截止日期：{task.dueDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* 资源模板 */}
          <div className="h-64 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                资源模板
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {resourceTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {template.type === 'doc' && <span className="text-blue-500 text-xs font-bold">DOC</span>}
                        {template.type === 'pdf' && <span className="text-red-500 text-xs font-bold">PDF</span>}
                        {template.type === 'ppt' && <span className="text-orange-500 text-xs font-bold">PPT</span>}
                        {template.type === 'excel' && <span className="text-green-500 text-xs font-bold">XLS</span>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{template.name}</p>
                        <p className="text-xs text-slate-400">{template.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-slate-500 hover:text-blue-500 transition" title="预览">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-1.5 text-slate-500 hover:text-blue-500 transition" title="下载">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 课时导航 */}
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
        {/* 左侧：上一课 */}
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          上一课
        </button>
        
        {/* 中间：AI助手 */}
        <button
          onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-purple-300 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {aiAssistantOpen ? '收起助手' : 'AI助手'}
        </button>
        
        {/* 右侧：下一课 */}
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition">
          下一课
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
