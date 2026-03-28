'use client'

import { useState, useEffect } from 'react'
import { 
  getVersionList, 
  getCurrentVersion, 
  switchToVersion, 
  VersionInfo,
  getVersionDiff 
} from '@/lib/version-manager'

export default function VersionSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(null)
  const [versions, setVersions] = useState<VersionInfo[]>([])
  const [isSwitching, setIsSwitching] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<VersionInfo | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  useEffect(() => {
    // 初始化版本信息
    setCurrentVersion(getCurrentVersion())
    setVersions(getVersionList())

    // 监听版本变化事件
    const handleVersionChange = (e: CustomEvent) => {
      setCurrentVersion(e.detail.version)
    }

    window.addEventListener('version-changed', handleVersionChange as EventListener)
    return () => {
      window.removeEventListener('version-changed', handleVersionChange as EventListener)
    }
  }, [])

  const handleVersionSelect = (version: VersionInfo) => {
    setSelectedVersion(version)
    if (currentVersion && version.id !== currentVersion.id) {
      setShowDiff(true)
    }
  }

  const handleSwitchVersion = async () => {
    if (!selectedVersion || selectedVersion.id === currentVersion?.id) return

    setIsSwitching(true)
    try {
      await switchToVersion(selectedVersion.id)
      setCurrentVersion(selectedVersion)
      setShowDiff(false)
      setIsOpen(false)
      
      // 刷新页面以应用新版本
      window.location.reload()
    } catch (error) {
      console.error('切换版本失败:', error)
      alert('切换版本失败，请重试')
    } finally {
      setIsSwitching(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedVersion(null)
    setShowDiff(false)
  }

  if (!currentVersion) return null

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex flex-col items-start">
          <span className="text-xs opacity-80">当前版本</span>
          <span className="text-sm font-semibold">{currentVersion.name}</span>
        </div>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 版本选择弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4">
            {/* 头部 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">版本管理</h2>
                <p className="text-blue-100 text-sm mt-1">选择您想要使用的历史版本</p>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              {/* 版本列表 */}
              <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    可用版本 ({versions.length})
                  </h3>
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <div
                        key={version.id}
                        onClick={() => handleVersionSelect(version)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          selectedVersion?.id === version.id
                            ? 'border-blue-500 bg-blue-50'
                            : currentVersion?.id === version.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-800">{version.id}</span>
                            {currentVersion?.id === version.id && (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">
                                当前
                              </span>
                            )}
                            {version.isStable && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                                稳定
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{version.date}</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">{version.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {version.features.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {version.features.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                              +{version.features.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 版本详情和差异对比 */}
              <div className="w-1/2 overflow-y-auto">
                {selectedVersion ? (
                  <div className="p-6">
                    {/* 版本详情 */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">版本详情</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">版本号</span>
                          <span className="font-medium">{selectedVersion.id}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">版本名称</span>
                          <span className="font-medium">{selectedVersion.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">发布日期</span>
                          <span className="font-medium">{selectedVersion.date}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">Git提交</span>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">
                            {selectedVersion.commitHash.substring(0, 7)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">稳定性</span>
                          <span className={`font-medium ${selectedVersion.isStable ? 'text-green-600' : 'text-yellow-600'}`}>
                            {selectedVersion.isStable ? '稳定版本' : '测试版本'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 功能特性 */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">功能特性</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedVersion.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 版本差异 */}
                    {showDiff && currentVersion && selectedVersion.id !== currentVersion.id && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">
                          与当前版本差异
                        </h3>
                        {(() => {
                          const diff = getVersionDiff(currentVersion.id, selectedVersion.id)
                          return (
                            <div className="space-y-3">
                              {diff.added.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-green-600 mb-2">新增功能</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {diff.added.map((feature, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                                        + {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {diff.removed.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-red-600 mb-2">移除功能</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {diff.removed.map((feature, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                                        - {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {diff.added.length === 0 && diff.removed.length === 0 && (
                                <p className="text-gray-500 text-sm">两个版本功能特性相同</p>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                      {selectedVersion.id !== currentVersion?.id ? (
                        <>
                          <button
                            onClick={handleSwitchVersion}
                            disabled={isSwitching}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isSwitching ? (
                              <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                切换中...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                切换到该版本
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedVersion(null)}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <div className="w-full px-6 py-3 bg-green-100 text-green-800 rounded-xl font-semibold text-center border-2 border-green-300">
                          <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          当前正在使用此版本
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>点击左侧版本查看详情</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
