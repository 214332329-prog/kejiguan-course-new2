'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Resource } from '@/types'

export default function Resources() {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 资源类型图标映射
  const resourceIcons = {
    doc: '📄',
    video: '🎥',
    pdf: '📕',
    link: '🔗'
  }

  // 资源类型颜色映射
  const resourceColors = {
    doc: 'bg-blue-100 text-blue-700',
    video: 'bg-purple-100 text-purple-700',
    pdf: 'bg-red-100 text-red-700',
    link: 'bg-green-100 text-green-700'
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = () => {
    setLoading(true)
    try {
      // 从本地存储获取资源
      const storedResources = JSON.parse(localStorage.getItem('resources') || '[]')
      setResources(storedResources)
    } catch (error) {
      console.error('获取资源失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    const newResources: Resource[] = []

    Array.from(files).forEach((file, index) => {
      const resource: Resource = {
        id: `resource-${Date.now()}-${index}`,
        name: file.name,
        type: getResourceType(file.name),
        size: formatFileSize(file.size)
      }
      newResources.push(resource)
    })

    // 模拟上传延迟
    setTimeout(() => {
      const updatedResources = [...resources, ...newResources]
      setResources(updatedResources)
      localStorage.setItem('resources', JSON.stringify(updatedResources))
      setUploading(false)
    }, 1000)
  }

  const getResourceType = (fileName: string): 'doc' | 'video' | 'pdf' | 'link' => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(extension || '')) return 'pdf'
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '')) return 'video'
    if (['doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension || '')) return 'doc'
    return 'doc'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleAddLink = () => {
    const url = prompt('请输入网址:')
    const name = prompt('请输入资源名称:')
    if (url && name) {
      const newResource: Resource = {
        id: `resource-${Date.now()}`,
        name: name,
        type: 'link',
        url: url
      }
      const updatedResources = [...resources, newResource]
      setResources(updatedResources)
      localStorage.setItem('resources', JSON.stringify(updatedResources))
    }
  }

  const handleDeleteResource = (resourceId: string) => {
    if (confirm('确定要删除这个资源吗？')) {
      const updatedResources = resources.filter(r => r.id !== resourceId)
      setResources(updatedResources)
      localStorage.setItem('resources', JSON.stringify(updatedResources))
      if (selectedResource?.id === resourceId) {
        setSelectedResource(null)
      }
    }
  }

  const handlePreviewResource = (resource: Resource) => {
    setSelectedResource(resource)
  }

  const filteredResources = filter === 'all' 
    ? resources 
    : resources.filter(r => r.type === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载资源中...</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
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
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-50 text-blue-700 border-l-4 border-blue-500 transition-all hover:bg-blue-100"
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
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-50 text-blue-700 border-l-4 border-blue-500 transition-all hover:bg-blue-100"
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
            {/* 页面标题和操作 */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">资源管理</h2>
                  <p className="text-gray-600">管理和上传课程资源</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddLink}
                    className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    添加链接
                  </button>
                  <label className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    上传文件
                    <input
                      type="file"
                      multiple
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 资源过滤 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  全部
                </button>
                <button
                  onClick={() => setFilter('doc')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'doc' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  文档
                </button>
                <button
                  onClick={() => setFilter('video')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  视频
                </button>
                <button
                  onClick={() => setFilter('pdf')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  PDF
                </button>
                <button
                  onClick={() => setFilter('link')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'link' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  链接
                </button>
              </div>
            </div>

            {/* 资源列表 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${resourceColors[resource.type]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <span className="text-xl">{resourceIcons[resource.type]}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="删除资源"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{resource.name}</h3>
                      {resource.url && (
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mb-2 block truncate"
                        >
                          {resource.url}
                        </a>
                      )}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">{resource.size || 'N/A'}</span>
                        <button
                          onClick={() => handlePreviewResource(resource)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors"
                        >
                          预览
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无资源</h3>
                  <p className="text-gray-600 mb-6">点击上方按钮上传或添加资源</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 资源预览模态框 */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">资源预览</h3>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className={`w-16 h-16 ${resourceColors[selectedResource.type]} rounded-lg flex items-center justify-center mb-4`}>
                <span className="text-2xl">{resourceIcons[selectedResource.type]}</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">{selectedResource.name}</h4>
              {selectedResource.url && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">网址</label>
                  <a 
                    href={selectedResource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {selectedResource.url}
                  </a>
                </div>
              )}
              {selectedResource.size && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">大小</label>
                  <p className="text-gray-600">{selectedResource.size}</p>
                </div>
              )}
              {selectedResource.content && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedResource.content}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
