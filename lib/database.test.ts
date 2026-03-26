import { courseService, moduleService, taskService } from './database';
import { supabase } from './supabase';

// Mock Supabase client
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  },
}));

// Setup mock return values
beforeEach(() => {
  mockSelect.mockReturnValue({
    eq: mockEq,
  });
  mockEq.mockReturnValue({
    single: mockSingle,
  });
  mockInsert.mockReturnValue({
    select: mockSelect,
  });
  mockUpdate.mockReturnValue({
    eq: mockEq,
  });
  mockDelete.mockReturnValue({
    eq: mockEq,
  });
});

// Clear mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Mock cache
jest.mock('./cache', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
  generateCacheKey: jest.fn((prefix, ...args) => `${prefix}:${args.join(':')}`),
}));

describe('Database Services', () => {
  describe('Course Service', () => {
    it('should get all courses', async () => {
      const mockCourses = [
        { id: '1', title: 'Course 1', description: 'Description 1' },
        { id: '2', title: 'Course 2', description: 'Description 2' },
      ];

      // Mock cache.get to return null
      require('./cache').cache.get.mockReturnValue(null);
      
      // Mock supabase response
      mockSelect.mockReturnValue({
        data: mockCourses,
        error: null,
      });

      const courses = await courseService.getCourses();
      expect(courses).toEqual(mockCourses);
    });

    it('should get a single course', async () => {
      const mockCourse = { id: '1', title: 'Course 1', description: 'Description 1' };

      // Mock cache.get to return null
      require('./cache').cache.get.mockReturnValue(null);
      
      // Mock supabase response
      mockSingle.mockReturnValue({
        data: mockCourse,
        error: null,
      });

      const course = await courseService.getCourse('1');
      expect(course).toEqual(mockCourse);
    });

    it('should create a course', async () => {
      const mockCourse = { id: '1', title: 'Course 1', description: 'Description 1' };

      // Mock supabase response
      mockSingle.mockReturnValue({
        data: mockCourse,
        error: null,
      });

      const course = await courseService.createCourse({
        title: 'Course 1',
        description: 'Description 1',
        totalDuration: '1 hour',
        totalTasks: 5,
      });

      expect(course).toEqual(mockCourse);
    });

    it('should update a course', async () => {
      const mockCourse = { id: '1', title: 'Updated Course', description: 'Updated Description' };

      // Mock supabase response
      mockSingle.mockReturnValue({
        data: mockCourse,
        error: null,
      });

      const course = await courseService.updateCourse('1', {
        title: 'Updated Course',
        description: 'Updated Description',
      });

      expect(course).toEqual(mockCourse);
    });

    it('should delete a course', async () => {
      // Mock supabase response
      mockEq.mockReturnValue({
        error: null,
      });

      const result = await courseService.deleteCourse('1');
      expect(result).toBe(true);
    });
  });

  describe('Module Service', () => {
    it('should get modules by course id', async () => {
      const mockModules = [
        { id: '1', title: 'Module 1', course_id: '1' },
        { id: '2', title: 'Module 2', course_id: '1' },
      ];

      // Mock cache.get to return null
      require('./cache').cache.get.mockReturnValue(null);
      
      // Mock supabase response
      mockSelect.mockReturnValue({
        data: mockModules,
        error: null,
      });

      const modules = await moduleService.getModulesByCourseId('1');
      expect(modules).toEqual(mockModules);
    });

    it('should create a module', async () => {
      const mockModule = { id: '1', title: 'Module 1', course_id: '1' };

      // Mock supabase response
      mockSingle.mockReturnValue({
        data: mockModule,
        error: null,
      });

      const module = await moduleService.createModule({
        course_id: '1',
        title: 'Module 1',
        description: 'Description 1',
        icon: 'book',
      });

      expect(module).toEqual(mockModule);
    });
  });

  describe('Task Service', () => {
    it('should get tasks by module id', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', module_id: '1' },
        { id: '2', title: 'Task 2', module_id: '1' },
      ];

      // Mock cache.get to return null
      require('./cache').cache.get.mockReturnValue(null);
      
      // Mock supabase response
      mockSelect.mockReturnValue({
        data: mockTasks,
        error: null,
      });

      const tasks = await taskService.getTasksByModuleId('1');
      expect(tasks).toEqual(mockTasks);
    });

    it('should create a task', async () => {
      const mockTask = { id: '1', title: 'Task 1', module_id: '1', status: 'pending' };

      // Mock supabase response
      mockSingle.mockReturnValue({
        data: mockTask,
        error: null,
      });

      const task = await taskService.createTask({
        module_id: '1',
        title: 'Task 1',
        status: 'pending',
        duration: '30 minutes',
        content: 'Task content',
      });

      expect(task).toEqual(mockTask);
    });
  });
});
