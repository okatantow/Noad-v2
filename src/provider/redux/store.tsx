// store.ts
import { configureStore } from '@reduxjs/toolkit';
import helperReducer from '../features/helperSlice';

export const store = configureStore({
  reducer: {
    helper: helperReducer
  },
});

// Export the RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;