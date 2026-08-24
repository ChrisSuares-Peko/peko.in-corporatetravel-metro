import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type PendingSelections = {
    travelType: 'single' | 'multi';
    selectedCountry: string[];
    countryCodes: Record<string, string>;
    selectedPlans: Record<string, any>;
    quantities: Record<string, number>;
};

const initialState = {
    searchData: {
        esimType: 'local',
        country: 'AL',
        region: 'asia',
    },
    esimDetails: {
        id: '',
        iccid: '',
    },
    pendingSelections: null as PendingSelections | null,
};

const esimSlice = createSlice({
    name: 'esim',
    initialState,
    reducers: {
        setSearchData: (state, action: PayloadAction<any>) => {
            state.searchData = action.payload;
        },
        setEsimDetails: (state, action: PayloadAction<any>) => {
            state.esimDetails = action.payload;
        },
        setPendingSelections: (state, action: PayloadAction<PendingSelections>) => {
            state.pendingSelections = action.payload;
        },
        clearPendingSelections: state => {
            state.pendingSelections = null;
        },
        resetFormState: () => initialState,
    },
});

export const { setSearchData, setEsimDetails, setPendingSelections, clearPendingSelections, resetFormState } = esimSlice.actions;
export default esimSlice.reducer;
