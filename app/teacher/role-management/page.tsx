'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Role = {
  id: string
  name: string
  description: string
  permissions: string[]
}

type User = {
  id: string
  email: string
  name: string
  role: string | null
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: '管理员',
      description: '拥有所有权限',
      permissions: ['manage_courses', 'manage_users', 'manage_roles', 'view_analytics']
    },
    {
      id: '2',
      name: '教师',
      description: '可以管理课程和查看分析',
      permissions: ['manage_courses', 'view_analytics']
    },
    {
      id: '3',
      name: '学生',
      description: '只能查看课程内容',
      permissions: []
    }
  ])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })
  const [selectedPermission, setSelectedPermission] = useState('')
  const [assignedRole, setAssignedRole] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchUsers()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('检查用户失败:', error)
      router.push('/auth/login')
    }
  }

  const fetchUsers = async () => {
    try {
      // 这里应该从Supabase获取用户列表
      // 暂时使用模拟数据
      setUsers([
        {
          id: '1',
          email: 'teacher@example.com',
          name: '张老师',
          role: '教师'
        },
        {
          id: '2',
          email: 'student@example.com',
          name: '李学生',
          role: '学生'
        },
        {
          id: '3',
          email: 'admin@example.com',
          name: '管理员',
          role: '管理员'
        }
      ])
    } catch (error) {
      console.error('获取用户失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = () => {
    if (!newRole.name) return
    
    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions
    }
    
    setRoles([...roles, role])
    setShowCreateRoleModal(false)
    setNewRole({ name: '', description: '', permissions: [] })
  }

  const handleEditRole = () => {
    if (!currentRole) return
    
    setRoles(roles.map(role => 
      role.id === currentRole.id ? currentRole : role
    ))
    setShowEditRoleModal(false)
    setCurrentRole(null)
  }

  const handleAssignRole = () => {
    if (!currentUser || !assignedRole) return
    
    setUsers(users.map(user => 
      user.id === currentUser.id ? { ...user, role: assignedRole } : user
    ))
    setShowAssignRoleModal(false)
    setCurrentUser(null)
    setAssignedRole('')
  }

  const handleDeleteRole = (roleId: string) => {
    if (confirm('确定要删除这个角色吗？')) {
      setRoles(roles.filter(role => role.id !== roleId))
    }
  }

  const permissions = [
    { value: 'manage_courses', label: '管理课程' },
    { value: 'manage_users', label: '管理用户' },
    { value: 'manage_roles', label: '管理角色' },
    { value: 'view_analytics', label: '查看分析' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-800">角色管理</h1>
            </div>
            <div className="flex items-center space-x-4">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
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
            <a
              href="/teacher/role-management"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-50 text-blue-700 border-l-4 border-blue-500 transition-all hover:bg-blue-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              角色管理
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
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">角色管理</h2>
                  <p className="text-gray-600">管理系统角色和权限</p>
                </div>
                <button
                  onClick={() => setShowCreateRoleModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  创建角色
                </button>
              </div>
            </div>

            {/* 角色列表 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">角色列表</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        角色名称
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        描述
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        权限
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((role) => (
                      <tr key={role.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {role.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {role.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.map((permission) => {
                              const perm = permissions.find(p => p.value === permission)
                              return (
                                <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {perm?.label || permission}
                                </span>
                              )
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setCurrentRole(role)
                                setShowEditRoleModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 用户列表 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">用户角色分配</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        用户名
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        邮箱
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        当前角色
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            {user.role || '未分配'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setCurrentUser(user)
                              setAssignedRole(user.role || '')
                              setShowAssignRoleModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            分配角色
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 创建角色模态框 */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateRoleModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative z-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4">创建新角色</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色名称
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  权限
                </label>
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <div key={permission.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(permission.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRole({ ...newRole, permissions: [...newRole.permissions, permission.value] })
                          } else {
                            setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== permission.value) })
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateRoleModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleCreateRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑角色模态框 */}
      {showEditRoleModal && currentRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEditRoleModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative z-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4">编辑角色</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色名称
                </label>
                <input
                  type="text"
                  value={currentRole.name}
                  onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={currentRole.description}
                  onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  权限
                </label>
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <div key={permission.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentRole.permissions.includes(permission.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentRole({
                              ...currentRole,
                              permissions: [...currentRole.permissions, permission.value]
                            })
                          } else {
                            setCurrentRole({
                              ...currentRole,
                              permissions: currentRole.permissions.filter(p => p !== permission.value)
                            })
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditRoleModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleEditRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分配角色模态框 */}
      {showAssignRoleModal && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAssignRoleModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative z-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4">分配角色</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  value={currentUser.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色
                </label>
                <select
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择角色</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignRoleModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleAssignRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
