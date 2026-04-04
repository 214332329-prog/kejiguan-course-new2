'use client'

import { useState, useEffect } from 'react'

interface ModelMetrics {
  successRate: string
  averageResponseTime: string
  totalRequests: number
  errorCount: number
  successCount: number
  cpuUsage?: number
  memoryUsage?: number
  gpuUsage?: number
  isOnline: boolean
  lastCheckTime: number
}

interface ModelStatusData {
  isOnline: boolean
  lastCheckTime: number
  responseTime: number
  errorCount: number
  successCount: number
  totalRequests: number
  averageResponseTime: number
  cpuUsage?: number
  memoryUsage?: number
  gpuUsage?: number
}

export default function ModelStatusMonitor() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null)
  const [status, setStatus] = useState<ModelStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/model/status')
      const result = await response.json()

      if (result.success) {
        setMetrics(result.data.metrics)
        setStatus(result.data.status)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch status')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000) // 每10秒刷新一次
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">加载模型状态...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'bg-green-500' : 'bg-red-500'
  }

  const getStatusText = (isOnline: boolean) => {
    return isOnline ? '在线' : '离线'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">模型状态监控</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics?.isOnline || false)}`}></div>
          <span className="text-sm font-medium text-gray-600">{getStatusText(metrics?.isOnline || false)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{metrics?.successRate || '0%'}</div>
          <div className="text-xs text-gray-600">成功率</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{metrics?.averageResponseTime || '0ms'}</div>
          <div className="text-xs text-gray-600">平均响应时间</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{metrics?.totalRequests || 0}</div>
          <div className="text-xs text-gray-600">总请求数</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{metrics?.errorCount || 0}</div>
          <div className="text-xs text-gray-600">错误数</div>
        </div>
      </div>

      {(metrics?.cpuUsage !== undefined || metrics?.memoryUsage !== undefined || metrics?.gpuUsage !== undefined) && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">资源使用情况</h4>
          <div className="space-y-3">
            {metrics?.cpuUsage !== undefined && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-16">CPU</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(metrics.cpuUsage, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">{metrics.cpuUsage.toFixed(1)}%</span>
              </div>
            )}
            {metrics?.memoryUsage !== undefined && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-16">内存</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(metrics.memoryUsage, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
            )}
            {metrics?.gpuUsage !== undefined && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-16">GPU</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(metrics.gpuUsage, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">{metrics.gpuUsage.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-3 mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>最后检查: {status?.lastCheckTime ? new Date(status.lastCheckTime).toLocaleString() : '未知'}</span>
          <button
            onClick={fetchStatus}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            刷新
          </button>
        </div>
      </div>
    </div>
  )
}
