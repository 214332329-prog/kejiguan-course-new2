'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Course, Module, Task } from '@/types'
import { courseService, moduleService, taskService } from '@/lib/database'

function CourseManagementContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('id')
  
  const [course, setCourse] = useState<Course | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails()
    } else {
      router.push('/teacher/dashboard')
    }
  }, [courseId, router])

  const fetchCourseDetails = async () => {
    if (!courseId) return
    
    setLoading(true)
    setError(null)
    
    try {
      // 尝试从数据库获取课程详情
      let courseData: Course | null = null
      try {
        courseData = await courseService.getCourse(courseId)
      } catch (dbError) {
        console.warn('数据库获取失败，尝试从本地存储获取:', dbError)
        // 从本地存储获取
        const localCourses = JSON.parse(localStorage.getItem('courses') || '[]')
        courseData = localCourses.find((c: Course) => c.id === courseId) || null
      }
      
      if (courseData) {
        // 如果有模块，默认展开第一个模块
        if (courseData.modules && courseData.modules.length > 0) {
          setExpandedModules(new Set([courseData.modules[0].id]))
        }
        setCourse(courseData)
      } else {
        setError('课程不存在')
      }
    } catch (error) {
      console.error('获取课程详情错误:', error)
      setError('获取课程详情失败')
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
  }

  const handleEditCourse = () => {
    if (courseId) {
      router.push(`/teacher/dashboard/edit-course?id=${courseId}`)
    }
  }

  const handleDeleteCourse = async () => {
    if (!courseId) return
    
    if (confirm('确定要删除这门课程吗？')) {
      try {
        const success = await courseService.deleteCourse(courseId)
        if (success) {
          // 同时从本地存储删除
          const localCourses = JSON.parse(localStorage.getItem('courses') || '[]')
          const updatedCourses = localCourses.filter((c: Course) => c.id !== courseId)
          localStorage.setItem('courses', JSON.stringify(updatedCourses))
          router.push('/teacher/dashboard')
        } else {
          alert('删除课程失败，请重试')
        }
      } catch (error) {
        console.error('删除课程错误:', error)
        alert('删除课程时发生错误')
      }
    }
  }

  const handleEditModule = (moduleId: string) => {
    // 跳转到模块编辑页面
    router.push(`/teacher/dashboard/edit-course?id=${courseId}&moduleId=${moduleId}`)
  }

  const handleEditTask = (taskId: string) => {
    // 跳转到任务编辑页面
    router.push(`/teacher/dashboard/edit-course?id=${courseId}&taskId=${taskId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载课程信息中...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.77-1.964-.77-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{error || '课程不存在'}</h3>
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
          >
            返回课程列表
          </button>
        </div>
      </div>
    )
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/teacher/dashboard')}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回
              </button>
            </div>
          </div>
        </div>
      </header>

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
              课程列表
            </a>
            <a
              href={`/teacher/dashboard/course-management?id=${courseId}`}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-50 text-blue-700 border-l-4 border-blue-500 transition-all hover:bg-blue-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              课程管理
            </a>
            <a
              href={`/teacher/dashboard/edit-course?id=${courseId}`}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              编辑课程
            </a>
          </nav>
        </aside>

        {/* 主内容 */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* 课程信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h2>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      总时长: {course.totalDuration}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      总任务: {course.totalTasks}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      模块数: {course.modules?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleEditCourse}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    编辑课程
                  </button>
                  <button
                    onClick={handleDeleteCourse}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    删除课程
                  </button>
                </div>
              </div>
            </div>

            {/* 课程目录 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">课程目录</h3>
              
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* 模块头部 */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-medium">{course.modules?.indexOf(module) + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{module.title}</h4>
                            <p className="text-sm text-gray-500">{module.tasks?.length || 0} 个任务</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditModule(module.id)
                            }}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600 transition-colors"
                          >
                            编辑
                          </button>
                          <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedModules.has(module.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {/* 任务列表 */}
                      {expandedModules.has(module.id) && module.tasks && (
                        <div className="p-4 border-t border-gray-200">
                          {module.tasks.length > 0 ? (
                            <div className="space-y-3">
                              {module.tasks.map((task, taskIndex) => (
                                <div key={task.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-green-600 text-xs font-medium">{taskIndex + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-800">{task.title}</h5>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{task.duration}</span>
                                        <span className={`px-2 py-0.5 rounded-full ${task.taskType === 'theory' ? 'bg-blue-100 text-blue-800' : task.taskType === 'practice' ? 'bg-green-100 text-green-800' : task.taskType === 'quiz' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'}`}>
                                          {task.taskType === 'theory' ? '理论' : task.taskType === 'practice' ? '实践' : task.taskType === 'quiz' ? '测验' : '讨论'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' : task.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                          {task.status === 'completed' ? '已完成' : task.status === 'ongoing' ? '进行中' : '待开始'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleEditTask(task.id)}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors"
                                  >
                                    编辑
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>该模块暂无任务</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p>课程暂无模块</p>
                  <button
                    onClick={handleEditCourse}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
                  >
                    添加模块
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

import { Suspense } from 'react'

export default function CourseManagement() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <CourseManagementContent />
    </Suspense>
  )
}
