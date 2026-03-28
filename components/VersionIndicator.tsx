'use client'

import { useVersion } from './VersionProvider'

export default function VersionIndicator() {
  const { currentVersion } = useVersion()

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-xs font-medium text-gray-700">
          {currentVersion.id}
        </span>
        <span className="text-xs text-gray-400">
          {currentVersion.name}
        </span>
      </div>
    </div>
  )
}
