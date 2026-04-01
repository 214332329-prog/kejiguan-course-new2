'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LeftSidebar from '@/components/LeftSidebar'
import CenterPanel from '@/components/CenterPanel'
import RightSidebar from '@/components/RightSidebar'

import { Task, Module, Course } from '@/types'
import { courseService } from '@/lib/database'
import { cache, generateCacheKey } from '@/lib/cache'

// 计算已完成任务数
export const getCompletedTasksCount = (course: Course): number => {
  let count = 0
  course.modules.forEach(module => {
    module.tasks?.forEach(task => {
      if (task.status === 'completed') {
        count++
      }
    })
  })
  return count
}

// 计算总任务数
export const getTotalTasksCount = (course: Course): number => {
  let count = 0
  course.modules.forEach(module => {
    count += module.tasks?.length || 0
  })
  return count
}

// 根据ID获取任务
export const getTaskById = (course: Course, taskId: string): Task | null => {
  for (const module of course.modules) {
    const task = module.tasks?.find(t => t.id === taskId)
    if (task) {
      return task
    }
  }
  return null
}

// 根据ID获取模块
export const getModuleById = (course: Course, moduleId: string): Module | null => {
  return course.modules.find(m => m.id === moduleId) || null
}

export default function WorkspacePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [activeModuleId, setActiveModuleId] = useState<string>('')
  const [courseData, setCourseData] = useState<Course>({
    id: '',
    title: '',
    description: '',
    modules: [],
    totalDuration: '',
    totalTasks: 0
  })
  const [showLeftSidebar, setShowLeftSidebar] = useState(true)
  const [showRightSidebar, setShowRightSidebar] = useState(true)
  const router = useRouter()

  // 计算进度
  const completedTasks = getCompletedTasksCount(courseData)
  const totalTasks = getTotalTasksCount(courseData)

  useEffect(() => {
    checkUser()
    fetchCourseData()
  }, [])

  const fetchCourseData = async () => {
    try {
      // 清除缓存，确保获取最新数据
      cache.delete(generateCacheKey('courses'))
      // 尝试从数据库获取课程数据
      const courses = await courseService.getCourses()
      console.log('从数据库获取的课程数据:', courses)
      if (courses.length > 0) {
        // 使用第一个课程
        setCourseData(courses[0])
        setupInitialSelection(courses[0])
        // 更新本地存储
        localStorage.setItem('courses', JSON.stringify(courses))
      } else {
        // 从本地存储获取
        const localCourses = JSON.parse(localStorage.getItem('courses') || '[]')
        console.log('从本地存储获取的课程数据:', localCourses)
        if (localCourses.length > 0) {
          setCourseData(localCourses[0])
          setupInitialSelection(localCourses[0])
        } else {
          // 如果都没有数据，创建默认课程数据
          const defaultCourse = {
            id: 'default-course',
            title: '默认课程',
            description: '这是一个默认课程',
            modules: [
              {
                id: 'default-module',
                title: '新模块 1',
                tasks: [
                  {
                    id: 'default-task',
                    title: '默认任务',
                    taskType: 'theory' as const,
                    content: '这是一个默认任务，请开始学习',
                    status: 'pending' as const,
                    duration: '45分钟',
                    requirements: ['完成任务', '提交作业'],
                    resources: []
                  }
                ]
              }
            ],
            totalDuration: '45分钟',
            totalTasks: 1
          }
          setCourseData(defaultCourse)
          setupInitialSelection(defaultCourse)
        }
      }
    } catch (error) {
      console.error('获取课程数据失败:', error)
      // 从本地存储获取
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      if (localCourses.length > 0) {
        setCourseData(localCourses[0])
        setupInitialSelection(localCourses[0])
      } else {
        // 如果都没有数据，创建默认课程数据
        const defaultCourse = {
          id: 'default-course',
          title: '默认课程',
          description: '这是一个默认课程',
          modules: [
            {
              id: 'default-module',
              title: '新模块 1',
              tasks: [
                {
                  id: 'default-task',
                  title: '默认任务',
                  taskType: 'theory' as const,
                  content: '这是一个默认任务，请开始学习',
                  status: 'pending' as const,
                  duration: '45分钟',
                  requirements: ['完成任务', '提交作业'],
                  resources: []
                }
              ]
            }
          ],
          totalDuration: '45分钟',
          totalTasks: 1
        }
        setCourseData(defaultCourse)
        setupInitialSelection(defaultCourse)
      }
    } finally {
      setLoading(false)
    }
  }

  const setupInitialSelection = (course: Course) => {
    // 默认选中第一个进行中的任务
    const currentTask = course.modules
      .flatMap(m => m.tasks)
      .find(t => t.status === 'ongoing')
    if (currentTask) {
      setSelectedTask(currentTask)
      // 找到包含这个任务的模块
      for (const module of course.modules) {
        if (module.tasks.find(t => t.id === currentTask.id)) {
          setSelectedModule(module)
          setActiveModuleId(module.id)
          break
        }
      }
    } else if (course.modules.length > 0) {
      // 如果没有进行中的任务，选中第一个模块的第一个任务
      const firstModule = course.modules[0]
      setSelectedModule(firstModule)
      setActiveModuleId(firstModule.id)
      if (firstModule.tasks.length > 0) {
        setSelectedTask(firstModule.tasks[0])
      }
    }
  }

  // 当课程数据变化时，重新设置初始选择
  useEffect(() => {
    if (courseData.modules.length > 0) {
      setupInitialSelection(courseData)
    }
  }, [courseData])

  const checkUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error getting user:', error)
        // If auth fails, still load the app with default data
        setUser(null)
      } else if (data.user) {
        setUser(data.user)
      } else {
        // No user logged in, still load the app with default data
        setUser(null)
      }
    } catch (error) {
      console.error('Error in checkUser:', error)
      // If there's any error, still load the app with default data
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      router.push('/auth/login')
    }
  }

  const handleSelectModule = (moduleId: string) => {
    setActiveModuleId(moduleId)
    const module = getModuleById(courseData, moduleId)
    if (module) {
      setSelectedModule(module)
      // 自动选中该模块的第一个任务
      if (module.tasks.length > 0) {
        setSelectedTask(module.tasks[0])
      }
    }
  }

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task)
    // 更新当前模块
    for (const module of courseData.modules) {
      if (module.tasks.find(t => t.id === task.id)) {
        setSelectedModule(module)
        setActiveModuleId(module.id)
        break
      }
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                科技馆课程平台
              </h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 三栏布局 */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* 主内容区域 - 三栏布局 */}
        <main className="flex-1 overflow-hidden relative">
          <CenterPanel
            selectedTask={selectedTask}
            currentModule={selectedModule}
            user={user}
          />
        </main>
      </div>

      {/* 移动端导航 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-10">
        <button className="flex flex-col items-center justify-center text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">课程</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs mt-1">任务</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs mt-1">讨论</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-1">我的</span>
        </button>
      </div>
    </div>
  )
}
