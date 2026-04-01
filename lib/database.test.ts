import { courseService, moduleService, taskService } from './database';

// Mock Supabase client
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

// Mock supabase module
jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Setup mock return values
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Mock select chain
  mockSelect.mockImplementation(() => ({
    eq: mockEq,
    single: mockSingle,
  }));
  
  // Mock eq chain
  mockEq.mockImplementation(() => ({
    single: mockSingle,
  }));
  
  // Mock single to return a default response
  mockSingle.mockReturnValue({
    data: null,
    error: null,
  });
  
  // Mock insert chain
  mockInsert.mockImplementation(() => ({
    select: mockSelect,
  }));
  
  // Mock update chain
  mockUpdate.mockImplementation(() => ({
    eq: mockEq,
  }));
  
  // Mock delete chain
  mockDelete.mockImplementation(() => ({
    eq: mockEq,
  }));
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
        { id: '1', title: 'Course 1', description: 'Description 1', total_duration: '1 hour', total_tasks: 5 },
        { id: '2', title: 'Course 2', description: 'Description 2', total_duration: '2 hours', total_tasks: 10 },
      ];

      const mockModules = [
        { id: '1', title: 'Module 1', course_id: '1' },
        { id: '2', title: 'Module 2', course_id: '1' },
      ];

      const mockTasks = [
        { id: '1', title: 'Task 1', module_id: '1', status: 'pending', duration: '30 minutes', content: 'Task content' },
        { id: '2', title: 'Task 2', module_id: '1', status: 'completed', duration: '45 minutes', content: 'Task content' },
      ];

      // Mock cache.get to return null
      require('./cache').cache.get.mockReturnValue(null);
      
      // Mock supabase responses
      mockSelect.mockImplementation((query) => {
        if (query === '*') {
          // First call for courses
          if (mockSelect.mock.calls.length === 1) {
            return {
              data: mockCourses,
              error: null,
            };
          }
          // Second call for modules
          else if (mockSelect.mock.calls.length === 2) {
            return {
              data: mockModules,
              error: null,
            };
          }
          // Third call for tasks
          else {
            return {
              data: mockTasks,
              error: null,
            };
          }
        }
        return {
          eq: mockEq,
        };
      });

      const courses = await courseService.getCourses();
      expect(courses).toBeDefined();
      expect(courses.length).toBeGreaterThan(0);
    });

    it('should return mock courses when Supabase is not available', async () => {
      // Mock cache.get to return null
      require('./cache').cache.get.mockReturnValue(null);
      
      // Mock supabase.from to be undefined
      const supabaseModule = require('./supabase');
      supabaseModule.supabase.from = undefined;

      const courses = await courseService.getCourses();
      expect(courses).toBeDefined();
      expect(courses.length).toBeGreaterThan(0);
    });

    it('should return mock courses when Supabase returns an error', async () => {
      // Mock cache.get to return null
      require('./cache').cache.get.mockReturnValue(null);
      
      // Mock supabase response with error
      mockSelect.mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });

      const courses = await courseService.getCourses();
      expect(courses).toBeDefined();
      expect(courses.length).toBeGreaterThan(0);
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
