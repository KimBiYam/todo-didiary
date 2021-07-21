import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export type DialogState = {
  isOpen: boolean;
  text: string | undefined;
};

const initialState: DialogState = {
  isOpen: false,
  text: undefined,
};

const delayDialog = (openTime: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(true), openTime);
  });

export const openDialog = createAsyncThunk(
  'dialog/openDialog',
  async (arg: { text: string; openTime: number }) => {
    const { openTime } = arg;
    await delayDialog(openTime);
  },
);

const dialogSlice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    closeDialog: (state) => {
      state.isOpen = false;
      state.text = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(openDialog.pending, (state, { meta }) => {
      state.isOpen = true;
      state.text = meta.arg.text;
    });
    builder.addCase(openDialog.fulfilled, (state) => {
      state.isOpen = false;
      state.text = undefined;
    });
  },
});

const { reducer, actions } = dialogSlice;

export const { closeDialog } = actions;

export default reducer;