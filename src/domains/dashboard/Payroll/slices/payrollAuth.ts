import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ProgressState {
    departmentAndEmployees: boolean;
    progress: string;
    leaveandAttendance: boolean;
    payrollSettings: boolean;
    complianceSettings: boolean;
    showDashboard: boolean;
    isPurchased: boolean;
    hasBasicSalaryComponent: boolean;
    basicSalaryAmount: number;
    onBoardStatus: string;
    isSkippedDasboard: boolean;
    numberOfDaysWorking: number;
}

const initialState: ProgressState = {
    departmentAndEmployees: false,
    progress: '0%',
    leaveandAttendance: false,
    payrollSettings: false,
    complianceSettings: false,
    showDashboard: false,
    isPurchased: false,
    hasBasicSalaryComponent: false,
    basicSalaryAmount: 0,
    onBoardStatus: '0',
    isSkippedDasboard: false,
    numberOfDaysWorking: 0,
};

export const payrollAuthSlice = createSlice({
    name: 'payrollAuth',
    initialState,
    reducers: {
        setPayrollProgress: (state, action: PayloadAction<Partial<ProgressState>>) => {
            state = { ...state, ...action.payload };
            return state;
        },
    },
});

export const { setPayrollProgress } = payrollAuthSlice.actions;

export default payrollAuthSlice.reducer;
