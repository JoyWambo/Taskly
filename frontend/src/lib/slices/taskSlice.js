import { createSlice } from '@reduxjs/toolkit';
import { TASKS_URL } from '../constants';
import { apiSlice } from './apiSlice';

// Task API Slice
export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get tasks with filtering and pagination
    getTasks: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 10,
        keyword = '',
        status = '',
        priority = '',
        category = '',
        dueBefore = '',
        dueAfter = '',
        includeArchived = false,
      } = {}) => ({
        url: TASKS_URL,
        params: {
          pageNumber,
          pageSize,
          keyword,
          status,
          priority,
          category,
          dueBefore,
          dueAfter,
          includeArchived,
        },
      }),
      providesTags: ['Tasks'],
      keepUnusedDataFor: 5,
    }),

    // Get single task by ID
    getTaskById: builder.query({
      query: (taskId) => ({
        url: `${TASKS_URL}/${taskId}`,
      }),
      providesTags: (_result, _error, taskId) => [
        { type: 'Tasks', id: taskId },
      ],
      keepUnusedDataFor: 5,
    }),

    // Create new task
    createTask: builder.mutation({
      query: (taskData) => ({
        url: TASKS_URL,
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Tasks', 'Categories'],
    }),

    // Update existing task
    updateTask: builder.mutation({
      query: ({ taskId, ...taskData }) => ({
        url: `${TASKS_URL}/${taskId}`,
        method: 'PUT',
        body: taskData,
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Tasks', id: taskId },
        'Tasks',
        'Categories',
      ],
    }),

    // Delete task
    deleteTask: builder.mutation({
      query: (taskId) => ({
        url: `${TASKS_URL}/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks', 'Categories'],
    }),

    // Add comment to task
    addTaskComment: builder.mutation({
      query: ({ taskId, text }) => ({
        url: `${TASKS_URL}/${taskId}/comments`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Tasks', id: taskId },
      ],
    }),

    // Get overdue tasks
    getOverdueTasks: builder.query({
      query: () => ({
        url: `${TASKS_URL}/overdue`,
      }),
      providesTags: ['Tasks'],
      keepUnusedDataFor: 30, // Cache for 30 seconds
    }),

    // Toggle task archive status
    toggleTaskArchive: builder.mutation({
      query: (taskId) => ({
        url: `${TASKS_URL}/${taskId}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, taskId) => [
        { type: 'Tasks', id: taskId },
        'Tasks',
      ],
    }),

    // Get task statistics
    getTaskStats: builder.query({
      query: () => ({
        url: `${TASKS_URL}/stats`,
      }),
      providesTags: ['Tasks'],
      keepUnusedDataFor: 60, // Cache for 1 minute
    }),
  }),
});

// Task Management Slice for local state
const initialState = {
  // Current filter settings
  filters: {
    keyword: '',
    status: '',
    priority: '',
    category: '',
    dueBefore: '',
    dueAfter: '',
    includeArchived: false,
  },
  // View settings
  viewSettings: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
    viewType: 'list', // 'list', 'board', 'calendar'
    pageSize: 10,
  },
  // Selected tasks for bulk operations
  selectedTasks: [],
  // Task form state
  taskForm: {
    isOpen: false,
    mode: 'create', // 'create', 'edit'
    taskId: null,
    initialData: null,
  },
  // UI state
  ui: {
    sidebarOpen: false,
    taskDetailOpen: false,
    selectedTaskId: null,
  },
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Filter actions
    setTaskFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTaskFilters: (state) => {
      state.filters = initialState.filters;
    },

    // View settings actions
    setViewSettings: (state, action) => {
      state.viewSettings = { ...state.viewSettings, ...action.payload };
    },

    // Selection actions
    selectTask: (state, action) => {
      const taskId = action.payload;
      if (!state.selectedTasks.includes(taskId)) {
        state.selectedTasks.push(taskId);
      }
    },
    deselectTask: (state, action) => {
      const taskId = action.payload;
      state.selectedTasks = state.selectedTasks.filter((id) => id !== taskId);
    },
    selectAllTasks: (state, action) => {
      state.selectedTasks = action.payload; // Array of task IDs
    },
    clearSelectedTasks: (state) => {
      state.selectedTasks = [];
    },

    // Task form actions
    openTaskForm: (state, action) => {
      const {
        mode = 'create',
        taskId = null,
        initialData = null,
      } = action.payload || {};
      state.taskForm = {
        isOpen: true,
        mode,
        taskId,
        initialData,
      };
    },
    closeTaskForm: (state) => {
      state.taskForm = initialState.taskForm;
    },

    // UI actions
    toggleSidebar: (state) => {
      state.ui.sidebarOpen = !state.ui.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.ui.sidebarOpen = action.payload;
    },
    openTaskDetail: (state, action) => {
      state.ui.taskDetailOpen = true;
      state.ui.selectedTaskId = action.payload;
    },
    closeTaskDetail: (state) => {
      state.ui.taskDetailOpen = false;
      state.ui.selectedTaskId = null;
    },

    // Reset task state on logout
    resetTaskState: () => initialState,
  },
});

// Export hooks
export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddTaskCommentMutation,
  useGetOverdueTasksQuery,
  useToggleTaskArchiveMutation,
  useGetTaskStatsQuery,
} = taskApiSlice;

// Export actions
export const {
  setTaskFilters,
  clearTaskFilters,
  setViewSettings,
  selectTask,
  deselectTask,
  selectAllTasks,
  clearSelectedTasks,
  openTaskForm,
  closeTaskForm,
  toggleSidebar,
  setSidebarOpen,
  openTaskDetail,
  closeTaskDetail,
  resetTaskState,
} = taskSlice.actions;

// Export reducer
export default taskSlice.reducer;
