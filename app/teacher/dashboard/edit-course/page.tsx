'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Course, Module, Task, Resource } from '@/types'
import { courseService, moduleService, taskService } from '@/lib/database'
import TeacherAIAssistant from '@/components/TeacherAIAssistant'

// 模拟课程数据
const mockCourse: Course = {
  id: '1',
  title: '调研方法入门',
  description: '学习基本的调研方法和技巧',
  modules: [
    {
      id: 'module-1',
      title: '调研方法入门',
      description: '介绍基本的调研方法',
      tasks: [
        {
          id: 'task-1',
          title: '调研方法概述',
          taskType: 'theory',
          status: 'ongoing',
          duration: '45分钟',
          content: '调研方法是一种系统的、有目的的信息收集和分析方法...',
          requirements: [
            '调研报告PDF格式',
            '8000字以上',
            '包含访谈记录',
            '3张以上照片'
          ],
          resources: [
            {
              id: 'resource-1',
              name: '调研报告模板.docx',
              type: 'doc',
              size: '15KB'
            },
            {
              id: 'resource-2',
              name: 'PRD撰写指南.pdf',
              type: 'pdf',
              size: '1.8MB'
            },
            {
              id: 'resource-3',
              name: '用户研究方法.mp4',
              type: 'video',
              size: '45MB'
            }
          ]
        },
        {
          id: 'task-2',
          title: '访谈技巧学习',
          taskType: 'theory',
          status: 'pending',
          duration: '60分钟',
          content: '访谈是调研中常用的方法之一...'
        }
      ]
    },
    {
      id: 'module-2',
      title: '实地考察实践',
      description: '通过实地考察学习调研方法',
      tasks: [
        {
          id: 'task-3',
          title: '实地考察准备',
          taskType: 'practice',
          status: 'pending',
          duration: '30分钟'
        },
        {
          id: 'task-4',
          title: '实地考察执行',
          taskType: 'practice',
          status: 'pending',
          duration: '90分钟'
        }
      ]
    }
  ],
  totalDuration: '3小时',
  totalTasks: 6
}

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course>({
    id: courseId,
    title: '',
    description: '',
    modules: [],
    totalDuration: '',
    totalTasks: 0
  })
  const [activeModuleId, setActiveModuleId] = useState<string>('')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    setLoading(true)
    const courseData = await courseService.getCourse(courseId)
    if (courseData) {
      // 获取课程的模块
      const modules = await moduleService.getModulesByCourseId(courseId)
      
      // 为每个模块获取任务
      const modulesWithTasks = await Promise.all(
        modules.map(async (module) => {
          const tasks = await taskService.getTasksByModuleId(module.id)
          return {
            ...module,
            tasks
          }
        })
      )
      
      setCourse({
        ...courseData,
        modules: modulesWithTasks
      })
      
      if (modulesWithTasks.length > 0) {
        setActiveModuleId(modulesWithTasks[0].id)
      }
    }
    setLoading(false)
  }

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

  // 添加新模块
  const handleAddModule = () => {
    const newModule: Module = {
      id: `module-${course.modules.length + 1}`,
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
      id: `task-${module.tasks.length + 1}`,
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
    setActiveTaskId(newTask.id)
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
      // 更新课程基本信息
      const updatedCourse = await courseService.updateCourse(course.id, {
        title: course.title,
        description: course.description,
        totalDuration: course.totalDuration,
        totalTasks: course.modules.reduce((total, module) => total + module.tasks.length, 0)
      })
      
      if (updatedCourse) {
        // 更新模块和任务
        for (const module of course.modules) {
          if (module.id) {
            // 更新现有模块
            await moduleService.updateModule(module.id, {
              title: module.title,
              description: module.description,
              icon: module.icon
            })
            
            // 更新或创建任务
            for (const task of module.tasks) {
              if (task.id) {
                // 更新现有任务
                await taskService.updateTask(task.id, {
                  title: task.title,
                  taskType: task.taskType,
                  status: task.status,
                  duration: task.duration,
                  content: task.content
                })
              } else {
                // 创建新任务
                await taskService.createTask({
                  module_id: module.id,
                  title: task.title,
                  task_type: task.taskType,
                  status: task.status,
                  duration: task.duration,
                  content: task.content
                })
              }
            }
          } else {
            // 创建新模块
            const savedModule = await moduleService.createModule({
              course_id: course.id,
              title: module.title,
              description: module.description,
              icon: module.icon
            })
            
            if (savedModule) {
              // 创建模块的任务
              for (const task of module.tasks) {
                await taskService.createTask({
                  module_id: savedModule.id,
                  title: task.title,
                  task_type: task.taskType,
                  status: task.status,
                  duration: task.duration,
                  content: task.content
                })
              }
            }
          }
        }
        
        console.log('课程保存成功:', updatedCourse)
        setSaveSuccess(true)
        // 2秒后跳转到仪表盘
        setTimeout(() => {
          router.push('/teacher/dashboard')
        }, 2000)
      } else {
        console.error('课程保存失败')
        alert('课程保存失败，请重试')
      }
    } catch (error) {
      console.error('课程保存错误:', error)
      alert('保存课程时发生错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">教师课程开发中心</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/teacher/dashboard')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-4"
              >
                返回
              </button>
              {saveSuccess ? (
                <button
                  disabled
                  className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  保存成功
                </button>
              ) : (
                <button
                  onClick={handleSaveCourse}
                  disabled={saving}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                  {saving ? '保存中...' : '保存课程'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 侧边导航 */}
      <div className="flex">
        <aside className="w-64 md:w-56 bg-white shadow-sm hidden md:block">
          <nav className="mt-5 px-2 space-y-1">
            <a
              href="/teacher/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              课程管理
            </a>
            <a
              href="/teacher/analytics"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              数据分析
            </a>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* 课程基本信息 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">课程基本信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">课程标题</label>
                  <input
                    type="text"
                    value={course.title}
                    onChange={(e) => handleCourseUpdate('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">总时长</label>
                  <input
                    type="text"
                    value={course.totalDuration}
                    onChange={(e) => handleCourseUpdate('totalDuration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">课程描述</label>
                  <textarea
                    value={course.description}
                    onChange={(e) => handleCourseUpdate('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 课程模块和任务 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧模块列表 */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">课程模块</h2>
                    <button
                      onClick={handleAddModule}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                    >
                      添加模块
                    </button>
                  </div>
                  <div className="space-y-2">
                    {course.modules.map((module) => (
                      <div
                        key={module.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${activeModuleId === module.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                        onClick={() => setActiveModuleId(module.id)}
                      >
                        <h3 className="font-medium text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-600">{module.tasks.length} 个任务</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右侧模块和任务编辑 */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  {course.modules.map((module) => (
                    <div key={module.id} className={activeModuleId === module.id ? '' : 'hidden'}>
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">模块信息</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">模块标题</label>
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
                          <h2 className="text-lg font-semibold text-gray-900">任务列表</h2>
                          <button
                            onClick={() => handleAddTask(module.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                          >
                            添加任务
                          </button>
                        </div>
                        <div className="space-y-4">
                          {module.tasks.map((task) => (
                            <div key={task.id} className="border border-gray-200 rounded-md p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-medium text-gray-900">{task.title}</h3>
                                <div className="flex space-x-2">
                                  <button className="px-2 py-1 bg-yellow-500 text-white rounded-md text-xs hover:bg-yellow-600">
                                    编辑
                                  </button>
                                  <button className="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600">
                                    删除
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 底部保存按钮 */}
            <div className="mt-8 flex justify-end">
              {saveSuccess ? (
                <button
                  disabled
                  className="px-6 py-3 bg-green-500 text-white rounded-md flex items-center gap-2 text-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  保存成功
                </button>
              ) : (
                <button
                  onClick={handleSaveCourse}
                  disabled={saving}
                  className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
                >
                  {saving ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                  {saving ? '保存中...' : '保存课程'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* AI助手 */}
      <div className="max-w-7xl mx-auto">
        <TeacherAIAssistant currentPage="edit-course" />
      </div>
    </div>
  )
}
