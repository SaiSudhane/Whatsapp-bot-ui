import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import messagesReducer from './messages-slice';
import usersReducer from './users-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messagesReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
