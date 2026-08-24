import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { ServicesListResponse } from '@customtypes/general';

interface ApiState {
    services: ServicesListResponse | null;
}

const initialState: ApiState = {
    services: null,
};

export const userSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        setServices: (state, action: PayloadAction<Partial<ApiState>>) => {
            state = { ...state, ...action.payload };
            return state;
        },
    },
});

export const { setServices } = userSlice.actions;

export default userSlice.reducer;
