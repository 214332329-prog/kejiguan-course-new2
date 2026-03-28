/**
 * 版本管理系统
 * 提供版本检测、切换和管理功能
 */

export interface VersionInfo {
  id: string
  commitHash: string
  name: string
  description: string
  date: string
  features: string[]
  isStable: boolean
}

// 定义可用的历史版本
export const AVAILABLE_VERSIONS: VersionInfo[] = [
  {
    id: 'v1.0.0',
    commitHash: 'a7dbfd7',
    name: '初始版本',
    description: '项目初始版本，包含基础功能',
    date: '2024-01-01',
    features: ['基础课程管理', '简单任务系统', '基础UI布局'],
    isStable: true
  },
  {
    id: 'v1.1.0',
    commitHash: '95f2eef',
    name: 'AI助手优化版',
    description: '优化AI助手界面布局和对齐',
    date: '2024-01-15',
    features: ['AI助手界面优化', '课程区块对齐', '交互体验提升'],
    isStable: true
  },
  {
    id: 'v1.2.0',
    commitHash: 'f0729a5',
    name: '任务管理版',
    description: '添加任务编辑、保存和删除功能',
    date: '2024-02-01',
    features: ['任务编辑功能', '模块管理', '数据持久化'],
    isStable: true
  },
  {
    id: 'v1.3.0',
    commitHash: '503cea9',
    name: '数据库优化版',
    description: '修复数据库字段映射问题',
    date: '2024-02-15',
    features: ['数据库字段映射修复', '保存按钮优化', '数据一致性提升'],
    isStable: true
  },
  {
    id: 'v1.4.0',
    commitHash: '64a6b99',
    name: 'AI助手增强版',
    description: '优化教师端AI助手，修复课程创建功能',
    date: '2024-03-01',
    features: ['AI助手界面增强', '课程创建修复', '富媒体资源优化'],
    isStable: true
  },
  {
    id: 'v1.5.0',
    commitHash: '252af67',
    name: '任务配置优化版',
    description: '优化任务配置模块，支持多种任务类型',
    date: '2024-03-15',
    features: ['多种任务类型支持', '进度跟踪', '任务配置优化'],
    isStable: true
  },
  {
    id: 'v1.6.0',
    commitHash: '2a55993',
    name: '交互体验提升版',
    description: '完成第二阶段和第三阶段工作，提升用户交互体验',
    date: '2024-04-01',
    features: ['用户交互体验提升', '视觉设计优化', '响应式布局改进'],
    isStable: true
  },
  {
    id: 'v1.7.0',
    commitHash: 'a163742',
    name: '下拉菜单版',
    description: '移除上方创建按钮，添加课程管理下拉菜单',
    date: '2024-04-15',
    features: ['课程管理下拉菜单', '界面布局优化', '导航体验提升'],
    isStable: true
  },
  {
    id: 'v1.8.0',
    commitHash: '73e69b2',
    name: '导航修复版',
    description: '修复课程导航下拉菜单问题',
    date: '2024-05-01',
    features: ['下拉菜单修复', '模块数据获取优化', '任务数据同步'],
    isStable: true
  },
  {
    id: 'v2.0.0',
    commitHash: 'eb7ba06',
    name: '最新版本',
    description: '修复课程创建后不显示的问题，优化数据同步',
    date: '2024-05-15',
    features: ['课程创建修复', '本地存储检查', '数据同步优化'],
    isStable: true
  }
]

const STORAGE_KEY = 'app-selected-version'

/**
 * 获取当前选中的版本
 */
export function getCurrentVersion(): VersionInfo {
  if (typeof window === 'undefined') {
    return AVAILABLE_VERSIONS[AVAILABLE_VERSIONS.length - 1]
  }
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const version = AVAILABLE_VERSIONS.find(v => v.id === stored)
    if (version) return version
  }
  
  return AVAILABLE_VERSIONS[AVAILABLE_VERSIONS.length - 1]
}

/**
 * 设置当前版本
 */
export function setCurrentVersion(versionId: string): boolean {
  const version = AVAILABLE_VERSIONS.find(v => v.id === versionId)
  if (!version) return false
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, versionId)
  }
  
  return true
}

/**
 * 获取版本列表
 */
export function getVersionList(): VersionInfo[] {
  return [...AVAILABLE_VERSIONS].reverse()
}

/**
 * 切换到指定版本
 */
export async function switchToVersion(versionId: string): Promise<boolean> {
  const version = AVAILABLE_VERSIONS.find(v => v.id === versionId)
  if (!version) {
    throw new Error(`版本 ${versionId} 不存在`)
  }
  
  // 保存版本选择
  setCurrentVersion(versionId)
  
  // 触发版本切换事件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('version-changed', { 
      detail: { version } 
    }))
  }
  
  return true
}

/**
 * 检查版本是否需要更新
 */
export function checkVersionUpdate(): { hasUpdate: boolean; latestVersion: VersionInfo } {
  const current = getCurrentVersion()
  const latest = AVAILABLE_VERSIONS[AVAILABLE_VERSIONS.length - 1]
  
  return {
    hasUpdate: current.id !== latest.id,
    latestVersion: latest
  }
}

/**
 * 获取版本差异
 */
export function getVersionDiff(fromVersionId: string, toVersionId: string): {
  added: string[]
  removed: string[]
  modified: string[]
} {
  const fromVersion = AVAILABLE_VERSIONS.find(v => v.id === fromVersionId)
  const toVersion = AVAILABLE_VERSIONS.find(v => v.id === toVersionId)
  
  if (!fromVersion || !toVersion) {
    return { added: [], removed: [], modified: [] }
  }
  
  const fromFeatures = new Set(fromVersion.features)
  const toFeatures = new Set(toVersion.features)
  
  const added = toVersion.features.filter(f => !fromFeatures.has(f))
  const removed = fromVersion.features.filter(f => !toFeatures.has(f))
  const modified = toVersion.features.filter(f => fromFeatures.has(f))
  
  return { added, removed, modified }
}

/**
 * 重置到最新版本
 */
export function resetToLatest(): void {
  const latest = AVAILABLE_VERSIONS[AVAILABLE_VERSIONS.length - 1]
  setCurrentVersion(latest.id)
}
