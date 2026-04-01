/**
 * 数据库服务模块
 * 提供课程、模块、任务、提交等数据的CRUD操作
 * 集成了缓存机制，提高性能
 */
import { supabase } from './supabase';
import { Course, Module, Task, Submission, Attachment } from '@/types';
import { cache, generateCacheKey } from './cache';

// 模拟数据，当Supabase不可用时使用
const mockCourses: Course[] = [
  {
    id: 'default-course',
    title: '默认课程',
    description: '这是一个默认课程',
    modules: [
      {
        id: 'default-module',
        title: '新模块 1',
        tasks: [
          {
            id: 'default-task',
            title: '默认任务',
            taskType: 'theory',
            content: '这是一个默认任务，请开始学习',
            status: 'pending',
            duration: '45分钟',
            requirements: ['完成任务', '提交作业'],
            resources: []
          }
        ]
      }
    ],
    totalDuration: '45分钟',
    totalTasks: 1
  }
];

// 课程相关操作
export const courseService = {
  // 获取所有课程
  async getCourses(): Promise<Course[]> {
    const cacheKey = generateCacheKey('courses');
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // 检查Supabase是否可用
      if (!supabase || !supabase.from) {
        console.warn('Supabase not available, using mock data');
        cache.set(cacheKey, mockCourses);
        return mockCourses;
      }
      
      // 获取所有课程
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');
      
      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        cache.set(cacheKey, mockCourses);
        return mockCourses;
      }
      
      // 为每个课程获取模块数据
      const coursesWithModules = await Promise.all(
        coursesData.map(async (course) => {
          const { data: modulesData, error: modulesError } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', course.id);
          
          if (modulesError) {
            console.error(`Error fetching modules for course ${course.id}:`, modulesError);
            return {
              id: course.id,
              title: course.title,
              description: course.description,
              modules: [],
              totalDuration: course.total_duration || '0分钟',
              totalTasks: course.total_tasks || 0,
              created_at: course.created_at,
              updated_at: course.updated_at
            };
          }
          
          // 为每个模块获取任务数据
          const modulesWithTasks = await Promise.all(
            modulesData.map(async (module) => {
              const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('module_id', module.id);
              
              if (tasksError) {
                console.error(`Error fetching tasks for module ${module.id}:`, tasksError);
                return {
                  id: module.id,
                  title: module.title,
                  icon: module.icon,
                  description: module.description,
                  tasks: [],
                  course_id: module.course_id,
                  created_at: module.created_at,
                  updated_at: module.updated_at
                };
              }
              
              // 映射任务字段
              const mappedTasks = tasksData.map(task => ({
                id: task.id,
                title: task.title,
                taskType: task.task_type,
                status: task.status,
                duration: task.duration,
                content: task.content,
                videoUrl: task.video_url,
                requirements: task.requirements,
                resources: task.resources,
                module_id: task.module_id,
                created_at: task.created_at,
                updated_at: task.updated_at,
                quizQuestions: task.quiz_questions,
                discussionTopic: task.discussion_topic
              }));
              
              return {
                id: module.id,
                title: module.title,
                icon: module.icon,
                description: module.description,
                tasks: mappedTasks,
                course_id: module.course_id,
                created_at: module.created_at,
                updated_at: module.updated_at
              };
            })
          );
          
          return {
            id: course.id,
            title: course.title,
            description: course.description,
            modules: modulesWithTasks,
            totalDuration: course.total_duration || '0分钟',
            totalTasks: course.total_tasks || 0,
            created_at: course.created_at,
            updated_at: course.updated_at
          };
        })
      );
      
      cache.set(cacheKey, coursesWithModules);
      return coursesWithModules;
    } catch (error) {
      console.error('Error in getCourses:', error);
      cache.set(cacheKey, mockCourses);
      return mockCourses;
    }
  },

  // 获取单个课程
  async getCourse(id: string): Promise<Course | null> {
    const cacheKey = generateCacheKey('course', id);
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // 检查Supabase是否可用
      if (!supabase || !supabase.from) {
        console.warn('Supabase not available, using mock data');
        const mockCourse = mockCourses.find(course => course.id === id) || mockCourses[0];
        cache.set(cacheKey, mockCourse);
        return mockCourse;
      }
      
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (courseError) {
        console.error('Error fetching course:', courseError);
        const mockCourse = mockCourses.find(course => course.id === id) || mockCourses[0];
        cache.set(cacheKey, mockCourse);
        return mockCourse;
      }
      
      // 获取课程的模块数据
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id);
      
      if (modulesError) {
        console.error(`Error fetching modules for course ${id}:`, modulesError);
        const course: Course = {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          modules: [],
          totalDuration: courseData.total_duration || '0分钟',
          totalTasks: courseData.total_tasks || 0,
          created_at: courseData.created_at,
          updated_at: courseData.updated_at
        };
        
        cache.set(cacheKey, course);
        return course;
      }
      
      // 为每个模块获取任务数据
      const modulesWithTasks = await Promise.all(
        modulesData.map(async (module) => {
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('module_id', module.id);
          
          if (tasksError) {
            console.error(`Error fetching tasks for module ${module.id}:`, tasksError);
            return {
              id: module.id,
              title: module.title,
              icon: module.icon,
              description: module.description,
              tasks: [],
              course_id: module.course_id,
              created_at: module.created_at,
              updated_at: module.updated_at
            };
          }
          
          // 映射任务字段
          const mappedTasks = tasksData.map(task => ({
            id: task.id,
            title: task.title,
            taskType: task.task_type,
            status: task.status,
            duration: task.duration,
            content: task.content,
            videoUrl: task.video_url,
            requirements: task.requirements,
            resources: task.resources,
            module_id: task.module_id,
            created_at: task.created_at,
            updated_at: task.updated_at,
            quizQuestions: task.quiz_questions,
            discussionTopic: task.discussion_topic
          }));
          
          return {
            id: module.id,
            title: module.title,
            icon: module.icon,
            description: module.description,
            tasks: mappedTasks,
            course_id: module.course_id,
            created_at: module.created_at,
            updated_at: module.updated_at
          };
        })
      );
      
      const course: Course = {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        modules: modulesWithTasks,
        totalDuration: courseData.total_duration || '0分钟',
        totalTasks: courseData.total_tasks || 0,
        created_at: courseData.created_at,
        updated_at: courseData.updated_at
      };
      
      cache.set(cacheKey, course);
      return course;
    } catch (error) {
      console.error('Error in getCourse:', error);
      const mockCourse = mockCourses.find(course => course.id === id) || mockCourses[0];
      cache.set(cacheKey, mockCourse);
      return mockCourse;
    }
  },

  // 创建课程
  async createCourse(course: {
    title: string;
    description: string;
    totalDuration: string;
    totalTasks: number;
  }): Promise<Course | null> {
    const id = `course-${Date.now()}`;
    const { data, error } = await supabase
      .from('courses')
      .insert({
        id,
        title: course.title,
        description: course.description,
        total_duration: course.totalDuration,
        total_tasks: course.totalTasks,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating course:', error);
      return null;
    }
    
    // 清除课程列表缓存
    cache.delete(generateCacheKey('courses'));
    return data;
  },

  // 更新课程
  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.totalDuration !== undefined) updateData.total_duration = updates.totalDuration;
    if (updates.totalTasks !== undefined) updateData.total_tasks = updates.totalTasks;
    
    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating course:', error);
      return null;
    }
    
    // 清除相关缓存
    cache.delete(generateCacheKey('courses'));
    cache.delete(generateCacheKey('course', id));
    return data;
  },

  // 删除课程
  async deleteCourse(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting course:', error);
      return false;
    }
    
    // 清除相关缓存
    cache.delete(generateCacheKey('courses'));
    cache.delete(generateCacheKey('course', id));
    return true;
  }
};

