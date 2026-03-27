'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Course, Module, Task, Resource } from '@/types'
import { courseService, moduleService, taskService } from '@/lib/database'
import TeacherAIAssistant from '@/components/TeacherAIAssistant'

// 资源添加按钮组件
interface ResourceAddButtonProps {
  type: 'link' | 'doc' | 'video' | 'pdf'
  label: string
  icon: string
  color: 'blue' | 'orange' | 'purple' | 'gray'
  onAdd: (resource: Resource) => void
}

function ResourceAddButton({ type, label, color, onAdd }: ResourceAddButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', url: '', content: '' })

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
    orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200',
    gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const resource: Resource = {
      id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      type: type
    }

    if (type === 'link' && formData.url) {
      resource.url = formData.url
    } else if (type === 'doc' && formData.content) {
      resource.content = formData.content
      resource.size = `${formData.content.length} 字符`
    } else {
      resource.size = type === 'video' ? '10MB' : '2MB'
    }

    onAdd(resource)
    setIsModalOpen(false)
    setFormData({ name: '', url: '', content: '' })
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`px-3 py-2 rounded-lg text-sm transition-colors border flex items-center gap-2 ${colorClasses[color]}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {label}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">{label}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  资源名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`请输入${label.replace('添加', '')}名称`}
                  required
                />
              </div>

              {type === 'link' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    网址 *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                    required
                  />
                </div>
              )}

              {type === 'doc' && label === '添加文本' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文本内容 *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="请输入文本内容"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// 拖拽排序功能
const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

export default function CreateCoursePage() {
  const router = useRouter()
  const [dragging, setDragging] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const [course, setCourse] = useState<Course>({
    id: `course-${Date.now()}`,
    title: '',
    description: '',
    modules: [],
    totalDuration: '',
    totalTasks: 0
  })
  
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)

  // 处理课程信息更新
  const handleCourseUpdate = (field: keyof Course, value: string) => {
    setCourse(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 处理模块更新
  const handleModuleUpdate = (moduleId: string, field: keyof Module, value: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId ? { ...module, [field]: value } : module
      )
    }))
  }

  // 处理任务更新
  const handleTaskUpdate = (moduleId: string, taskId: string, field: keyof Task, value: string | string[]) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              tasks: module.tasks.map(task =>
                task.id === taskId ? { ...task, [field]: value } : task
              )
            }
          : module
      )
    }))
  }

  // 处理资源添加
  const handleAddResource = (moduleId: string, taskId: string, resource: any) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              tasks: module.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      resources: [...(task.resources || []), resource]
                    }
                  : task
              )
            }
          : module
      )
    }))
  }

  // 处理资源删除
  const handleRemoveResource = (moduleId: string, taskId: string, resourceId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              tasks: module.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      resources: task.resources?.filter(r => r.id !== resourceId) || []
                    }
                  : task
              )
            }
          : module
      )
    }))
  }

  // 添加新模块
  const handleAddModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `新模块 ${course.modules.length + 1}`,
      description: '',
      tasks: []
    }
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }))
    setActiveModuleId(newModule.id)
  }

  // 添加新任务
  const handleAddTask = (moduleId: string) => {
    const module = course.modules.find(m => m.id === moduleId)
    if (!module) return

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: `新任务 ${module.tasks.length + 1}`,
      taskType: 'theory',
      status: 'pending',
      duration: '30分钟'
    }

    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? { ...m, tasks: [...m.tasks, newTask] }
          : m
      )
    }))
  }

  // 删除模块
  const handleDeleteModule = (moduleId: string) => {
    if (confirm('确定要删除这个模块吗？删除后模块内的所有任务也会被删除。')) {
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.filter(module => module.id !== moduleId)
      }))
      if (activeModuleId === moduleId) {
        setActiveModuleId(prev => prev === moduleId ? null : prev)
      }
    }
  }

  // 删除任务
  const handleDeleteTask = (moduleId: string, taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                tasks: module.tasks.filter(task => task.id !== taskId)
              }
            : module
        )
      }))
    }
  }

  // 模块拖拽排序
  const handleModuleDragStart = () => setDragging(true)
  const handleModuleDragEnd = () => setDragging(false)
  
  const handleModuleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }
  
  const handleModuleDrop = (e: React.DragEvent, endIndex: number, startIndex: number) => {
    e.preventDefault()
    if (startIndex !== endIndex) {
      setCourse(prev => ({
        ...prev,
        modules: reorder(prev.modules, startIndex, endIndex)
      }))
    }
  }

  // 任务拖拽排序
  const handleTaskDragEnd = (moduleId: string, startIndex: number, endIndex: number) => {
    if (startIndex !== endIndex) {
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                tasks: reorder(module.tasks, startIndex, endIndex)
              }
            : module
        )
      }))
    }
  }

  // 计算总任务数
  const calculateTotalTasks = () => {
    return course.modules.reduce((total, module) => total + module.tasks.length, 0)
  }

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 保存课程
  const handleSaveCourse = async () => {
    // 验证表单
    if (!course.title.trim()) {
      alert('请输入课程标题')
      return
    }

    setSaving(true)
    
    try {
      const updatedCourse = {
        ...course,
        totalTasks: calculateTotalTasks()
      }
      
      // 尝试保存课程到数据库
      let savedCourse = null
      try {
        savedCourse = await courseService.createCourse({
          title: updatedCourse.title,
          description: updatedCourse.description,
          totalDuration: updatedCourse.totalDuration,
          totalTasks: updatedCourse.totalTasks
        })
      } catch (dbError) {
        console.warn('数据库保存失败，使用本地存储:', dbError)
      }
      
      // 如果数据库保存失败，使用本地存储
      if (!savedCourse) {
        savedCourse = {
          ...updatedCourse,
          id: `course-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // 保存到本地存储
        const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]')
        existingCourses.push(savedCourse)
        localStorage.setItem('courses', JSON.stringify(existingCourses))
        
        // 保存模块和任务到本地存储
        const existingModules = JSON.parse(localStorage.getItem('modules') || '[]')
        const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        
        for (const module of updatedCourse.modules) {
          const moduleWithId = {
            ...module,
            id: `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            course_id: savedCourse.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          existingModules.push(moduleWithId)
          
          for (const task of module.tasks) {
            const taskWithId = {
              ...task,
              id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              module_id: moduleWithId.id,
              task_type: task.taskType,
              quiz_questions: task.quizQuestions,
              discussion_topic: task.discussionTopic,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            existingTasks.push(taskWithId)
          }
        }
        
        localStorage.setItem('modules', JSON.stringify(existingModules))
        localStorage.setItem('tasks', JSON.stringify(existingTasks))
        
        console.log('课程已保存到本地存储:', savedCourse)
      } else {
        // 数据库保存成功，继续保存模块和任务
        for (const module of updatedCourse.modules) {
          const savedModule = await moduleService.createModule({
            course_id: savedCourse.id,
            title: module.title,
            description: module.description,
            icon: module.icon
          })
          
          if (savedModule) {
            for (const task of module.tasks) {
              await taskService.createTask({
                module_id: savedModule.id,
                title: task.title,
                task_type: task.taskType,
                status: task.status,
                duration: task.duration,
                content: task.content,
                quiz_questions: task.quizQuestions,
                discussion_topic: task.discussionTopic
              })
            }
          }
        }
        
        console.log('课程创建成功:', savedCourse)
      }
      
      setSaveSuccess(true)
      // 2秒后跳转到仪表盘
      setTimeout(() => {
        router.push('/teacher/dashboard')
      }, 2000)
    } catch (error) {
      console.error('课程创建错误:', error)
      alert('创建课程时发生错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-800">教师课程开发中心</h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => router.push('/teacher/dashboard')}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回
              </button>
              {saveSuccess ? (
                <button
                  disabled
                  className="px-4 py-1.5 bg-green-500 text-white rounded-lg flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  创建成功
                </button>
              ) : (
                <button
                  onClick={handleSaveCourse}
                  disabled={saving}
                  className="px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 text-sm"
                >
                  {saving ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                  {saving ? '创建中...' : '保存课程'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 移动端侧边导航 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">导航菜单</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <a
                href="/teacher/dashboard"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                课程管理
              </a>
              <a
                href="/teacher/analytics"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                数据分析
              </a>
              <a
                href="/teacher/resources"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                资源管理
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* 侧边导航 */}
        <aside className="w-64 bg-white shadow-sm hidden md:block h-[calc(100vh-4rem)] sticky top-16">
          <nav className="mt-6 px-4 space-y-1">
            <a
              href="/teacher/dashboard"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              课程管理
            </a>
            <a
              href="/teacher/analytics"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              数据分析
            </a>
            <a
              href="/teacher/resources"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              资源管理
            </a>
          </nav>
        </aside>

        {/* 主内容 */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* 页面标题 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">创建新课程</h2>
              <p className="text-gray-600">设计和构建您的课程内容</p>
            </div>

            {/* 课程基本信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">课程基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">课程标题 *</label>
                  <input
                    type="text"
                    value={course.title}
                    onChange={(e) => handleCourseUpdate('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入课程标题"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">总时长</label>
                  <input
                    type="text"
                    value={course.totalDuration}
                    onChange={(e) => handleCourseUpdate('totalDuration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如: 3小时"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">课程描述</label>
                  <textarea
                    value={course.description}
                    onChange={(e) => handleCourseUpdate('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入课程描述"
                  />
                </div>
              </div>
            </div>

            {/* 课程模块和任务 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧模块列表 */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">课程模块</h3>
                    <button
                      onClick={handleAddModule}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-1 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      添加模块
                    </button>
                  </div>
                  <div className="space-y-3">
                    {course.modules.map((module, index) => (
                      <div
                        key={module.id}
                        draggable
                        onDragStart={() => handleModuleDragStart()}
                        onDragEnd={handleModuleDragEnd}
                        onDragOver={(e) => handleModuleDragOver(e, index)}
                        onDrop={(e) => {
                          const startIndex = course.modules.findIndex(m => m.id === module.id)
                          handleModuleDrop(e, index, startIndex)
                        }}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${activeModuleId === module.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-gray-100'}`}
                        style={{ opacity: dragging ? 0.5 : 1 }}
                      >
                        <div className="flex justify-between items-center">
                          <div onClick={() => setActiveModuleId(module.id)} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-medium">{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">{module.title}</h4>
                                <p className="text-sm text-gray-600">{module.tasks.length} 个任务</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-gray-400 cursor-grab">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteModule(module.id)
                              }}
                              className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors"
                              title="删除模块"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {course.modules.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                        <p>点击添加模块开始创建课程</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 右侧模块和任务编辑 */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  {course.modules.map((module) => (
                    <div key={module.id} className={activeModuleId === module.id ? '' : 'hidden'}>
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">模块信息</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">模块标题 *</label>
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) => handleModuleUpdate(module.id, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">模块图标</label>
                            <input
                              type="text"
                              value={module.icon || ''}
                              onChange={(e) => handleModuleUpdate(module.id, 'icon', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="例如: book"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">模块描述</label>
                            <textarea
                              value={module.description || ''}
                              onChange={(e) => handleModuleUpdate(module.id, 'description', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">任务列表</h3>
                          <button
              onClick={() => handleAddTask(module.id)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-1 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              添加任务
            </button>
                        </div>
                        <div className="space-y-4">
                          {module.tasks.map((task, taskIndex) => (
                            <div 
                              key={task.id} 
                              className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-green-600 font-medium">{taskIndex + 1}</span>
                                  </div>
                                  <h4 className="font-medium text-gray-800">{task.title}</h4>
                                </div>
                                <div className="flex space-x-2">
                                  <button className="px-2 py-1 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600 transition-colors flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    编辑
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTask(module.id, task.id)}
                                    className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    删除
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">任务类型</label>
                                  <select
                                    value={task.taskType || 'theory'}
                                    onChange={(e) => handleTaskUpdate(module.id, task.id, 'taskType', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="theory">理论学习</option>
                                    <option value="practice">实践操作</option>
                                    <option value="quiz">测验</option>
                                    <option value="discussion">讨论</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">任务状态</label>
                                  <select
                                    value={task.status}
                                    onChange={(e) => handleTaskUpdate(module.id, task.id, 'status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="pending">待开始</option>
                                    <option value="ongoing">进行中</option>
                                    <option value="completed">已完成</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">任务时长</label>
                                  <input
                                    type="text"
                                    value={task.duration || ''}
                                    onChange={(e) => handleTaskUpdate(module.id, task.id, 'duration', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="例如: 45分钟"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">任务内容</label>
                                  <textarea
                                    value={task.content || ''}
                                    onChange={(e) => handleTaskUpdate(module.id, task.id, 'content', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">任务要求</label>
                                  <textarea
                                    value={task.requirements?.join('\n') || ''}
                                    onChange={(e) => handleTaskUpdate(module.id, task.id, 'requirements', e.target.value.split('\n'))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="每行一个要求"
                                  />
                                </div>
                                {/* 测验任务配置 */}
                                {(task.taskType === 'quiz') && (
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">测验问题</label>
                                    <textarea
                                      value={task.quizQuestions?.map(q => `${q.question}\n${q.options?.join('\n')}\n${q.correctAnswer}`).join('\n\n') || ''}
                                      onChange={(e) => {
                                        const lines = e.target.value.split('\n');
                                        const questions: any[] = [];
                                        let currentQuestion: any = { question: '', options: [] as string[], correctAnswer: '' };
                                        
                                        for (const line of lines) {
                                          if (line.trim() === '' && currentQuestion.question) {
                                            questions.push(currentQuestion);
                                            currentQuestion = { question: '', options: [] as string[], correctAnswer: '' };
                                          } else if (!currentQuestion.question) {
                                            currentQuestion.question = line;
                                          } else if (!currentQuestion.correctAnswer) {
                                            currentQuestion.options.push(line);
                                          } else {
                                            currentQuestion.correctAnswer = line;
                                          }
                                        }
                                        
                                        if (currentQuestion.question) {
                                          questions.push(currentQuestion);
                                        }
                                        
                                        handleTaskUpdate(module.id, task.id, 'quizQuestions', questions);
                                      }}
                                      rows={6}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="问题1\n选项A\n选项B\n选项C\n正确答案\n\n问题2\n..."
                                    />
                                  </div>
                                )}
                                {/* 讨论任务配置 */}
                                {(task.taskType === 'discussion') && (
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">讨论主题</label>
                                    <input
                                      type="text"
                                      value={task.discussionTopic || ''}
                                      onChange={(e) => handleTaskUpdate(module.id, task.id, 'discussionTopic', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="输入讨论主题"
                                    />
                                  </div>
                                )}
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-3">富媒体资源</label>
                                  
                                  {/* 资源列表 */}
                                  {task.resources && task.resources.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                      {task.resources.map((resource) => (
                                        <div key={resource.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
                                          <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                              resource.type === 'link' ? 'bg-blue-100' :
                                              resource.type === 'video' ? 'bg-purple-100' :
                                              resource.type === 'pdf' ? 'bg-red-100' :
                                              'bg-gray-100'
                                            }`}>
                                              {resource.type === 'link' && <span className="text-blue-600 text-xs font-bold">URL</span>}
                                              {resource.type === 'doc' && <span className="text-orange-600 text-xs font-bold">DOC</span>}
                                              {resource.type === 'video' && <span className="text-purple-600 text-xs font-bold">视频</span>}
                                              {resource.type === 'pdf' && <span className="text-red-600 text-xs font-bold">PDF</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-gray-800 truncate">{resource.name}</p>
                                              {resource.type === 'link' && resource.url && (
                                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block max-w-[200px]">
                                                  {resource.url}
                                                </a>
                                              )}
                                              {resource.size && <p className="text-xs text-gray-500">{resource.size}</p>}
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => handleRemoveResource(module.id, task.id, resource.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                                            title="删除资源"
                                          >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* 添加资源按钮组 */}
                                  <div className="flex flex-wrap gap-2">
                                    <ResourceAddButton
                                      type="link"
                                      label="添加网址"
                                      icon="link"
                                      color="blue"
                                      onAdd={(resource) => handleAddResource(module.id, task.id, resource)}
                                    />
                                    <ResourceAddButton
                                      type="doc"
                                      label="添加PPT"
                                      icon="ppt"
                                      color="orange"
                                      onAdd={(resource) => handleAddResource(module.id, task.id, resource)}
                                    />
                                    <ResourceAddButton
                                      type="video"
                                      label="添加视频"
                                      icon="video"
                                      color="purple"
                                      onAdd={(resource) => handleAddResource(module.id, task.id, resource)}
                                    />
                                    <ResourceAddButton
                                      type="doc"
                                      label="添加文本"
                                      icon="text"
                                      color="gray"
                                      onAdd={(resource) => handleAddResource(module.id, task.id, resource)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {module.tasks.length === 0 && (
                            <div className="text-center py-6 text-gray-500">
                              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <p>点击添加任务</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {course.modules.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">开始创建课程</h3>
                      <p className="mb-6">点击左侧添加模块开始创建课程</p>
                      <button
                        onClick={handleAddModule}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm mx-auto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        添加第一个模块
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI助手 */}
            <TeacherAIAssistant currentPage="create-course" />
          </div>
        </main>
      </div>
    </div>
  )
}
