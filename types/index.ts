export interface Task {
  id: string
  title: string
  status: 'completed' | 'ongoing' | 'pending'
  duration?: string
  content?: string
  videoUrl?: string
  requirements?: string[]
  resources?: Resource[]
  module_id?: string
  created_at?: string
  updated_at?: string
}

export interface Module {
  id: string
  title: string
  icon?: string
  description?: string
  tasks: Task[]
  course_id?: string
  created_at?: string
  updated_at?: string
}

export interface Resource {
  id: string
  name: string
  type: 'doc' | 'video' | 'pdf' | 'link'
  size?: string
  url?: string
}

export interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: string
}

export interface GroupMember {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline'
}

export interface Submission {
  id: string
  userId: string
  taskId: string
  content: string
  attachments: Attachment[]
  status: 'submitted' | 'graded' | 'returned'
  createdAt: string
  score?: number
  feedback?: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: string
}

export interface Course {
  id: string
  title: string
  description: string
  modules: Module[]
  totalDuration: string
  totalTasks: number
  created_at?: string
  updated_at?: string
}
