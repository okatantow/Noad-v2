import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
};


export const userSlice = createSlice({
  name: 'user',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    login: (state,action)=>{
      state.user = action.payload;
    },
    logout: (state)=>{
      state.user = null;
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.setItem('is_login','no');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('company');
    }

  },

});

export const { login,logout } = userSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.user.value)`
export const selectUser = (state) => state.user.user;


export default userSlice.reducer;
