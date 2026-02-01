import { createSlice } from '@reduxjs/toolkit';
import { CATEGORY_URL } from '../constants';
import { apiSlice } from './apiSlice';

// Category API Slice
export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories for user
    getCategories: builder.query({
      query: ({
        keyword = '',
        isActive = undefined,
        isDefault = undefined,
      } = {}) => ({
        url: CATEGORY_URL,
        params: {
          keyword,
          isActive,
          isDefault,
        },
      }),
      providesTags: ['Categories'],
      keepUnusedDataFor: 30, // Cache categories for 30 seconds
    }),

    // Get single category by ID
    getCategoryById: builder.query({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
      }),
      providesTags: (_result, _error, categoryId) => [
        { type: 'Categories', id: categoryId },
      ],
      keepUnusedDataFor: 5,
    }),

    // Create new category
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: CATEGORY_URL,
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Categories'],
    }),

    // Update existing category
    updateCategory: builder.mutation({
      query: ({ categoryId, ...categoryData }) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: (_result, _error, { categoryId }) => [
        { type: 'Categories', id: categoryId },
        'Categories',
        'Tasks', // Tasks may need to be refetched if category changed
      ],
    }),

    // Delete category
    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories', 'Tasks'],
    }),

    // Get category statistics
    getCategoryStats: builder.query({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}/stats`,
      }),
      providesTags: (_result, _error, categoryId) => [
        { type: 'Categories', id: categoryId },
      ],
      keepUnusedDataFor: 60, // Cache stats for 1 minute
    }),

    // Get tasks by category
    getCategoryTasks: builder.query({
      query: ({
        categoryId,
        pageNumber = 1,
        pageSize = 10,
        status = '',
        priority = '',
        includeArchived = false,
      }) => ({
        url: `${CATEGORY_URL}/${categoryId}/tasks`,
        params: {
          pageNumber,
          pageSize,
          status,
          priority,
          includeArchived,
        },
      }),
      providesTags: (_result, _error, { categoryId }) => [
        { type: 'Categories', id: categoryId },
        'Tasks',
      ],
      keepUnusedDataFor: 5,
    }),

    // Update category task count
    updateCategoryTaskCount: builder.mutation({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}/update-count`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, categoryId) => [
        { type: 'Categories', id: categoryId },
        'Categories',
      ],
    }),

    // Toggle category active status
    toggleCategoryActive: builder.mutation({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}/toggle-active`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, categoryId) => [
        { type: 'Categories', id: categoryId },
        'Categories',
      ],
    }),

    // Create default categories
    createDefaultCategories: builder.mutation({
      query: () => ({
        url: `${CATEGORY_URL}/create-defaults`,
        method: 'POST',
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

// Category Management Slice for local state
const initialState = {
  // Current filter settings
  filters: {
    keyword: '',
    isActive: undefined,
    isDefault: undefined,
  },
  // Selected categories for bulk operations
  selectedCategories: [],
  // Category form state
  categoryForm: {
    isOpen: false,
    mode: 'create', // 'create', 'edit'
    categoryId: null,
    initialData: null,
  },
  // Category view settings
  viewSettings: {
    sortBy: 'sortOrder',
    sortOrder: 'asc',
    viewType: 'grid', // 'grid', 'list'
  },
  // UI state
  ui: {
    showInactive: false,
    showDefaultOnly: false,
    categoryDetailOpen: false,
    selectedCategoryId: null,
  },
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Filter actions
    setCategoryFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCategoryFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Selection actions
    selectCategory: (state, action) => {
      const categoryId = action.payload;
      if (!state.selectedCategories.includes(categoryId)) {
        state.selectedCategories.push(categoryId);
      }
    },
    deselectCategory: (state, action) => {
      const categoryId = action.payload;
      state.selectedCategories = state.selectedCategories.filter(
        (id) => id !== categoryId
      );
    },
    selectAllCategories: (state, action) => {
      state.selectedCategories = action.payload; // Array of category IDs
    },
    clearSelectedCategories: (state) => {
      state.selectedCategories = [];
    },

    // Category form actions
    openCategoryForm: (state, action) => {
      const {
        mode = 'create',
        categoryId = null,
        initialData = null,
      } = action.payload || {};
      state.categoryForm = {
        isOpen: true,
        mode,
        categoryId,
        initialData,
      };
    },
    closeCategoryForm: (state) => {
      state.categoryForm = initialState.categoryForm;
    },

    // View settings actions
    setCategoryViewSettings: (state, action) => {
      state.viewSettings = { ...state.viewSettings, ...action.payload };
    },

    // UI actions
    toggleShowInactive: (state) => {
      state.ui.showInactive = !state.ui.showInactive;
      // Update filter when toggling
      state.filters.isActive = state.ui.showInactive ? undefined : true;
    },
    setShowInactive: (state, action) => {
      state.ui.showInactive = action.payload;
      state.filters.isActive = action.payload ? undefined : true;
    },
    toggleShowDefaultOnly: (state) => {
      state.ui.showDefaultOnly = !state.ui.showDefaultOnly;
      state.filters.isDefault = state.ui.showDefaultOnly ? true : undefined;
    },
    setShowDefaultOnly: (state, action) => {
      state.ui.showDefaultOnly = action.payload;
      state.filters.isDefault = action.payload ? true : undefined;
    },
    openCategoryDetail: (state, action) => {
      state.ui.categoryDetailOpen = true;
      state.ui.selectedCategoryId = action.payload;
    },
    closeCategoryDetail: (state) => {
      state.ui.categoryDetailOpen = false;
      state.ui.selectedCategoryId = null;
    },

    // Reset category state on logout
    resetCategoryState: () => initialState,
  },
});

// Export hooks
export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryStatsQuery,
  useGetCategoryTasksQuery,
  useUpdateCategoryTaskCountMutation,
  useToggleCategoryActiveMutation,
  useCreateDefaultCategoriesMutation,
} = categoryApiSlice;

// Export actions
export const {
  setCategoryFilters,
  clearCategoryFilters,
  selectCategory,
  deselectCategory,
  selectAllCategories,
  clearSelectedCategories,
  openCategoryForm,
  closeCategoryForm,
  setCategoryViewSettings,
  toggleShowInactive,
  setShowInactive,
  toggleShowDefaultOnly,
  setShowDefaultOnly,
  openCategoryDetail,
  closeCategoryDetail,
  resetCategoryState,
} = categorySlice.actions;

// Export reducer
export default categorySlice.reducer;