// 模块相关操作
export const moduleService = {
  // 获取课程的所有模块
  async getModulesByCourseId(courseId: string): Promise<Module[]> {
    const cacheKey = generateCacheKey('modules', courseId);
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // 检查Supabase是否可用
      if (!supabase || !supabase.from) {
        console.warn('Supabase not available, using mock data');
        const mockCourse = mockCourses.find(course => course.id === courseId) || mockCourses[0];
        cache.set(cacheKey, mockCourse.modules);
        return mockCourse.modules;
      }
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId);
      
      if (error) {
        console.error('Error fetching modules:', error);
        const mockCourse = mockCourses.find(course => course.id === courseId) || mockCourses[0];
        cache.set(cacheKey, mockCourse.modules);
        return mockCourse.modules;
      }
      
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error in getModulesByCourseId:', error);
      const mockCourse = mockCourses.find(course => course.id === courseId) || mockCourses[0];
      cache.set(cacheKey, mockCourse.modules);
      return mockCourse.modules;
    }
  },

  // 创建模块
  async createModule(module: {
    course_id: string;
    title: string;
    description?: string;
    icon?: string;
  }): Promise<Module | null> {
    const id = `module-${Date.now()}`;
    const { data, error } = await supabase
      .from('modules')
      .insert({
        id,
        course_id: module.course_id,
        title: module.title,
        description: module.description,
        icon: module.icon,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating module:', error);
      return null;
    }
    
    // 清除相关缓存
    cache.delete(generateCacheKey('modules', module.course_id));
    cache.delete(generateCacheKey('courses'));
    return data;
  },

  // 更新模块
  async updateModule(id: string, updates: Partial<Module>): Promise<Module | null> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    
    const { data, error } = await supabase
      .from('modules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating module:', error);
      return null;
    }
    
    // 清除相关缓存
    if (data.course_id) {
      cache.delete(generateCacheKey('modules', data.course_id));
      cache.delete(generateCacheKey('courses'));
    }
    return data;
  },

  // 删除模块
  async deleteModule(id: string): Promise<boolean> {
    // 先获取模块信息，以清除相关缓存
    const { data: moduleData } = await supabase
      .from('modules')
      .select('course_id')
      .eq('id', id)
      .single();
    
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting module:', error);
      return false;
    }
    
    // 清除相关缓存
    if (moduleData && moduleData.course_id) {
      cache.delete(generateCacheKey('modules', moduleData.course_id));
      cache.delete(generateCacheKey('courses'));
    }
    return true;
  }
};

