'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userType, setUserType] = useState<'student' | 'teacher'>('student')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // 根据用户类型跳转到不同页面
      if (userType === 'teacher') {
        router.push('/teacher/dashboard')
      } else {
        router.push('/workspace')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
          科技馆课程平台
        </h1>
        
        {/* 用户类型切换 */}
        <div className="flex mb-6 border border-gray-200 rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setUserType('student')}
            className={`flex-1 py-2 text-center ${userType === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            学生登录
          </button>
          <button
            type="button"
            onClick={() => setUserType('teacher')}
            className={`flex-1 py-2 text-center ${userType === 'teacher' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            教师登录
          </button>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="mt-4 space-y-2 text-center text-sm">
          <a href="/auth/forgot-password" className="text-blue-600 hover:underline block">
            忘记密码？
          </a>
          <a href="/auth/register" className="text-blue-600 hover:underline block">
            没有账户？立即注册
          </a>
        </div>
      </div>
    </div>
  )
}