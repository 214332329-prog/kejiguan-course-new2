'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  VersionInfo, 
  getCurrentVersion, 
  setCurrentVersion,
  AVAILABLE_VERSIONS 
} from '@/lib/version-manager'

interface VersionContextType {
  currentVersion: VersionInfo
  setVersion: (versionId: string) => void
  isLoading: boolean
}

const VersionContext = createContext<VersionContextType | undefined>(undefined)

export function VersionProvider({ children }: { children: ReactNode }) {
  const [currentVersion, setCurrentVersionState] = useState<VersionInfo>(AVAILABLE_VERSIONS[AVAILABLE_VERSIONS.length - 1])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 从本地存储或默认获取当前版本
    const version = getCurrentVersion()
    setCurrentVersionState(version)
    setIsLoading(false)

    // 监听版本变化事件
    const handleVersionChange = (e: CustomEvent) => {
      setCurrentVersionState(e.detail.version)
    }

    window.addEventListener('version-changed', handleVersionChange as EventListener)
    return () => {
      window.removeEventListener('version-changed', handleVersionChange as EventListener)
    }
  }, [])

  const setVersion = (versionId: string) => {
    if (setCurrentVersion(versionId)) {
      const version = AVAILABLE_VERSIONS.find(v => v.id === versionId)
      if (version) {
        setCurrentVersionState(version)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <VersionContext.Provider value={{ currentVersion, setVersion, isLoading }}>
      {children}
    </VersionContext.Provider>
  )
}

export function useVersion() {
  const context = useContext(VersionContext)
  if (context === undefined) {
    throw new Error('useVersion must be used within a VersionProvider')
  }
  return context
}
