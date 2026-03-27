'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// 模拟数据分析数据
const mockAnalyticsData = {
  courses: [
    {
      id: '1',
      title: '调研方法入门',
      totalStudents: 128,
      completedStudents: 76,
      completionRate: 59.38,
      averageScore: 85.5,
      totalTasks: 6,
      completedTasks: 4.2,
      averageTimeSpent: '2小时30分钟'
    },
    {
      id: '2',
      title: '实地考察实践',
      totalStudents: 95,
      completedStudents: 48,
      completionRate: 50.53,
      averageScore: 82.3,
      totalTasks: 8,
      completedTasks: 3.8,
      averageTimeSpent: '3小时15分钟'
    }
  ],
  studentPerformance: [
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      courses: [
        {
          courseId: '1',
          courseTitle: '调研方法入门',
          progress: 83,
          score: 92,
          tasksCompleted: 5,
          timeSpent: '3小时15分钟'
        }
      ]
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      courses: [
        {
          courseId: '1',
          courseTitle: '调研方法入门',
          progress: 67,
          score: 78,
          tasksCompleted: 4,
          timeSpent: '2小时45分钟'
        },
        {
          courseId: '2',
          courseTitle: '实地考察实践',
          progress: 33,
          score: 65,
          tasksCompleted: 2,
          timeSpent: '1小时30分钟'
        }
      ]
    },
    {
      id: '3',
      name: '王五',
      email: 'wangwu@example.com',
      courses: [
        {
          courseId: '2',
          courseTitle: '实地考察实践',
          progress: 75,
          score: 88,
          tasksCompleted: 6,
          timeSpent: '3小时45分钟'
        }
      ]
    }
  ],
  taskCompletion: [
    {
      taskId: '1',
      taskTitle: '调研方法概述',
      totalSubmissions: 120,
      passedSubmissions: 105,
      passRate: 87.5,
      averageScore: 86.2
    },
    {
      taskId: '2',
      taskTitle: '访谈技巧学习',
      totalSubmissions: 95,
      passedSubmissions: 82,
      passRate: 86.3,
      averageScore: 84.7
    },
    {
      taskId: '3',
      taskTitle: '实地考察准备',
      totalSubmissions: 68,
      passedSubmissions: 52,
      passRate: 76.5,
      averageScore: 79.3
    }
  ],
  learningTimeDistribution: [
    { hour: '00:00', count: 5 },
    { hour: '01:00', count: 2 },
    { hour: '02:00', count: 1 },
    { hour: '03:00', count: 0 },
    { hour: '04:00', count: 0 },
    { hour: '05:00', count: 1 },
    { hour: '06:00', count: 3 },
    { hour: '07:00', count: 8 },
    { hour: '08:00', count: 15 },
    { hour: '09:00', count: 25 },
    { hour: '10:00', count: 32 },
    { hour: '11:00', count: 28 },
    { hour: '12:00', count: 20 },
    { hour: '13:00', count: 15 },
    { hour: '14:00', count: 22 },
    { hour: '15:00', count: 28 },
    { hour: '16:00', count: 35 },
    { hour: '17:00', count: 30 },
    { hour: '18:00', count: 25 },
    { hour: '19:00', count: 30 },
    { hour: '20:00', count: 35 },
    { hour: '21:00', count: 28 },
    { hour: '22:00', count: 18 },
    { hour: '23:00', count: 10 }
  ]
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData)
  const [selectedCourse, setSelectedCourse] = useState<string>('1')
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
    } else {
      router.push('/auth/login')
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>
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
              <span className="mr-4 text-sm text-gray-600 hidden sm:block">{user?.email}</span>
              <button
                onClick={() => supabase.auth.signOut().then(() => router.push('/auth/login'))}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出
              </button>
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
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-50 text-blue-700 border-l-4 border-blue-500 transition-all hover:bg-blue-100"
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

      {/* 侧边导航 */}
      <div className="flex">
        <aside className="w-64 bg-white shadow-sm hidden md:block">
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
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-50 text-blue-700 border-l-4 border-blue-500 transition-all hover:bg-blue-100"
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

        {/* 主内容区 */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* 页面标题 */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">数据分析</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  {analyticsData.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  导出报告
                </button>
              </div>
            </div>

            {/* 课程概览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">总学生数</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.courses.find(c => c.id === selectedCourse)?.totalStudents}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">完成率</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.courses.find(c => c.id === selectedCourse)?.completionRate}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">平均分数</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.courses.find(c => c.id === selectedCourse)?.averageScore}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">平均学习时间</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.courses.find(c => c.id === selectedCourse)?.averageTimeSpent}
                </p>
              </div>
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 学习时间分布 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">学习时间分布</h3>
                <div className="h-80">
                  {/* 这里可以集成Chart.js或其他图表库 */}
                  <div className="flex items-end justify-around h-full">
                    {analyticsData.learningTimeDistribution.slice(8, 20).map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="bg-blue-500 w-8 rounded-t-md"
                          style={{ height: `${(item.count / 40) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-1">{item.hour}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 任务完成情况 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">任务完成情况</h3>
                <div className="space-y-4">
                  {analyticsData.taskCompletion.map((task) => (
                    <div key={task.taskId}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{task.taskTitle}</span>
                        <span className="text-sm font-medium text-gray-700">{task.passRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: `${task.passRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 学生表现表格 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">学生学习表现</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        学生姓名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        邮箱
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        课程
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        进度
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        分数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        任务完成
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        学习时间
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.studentPerformance.map((student) => (
                      <React.Fragment key={student.id}>
                        {student.courses.map((course, index) => (
                          <tr key={`${student.id}-${course.courseId}`}>
                            {index === 0 && (
                              <td rowSpan={student.courses.length} className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              </td>
                            )}
                            {index === 0 && (
                              <td rowSpan={student.courses.length} className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{student.email}</div>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{course.courseTitle}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{course.progress}%</div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{course.score}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{course.tasksCompleted}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{course.timeSpent}</div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
