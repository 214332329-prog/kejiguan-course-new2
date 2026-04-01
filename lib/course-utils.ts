import { Course, Task, Module } from '@/types'

// 计算已完成任务数
export const getCompletedTasksCount = (course: Course): number => {
  let count = 0
  course.modules.forEach(module => {
    module.tasks?.forEach(task => {
      if (task.status === 'completed') {
        count++
      }
    })
  })
  return count
}

// 计算总任务数
export const getTotalTasksCount = (course: Course): number => {
  let count = 0
  course.modules.forEach(module => {
    count += module.tasks?.length || 0
  })
  return count
}

// 根据ID获取任务
export const getTaskById = (course: Course, taskId: string): Task | null => {
  for (const module of course.modules) {
    const task = module.tasks?.find(t => t.id === taskId)
    if (task) {
      return task
    }
  }
  return null
}

// 根据ID获取模块
export const getModuleById = (course: Course, moduleId: string): Module | null => {
  return course.modules.find(m => m.id === moduleId) || null
}
