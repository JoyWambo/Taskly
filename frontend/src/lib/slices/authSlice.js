import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
  isAuthenticated: localStorage.getItem('userInfo') ? true : false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearUserInfo: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.loading = false;
      // Clear all user-related data from storage
      localStorage.removeItem('userInfo');
    },
    // Update user profile data without full re-login
    updateUserProfile: (state, action) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
      }
    },
  },
  extraReducers: (builder) => {
    // Reset auth state when RTK Query encounters 401 errors
    builder.addMatcher(
      (action) => action.type.endsWith('/rejected') && action.payload?.status === 401,
      (state) => {
        state.userInfo = null;
        state.isAuthenticated = false;
        state.loading = false;
        localStorage.removeItem('userInfo');
      }
    );
  },
});

export const {
  setCredentials,
  setLoading,
  clearUserInfo,
  logout,
  updateUserProfile
} = authSlice.actions;

export default authSlice.reducer;
