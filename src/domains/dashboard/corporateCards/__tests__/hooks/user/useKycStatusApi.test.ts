import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { useAppSelector, useAppDispatch } from '@src/hooks/store';

import { getKycStatus } from '../../../api/user/kycApi';
import { useKycStatusApi } from '../../../hooks/user/useKycStatusApi';
import { setKycInfo, setKycStage } from '../../../slices/corporateCardsSlice';

vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(),
}));

vi.mock('../../../api/user/kycApi', () => ({
    getKycStatus: vi.fn(),
}));

vi.mock('../../../slices/corporateCardsSlice', () => ({
    setKycStage: vi.fn((stage: string) => ({ type: 'SET_KYC_STAGE', payload: stage })),
    setKycInfo: vi.fn((info: unknown) => ({ type: 'SET_KYC_INFO', payload: info })),
}));

const mockDispatch = vi.fn();
const mockAuth = { reducer: { auth: { role: 'admin', id: 5 } } };

describe('useKycStatusApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAppSelector as unknown as Mock).mockImplementation((fn: any) => fn(mockAuth));
        (useAppDispatch as unknown as Mock).mockReturnValue(mockDispatch);
    });

    // -----------------------------------------------------------------------
    describe('when enabled=false', () => {
        it('does not call getKycStatus', () => {
            renderHook(() => useKycStatusApi(false));
            expect(getKycStatus).not.toHaveBeenCalled();
        });

        it('returns isLoading=false immediately', () => {
            const { result } = renderHook(() => useKycStatusApi(false));
            expect(result.current.isLoading).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    describe('when enabled=true', () => {
        it('calls getKycStatus with role and id', async () => {
            (getKycStatus as Mock).mockResolvedValue(false);
            renderHook(() => useKycStatusApi(true));
            await waitFor(() => expect(getKycStatus).toHaveBeenCalledWith('admin', 5));
        });

        it('starts with isLoading=true when enabled', () => {
            (getKycStatus as Mock).mockImplementation(() => new Promise(() => {}));
            const { result } = renderHook(() => useKycStatusApi(true));
            expect(result.current.isLoading).toBe(true);
        });

        it('sets isLoading=false after fetch completes', async () => {
            (getKycStatus as Mock).mockResolvedValue(false);
            const { result } = renderHook(() => useKycStatusApi(true));
            await waitFor(() => expect(result.current.isLoading).toBe(false));
        });

        it('dispatches setKycStage("verified") when state is COMPLETED', async () => {
            (getKycStatus as Mock).mockResolvedValue({ data: { kyc: { state: 'COMPLETED' } } });
            renderHook(() => useKycStatusApi(true));
            await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
            expect(setKycStage).toHaveBeenCalledWith('verified');
        });

        it('dispatches setKycStage("submitted") when state is IN_REVIEW', async () => {
            (getKycStatus as Mock).mockResolvedValue({ data: { kyc: { state: 'IN_REVIEW' } } });
            renderHook(() => useKycStatusApi(true));
            await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
            expect(setKycStage).toHaveBeenCalledWith('submitted');
        });

        it('dispatches setKycInfo with the refId and a formatted submittedOn', async () => {
            (getKycStatus as Mock).mockResolvedValue({
                data: {
                    kyc: {
                        state: 'IN_REVIEW',
                        refId: 'KYC-26071842',
                        submittedOn: '2026-07-16T17:08:40.000Z',
                    },
                },
            });
            renderHook(() => useKycStatusApi(true));
            await waitFor(() => expect(setKycInfo).toHaveBeenCalled());
            expect(setKycInfo).toHaveBeenCalledWith({
                refId: 'KYC-26071842',
                submittedOn: expect.any(String),
            });
        });

        it('dispatches setKycInfo with nulls when the fields are absent', async () => {
            (getKycStatus as Mock).mockResolvedValue({ data: { kyc: { state: 'IN_REVIEW' } } });
            renderHook(() => useKycStatusApi(true));
            await waitFor(() => expect(setKycInfo).toHaveBeenCalled());
            expect(setKycInfo).toHaveBeenCalledWith({ refId: null, submittedOn: null });
        });

        it('dispatches setKycStage("initiate") for any other state', async () => {
            (getKycStatus as Mock).mockResolvedValue({ data: { kyc: { state: 'REJECTED' } } });
            renderHook(() => useKycStatusApi(true));
            await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
            expect(setKycStage).toHaveBeenCalledWith('initiate');
        });

        it('dispatches setKycStage("initiate") when state is undefined', async () => {
            (getKycStatus as Mock).mockResolvedValue({ data: { kyc: { state: undefined } } });
            renderHook(() => useKycStatusApi(true));
            await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
            expect(setKycStage).toHaveBeenCalledWith('initiate');
        });

        it('does not dispatch when the API returns false', async () => {
            (getKycStatus as Mock).mockResolvedValue(false);
            renderHook(() => useKycStatusApi(true));
            await waitFor(() => expect(getKycStatus).toHaveBeenCalled());
            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('does not dispatch when res.data.kyc is missing', async () => {
            (getKycStatus as Mock).mockResolvedValue({ data: {} });
            renderHook(() => useKycStatusApi(true));
            await waitFor(() => expect(getKycStatus).toHaveBeenCalled());
            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });
});
