import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { FareBreakdown, MetroTicket, SmartCard, SmartCardRecharge } from '../types/metro';

export type MetroJourneySelection = {
    cityId: string;
    cityName: string;
    boardingStationId: string;
    boardingStationName: string;
    dropStationId: string;
    dropStationName: string;
    passengerCount: number;
};

interface MetroState {
    journey: MetroJourneySelection | null;
    fare: FareBreakdown | null;
    ticket: MetroTicket | null;
    smartCard: SmartCard | null;
    recharge: SmartCardRecharge | null;
}

const initialState: MetroState = {
    journey: null,
    fare: null,
    ticket: null,
    smartCard: null,
    recharge: null,
};

export const metroSlice = createSlice({
    name: 'metro',
    initialState,
    reducers: {
        setMetroJourney: (state, action: PayloadAction<MetroJourneySelection>) => {
            state.journey = action.payload;
        },
        setMetroFare: (state, action: PayloadAction<FareBreakdown>) => {
            state.fare = action.payload;
        },
        setMetroTicket: (state, action: PayloadAction<MetroTicket>) => {
            state.ticket = action.payload;
        },
        setSmartCard: (state, action: PayloadAction<SmartCard>) => {
            state.smartCard = action.payload;
        },
        setSmartCardRecharge: (state, action: PayloadAction<SmartCardRecharge>) => {
            state.recharge = action.payload;
        },
        clearMetroJourney: state => {
            state.journey = null;
            state.fare = null;
            state.ticket = null;
        },
        clearSmartCard: state => {
            state.smartCard = null;
            state.recharge = null;
        },
    },
});

export const {
    setMetroJourney,
    setMetroFare,
    setMetroTicket,
    setSmartCard,
    setSmartCardRecharge,
    clearMetroJourney,
    clearSmartCard,
} = metroSlice.actions;
export default metroSlice.reducer;
