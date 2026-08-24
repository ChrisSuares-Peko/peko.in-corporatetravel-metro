import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// eslint-disable-next-line import/no-cycle
import { ApplicationListItem } from '../apis';
import { Service } from '../types';

interface GovernmentServicesState {
    selectedApplication: ApplicationListItem | null;
    selectedService: Service | null;
    servicesList: Service[];
}

const initialState: GovernmentServicesState = {
    selectedApplication: null,
    selectedService: null,
    servicesList: [],
};

const governmentServicesSlice = createSlice({
    name: 'governmentServices',
    initialState,
    reducers: {
        setSelectedApplication: (state, action: PayloadAction<ApplicationListItem>) => {
            state.selectedApplication = action.payload;
        },
        clearSelectedApplication: (state) => {
            state.selectedApplication = null;
        },
        setSelectedService: (state, action: PayloadAction<Service>) => {
            state.selectedService = action.payload;
        },
        setServicesList: (state, action: PayloadAction<Service[]>) => {
            state.servicesList = action.payload;
        },
    },
});

export const { setSelectedApplication, clearSelectedApplication, setSelectedService, setServicesList } = governmentServicesSlice.actions;
export default governmentServicesSlice.reducer;