// 任务相关操作
export const taskService = {
  // 获取模块的所有任务
  async getTasksByModuleId(moduleId: string): Promise<Task[]> {
    const cacheKey = generateCacheKey('tasks', moduleId);
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // 检查Supabase是否可用
      if (!supabase || !supabase.from) {
        console.warn('Supabase not available, using mock data');
        let mockTasks: Task[] = [];
        for (const course of mockCourses) {
          for (const module of course.modules) {
            if (module.id === moduleId) {
              mockTasks = module.tasks;
              break;
            }
          }
        }
        cache.set(cacheKey, mockTasks);
        return mockTasks;
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('module_id', moduleId);
      
      if (error) {
        console.error('Error fetching tasks:', error);
        let mockTasks: Task[] = [];
        for (const course of mockCourses) {
          for (const module of course.modules) {
            if (module.id === moduleId) {
              mockTasks = module.tasks;
              break;
            }
          }
        }
        cache.set(cacheKey, mockTasks);
        return mockTasks;
      }
      
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error in getTasksByModuleId:', error);
      let mockTasks: Task[] = [];
      for (const course of mockCourses) {
        for (const module of course.modules) {
          if (module.id === moduleId) {
            mockTasks = module.tasks;
            break;
          }
        }
      }
      cache.set(cacheKey, mockTasks);
      return mockTasks;
    }
  },

  // 创建任务
  async createTask(task: {
    module_id: string;
    title: string;
    task_type: 'theory' | 'practice' | 'quiz' | 'discussion';
    status: 'completed' | 'ongoing' | 'pending';
    duration?: string;
    content?: string;
    quiz_questions?: any;
    discussion_topic?: string;
  }): Promise<Task | null> {
    const id = `task-${Date.now()}`;
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        id,
        module_id: task.module_id,
        title: task.title,
        task_type: task.task_type,
        content: task.content,
        status: task.status,
        duration: task.duration,
        quiz_questions: task.quiz_questions,
        discussion_topic: task.discussion_topic,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return null;
    }
    
    // 清除相关缓存
    cache.delete(generateCacheKey('tasks', task.module_id));
    cache.delete(generateCacheKey('courses'));
    return data;
  },

  // 更新任务
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    // 先获取任务信息，以清除相关缓存
    const { data: taskData } = await supabase
      .from('tasks')
      .select('module_id')
      .eq('id', id)
      .single();
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.taskType !== undefined) updateData.task_type = updates.taskType;
    if (updates.quizQuestions !== undefined) updateData.quiz_questions = updates.quizQuestions;
    if (updates.discussionTopic !== undefined) updateData.discussion_topic = updates.discussionTopic;
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      return null;
    }
    
    // 清除相关缓存
    if (taskData && taskData.module_id) {
      cache.delete(generateCacheKey('tasks', taskData.module_id));
      cache.delete(generateCacheKey('courses'));
    }
    return data;
  },

  // 删除任务
  async deleteTask(id: string): Promise<boolean> {
    // 先获取任务信息，以清除相关缓存
    const { data: taskData } = await supabase
      .from('tasks')
      .select('module_id')
      .eq('id', id)
      .single();
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }
    
    // 清除相关缓存
    if (taskData && taskData.module_id) {
      cache.delete(generateCacheKey('tasks', taskData.module_id));
      cache.delete(generateCacheKey('courses'));
    }
    return true;
  }
};

// 提交相关操作
export const submissionService = {
  // 获取用户的任务提交
  async getSubmissionByTaskAndUser(taskId: string, userId: string): Promise<Submission | null> {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching submission:', error);
      return null;
    }
    
    return data;
  },

  // 创建提交
  async createSubmission(submission: Omit<Submission, 'id' | 'created_at' | 'updated_at'>): Promise<Submission | null> {
    const id = `submission-${Date.now()}`;
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        id,
        ...submission,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating submission:', error);
      return null;
    }
    
    return data;
  },

  // 更新提交
  async updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | null> {
    const { data, error } = await supabase
      .from('submissions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating submission:', error);
      return null;
    }
    
    return data;
  }
};

// 附件相关操作
export const attachmentService = {
  // 获取提交的所有附件
  async getAttachmentsBySubmissionId(submissionId: string): Promise<Attachment[]> {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('submission_id', submissionId);
    
    if (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
    
    return data;
  },

  // 创建附件
  async createAttachment(attachment: Omit<Attachment, 'id' | 'created_at'>): Promise<Attachment | null> {
    const id = `attachment-${Date.now()}`;
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        id,
        ...attachment,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating attachment:', error);
      return null;
    }
    
    return data;
  }
};
