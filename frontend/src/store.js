import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { apiSlice } from './lib/slices/apiSlice';
import authReducer, {
  clearUserInfo,
  logout,
  setCredentials,
} from './lib/slices/authSlice';
import taskReducer, { resetTaskState } from './lib/slices/taskSlice';
import categoryReducer, {
  resetCategoryState,
} from './lib/slices/categorySlice';

const listenerMiddleware = createListenerMiddleware();

const resetUserScopedState = (dispatch) => {
  dispatch(apiSlice.util.resetApiState());
  dispatch(resetTaskState());
  dispatch(resetCategoryState());
};

listenerMiddleware.startListening({
  matcher: (action) =>
    action.type === logout.type ||
    action.type === clearUserInfo.type ||
    action.type === setCredentials.type,
  effect: async (action, listenerApi) => {
    const prevUserId = listenerApi.getOriginalState().auth.userInfo?._id;
    const nextUserId = listenerApi.getState().auth.userInfo?._id;

    // Reset caches/state when user logs out or when switching to a different user
    if (!nextUserId || prevUserId !== nextUserId) {
      resetUserScopedState(listenerApi.dispatch);
    }
  },
});

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    tasks: taskReducer,
    categories: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(listenerMiddleware.middleware)
      .concat(apiSlice.middleware),
  devTools: true,
});

export default store;
