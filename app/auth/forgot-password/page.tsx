'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const validateForm = () => {
    if (!email) {
      setError('请输入邮箱地址')
      return false
    }
    
    if (!/+@+\.+/.test(email)) {
      setError('请输入有效的邮箱地址')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (authError) {
        setError(authError.message)
        return
      }

      setSuccess('密码重置邮件已发送，请检查您的邮箱')
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)

    } catch (err: any) {
      setError(err.message || '发送邮件失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
          忘记密码
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
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? '发送邮件中...' : '发送重置邮件'}
          </button>
          
          <div className="text-center text-sm text-gray-600">
            想起密码了？ <a href="/auth/login" className="text-blue-600 hover:underline">返回登录</a>
          </div>
        </form>
      </div>
    </div>
  )
}
