/**
 * 课程数据模块
 * 提供课程数据和相关的辅助函数
 */
import { Course, Module, Task } from '@/types'

/**
 * 课程数据
 * 包含课程的基本信息、模块和任务
 */
export const courseData: Course = {
  id: 'course-1',
  title: '科技馆综合实践课程',
  description: '通过实地考察、调研分析、创新设计，培养学生的实践能力和创新思维',
  totalDuration: '12课时',
  totalTasks: 6,
  modules: [
    {
      id: 'module-1',
      title: '模块一：调研方法入门',
      description: '学习科学的调研方法，掌握访谈、观察等基本技能',
      icon: '🔍',
      tasks: [
        {
          id: 'task-1-1',
          title: '课时1：调研方法概述',
          status: 'completed',
          duration: '45分钟',
          content: '本课时将介绍科技馆调研的基本方法和流程。我们将学习如何制定调研计划、设计调研问卷、以及如何进行有效的实地观察。通过理论学习，你将了解调研的科学性和系统性，为后续的实地调研打下坚实基础。',
          videoUrl: 'https://example.com/video1',
          requirements: [
            '了解调研的基本概念和类型',
            '掌握调研计划制定方法',
            '学习观察记录的技巧'
          ],
          resources: [
            { id: 'r1', name: '调研方法指南.pdf', type: 'pdf', size: '2.5MB' },
            { id: 'r2', name: '观察记录模板.docx', type: 'doc', size: '156KB' }
          ]
        },
        {
          id: 'task-1-2',
          title: '课时2：访谈技巧学习',
          status: 'ongoing',
          duration: '45分钟',
          content: '访谈是获取深度信息的重要方法。本课时将教授访谈的技巧，包括如何设计访谈问题、如何与受访者建立良好关系、如何记录和整理访谈内容。通过案例分析和角色扮演，你将掌握专业的访谈技能。',
          videoUrl: 'https://example.com/video2',
          requirements: [
            '学习访谈问题设计原则',
            '掌握访谈沟通技巧',
            '完成一次模拟访谈练习'
          ],
          resources: [
            { id: 'r3', name: '访谈技巧视频.mp4', type: 'video', size: '45MB' },
            { id: 'r4', name: '访谈提纲示例.pdf', type: 'pdf', size: '1.2MB' }
          ]
        }
      ]
    },
    {
      id: 'module-2',
      title: '模块二：实地考察实践',
      description: '深入科技馆进行实地调研，收集第一手资料',
      icon: '🏛️',
      tasks: [
        {
          id: 'task-2-1',
          title: '课时3：科技馆展品观察',
          status: 'pending',
          duration: '90分钟',
          content: '进入科技馆，选择2-3个感兴趣的展品进行深度观察。记录展品的外观设计、交互方式、展示内容、观众反应等。通过系统观察，发现展品的优点和可以改进的地方。',
          videoUrl: 'https://example.com/video3',
          requirements: [
            '选择2-3个展品进行观察',
            '记录展品的基本信息和特点',
            '拍摄展品照片（至少5张）',
            '记录观众互动情况'
          ],
          resources: [
            { id: 'r5', name: '展品观察记录表.docx', type: 'doc', size: '89KB' },
            { id: 'r6', name: '优秀观察案例.pdf', type: 'pdf', size: '3.8MB' }
          ]
        },
        {
          id: 'task-2-2',
          title: '课时4：观众访谈调研',
          status: 'pending',
          duration: '90分钟',
          content: '在科技馆内寻找不同年龄段的观众进行访谈。了解他们对展品的看法、参观体验、以及改进建议。通过访谈收集用户的真实需求和痛点，为后续的创新设计提供依据。',
          videoUrl: 'https://example.com/video4',
          requirements: [
            '访谈至少5位不同年龄段观众',
            '记录访谈内容要点',
            '整理访谈发现的问题',
            '总结用户需求'
          ],
          resources: [
            { id: 'r7', name: '观众访谈指南.pdf', type: 'pdf', size: '1.5MB' },
            { id: 'r8', name: '访谈记录表.docx', type: 'doc', size: '67KB' }
          ]
        }
      ]
    },
    {
      id: 'module-3',
      title: '模块三：创新设计方案',
      description: '基于调研结果，设计创新的科技馆展品或体验方案',
      icon: '💡',
      tasks: [
        {
          id: 'task-3-1',
          title: '课时5：问题分析与创意构思',
          status: 'pending',
          duration: '60分钟',
          content: '基于前期的调研数据，分析发现的问题和用户痛点。运用创新思维方法，进行头脑风暴，提出多个创新解决方案。学习如何评估和筛选创意，确定最终的设计方向。',
          videoUrl: 'https://example.com/video5',
          requirements: [
            '整理调研发现的问题',
            '提出至少3个创新方案',
            '绘制方案草图',
            '撰写方案说明'
          ],
          resources: [
            { id: 'r9', name: '创新思维方法.pdf', type: 'pdf', size: '4.2MB' },
            { id: 'r10', name: '头脑风暴指南.docx', type: 'doc', size: '234KB' }
          ]
        },
        {
          id: 'task-3-2',
          title: '课时6：方案撰写与展示',
          status: 'pending',
          duration: '90分钟',
          content: '将创新方案整理成完整的调研报告。报告应包括问题背景、调研方法、调研发现、创新方案、设计说明等内容。学习如何制作展示PPT，准备最终的成果汇报。',
          videoUrl: 'https://example.com/video6',
          requirements: [
            '撰写完整的调研报告（1500字以上）',
            '制作展示PPT',
            '准备5分钟成果汇报',
            '提交方案设计图'
          ],
          resources: [
            { id: 'r11', name: '调研报告模板.docx', type: 'doc', size: '178KB' },
            { id: 'r12', name: 'PPT制作指南.pdf', type: 'pdf', size: '2.8MB' },
            { id: 'r13', name: '优秀报告案例.pdf', type: 'pdf', size: '5.6MB' }
          ]
        }
      ]
    }
  ]
}

/**
 * 计算已完成任务数
 * @param course 课程数据
 * @returns 已完成任务数量
 */
export const getCompletedTasksCount = (course: Course): number => {
  let count = 0
  course.modules.forEach(module => {
    module.tasks.forEach(task => {
      if (task.status === 'completed') {
        count++
      }
    })
  })
  return count
}

/**
 * 计算总任务数
 * @param course 课程数据
 * @returns 总任务数量
 */
export const getTotalTasksCount = (course: Course): number => {
  let count = 0
  course.modules.forEach(module => {
    count += module.tasks.length
  })
  return count
}

/**
 * 获取当前进行中的任务
 * @param course 课程数据
 * @returns 当前进行中的任务，如果没有则返回null
 */
export const getCurrentTask = (course: Course): Task | null => {
  for (const module of course.modules) {
    for (const task of module.tasks) {
      if (task.status === 'ongoing') {
        return task
      }
    }
  }
  return null
}

/**
 * 根据ID获取任务
 * @param course 课程数据
 * @param taskId 任务ID
 * @returns 任务数据，如果未找到则返回null
 */
export const getTaskById = (course: Course, taskId: string): Task | null => {
  for (const module of course.modules) {
    const task = module.tasks.find(t => t.id === taskId)
    if (task) {
      return task
    }
  }
  return null
}

/**
 * 根据ID获取模块
 * @param course 课程数据
 * @param moduleId 模块ID
 * @returns 模块数据，如果未找到则返回null
 */
export const getModuleById = (course: Course, moduleId: string): Module | null => {
  return course.modules.find(m => m.id === moduleId) || null
}
