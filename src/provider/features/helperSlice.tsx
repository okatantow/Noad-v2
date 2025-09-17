import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ToasterData {
  type: string;
  msg: string;
}

interface HelperState {
  loadingBarOn: boolean;
  toasterOn: boolean;
  toasterData: ToasterData;
  loginChange: number;
}

const initialState: HelperState = {
  loadingBarOn: false,
  toasterOn: false,
  toasterData: { type: "", msg: "" },
  loginChange: 1,
};

export const helperSlice = createSlice({
  name: 'helper',
  initialState,
  reducers: {
    toggleLoadingBar: (state, action: PayloadAction<boolean>) => {
      state.loadingBarOn = action.payload;
    },
    toggleToaster: (state, action: PayloadAction<{ isOpen: boolean; toasterData: ToasterData }>) => {
      const { isOpen, toasterData } = action.payload;
      state.toasterOn = isOpen;
      state.toasterData = toasterData;
    },
    toggleLoginChange: (state, action: PayloadAction<number>) => {
      state.loginChange = state.loginChange + action.payload;
    },
  },
});

export const { toggleLoadingBar, toggleToaster, toggleLoginChange } = helperSlice.actions;

// Define RootState type based on your store configuration
type RootState = {
  helper: HelperState;
};

// Selectors
export const selectLoadingBar = (state: RootState) => state.helper.loadingBarOn;
export const selectToasterStatus = (state: RootState) => state.helper.toasterOn;
export const selectToasterData = (state: RootState) => state.helper.toasterData;
export const selectLoginChange = (state: RootState) => state.helper.loginChange;

export default helperSlice.reducer;