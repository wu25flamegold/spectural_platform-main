// store/roiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const roiSlice = createSlice({
  name: 'roi',
  initialState: {
    result: null
  },
  reducers: {
    setRoiResult: (state, action) => {
      state.result = action.payload;
    },
    clearRoiResult: (state) => {
      state.result = null;
    }
  }
});

export const { setRoiResult, clearRoiResult } = roiSlice.actions;
export default roiSlice.reducer;
