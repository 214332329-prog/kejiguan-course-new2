'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isValidToken, setIsValidToken] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // 获取URL中的token和type参数
  const token = searchParams.get('token')
  const type = searchParams.get('type')

  useEffect(() => {
    // 检查是否有token
    if (!token || !type) {
      setIsValidToken(false)
      setError('无效的重置链接')
    }
  }, [token, type])

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError('请填写所有必填字段')
      return false
    }
    
    if (password.length < 6) {
      setError('密码长度至少为6位')
      return false
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    if (!token || !type) {
      setError('无效的重置链接')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: authError } = await supabase.auth.updateUser({
        password
      })

      if (authError) {
        setError(authError.message)
        return
      }

      setSuccess('密码重置成功！')
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)

    } catch (err: any) {
      setError(err.message || '密码重置失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            重置密码
          </h1>
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error || '无效的重置链接'}
          </div>
          <div className="mt-4">
            <a href="/auth/login" className="text-blue-600 hover:underline">
              返回登录
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
          重置密码
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
              {success}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              确认新密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? '重置中...' : '重置密码'}
          </button>
          
          <div className="text-center text-sm text-gray-600">
            <a href="/auth/login" className="text-blue-600 hover:underline">
              返回登录
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
