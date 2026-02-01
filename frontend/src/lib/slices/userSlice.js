import { USERS_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),

    // User profile endpoints
    getUserProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 5,
    }),
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateUserPreferences: builder.mutation({
      query: (preferences) => ({
        url: `${USERS_URL}/preferences`,
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['User'],
    }),

    // User statistics
    getUserStats: builder.query({
      query: () => ({
        url: `${USERS_URL}/stats`,
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 30, // Cache stats for 30 seconds
    }),

    // Avatar variations
    getUserAvatarVariations: builder.query({
      query: (name) => ({
        url: `${USERS_URL}/avatar-variations`,
        params: name ? { name } : {},
      }),
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Admin endpoints
    getAllUsers: builder.query({
      query: ({ pageNumber = 1, pageSize = 10, keyword = '' } = {}) => ({
        url: USERS_URL,
        params: {
          pageNumber,
          pageSize,
          keyword,
        },
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 5,
    }),
    getUserById: builder.query({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
      }),
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
      keepUnusedDataFor: 5,
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),
    deactivateUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    reactivateUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  // Authentication hooks
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,

  // Profile hooks
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateUserPreferencesMutation,

  // Statistics hooks
  useGetUserStatsQuery,

  // Avatar hooks
  useGetUserAvatarVariationsQuery,

  // Admin hooks
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useReactivateUserMutation,
} = userApiSlice;
