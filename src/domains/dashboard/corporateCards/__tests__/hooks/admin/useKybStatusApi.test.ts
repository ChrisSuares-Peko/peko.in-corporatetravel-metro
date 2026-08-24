import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { useAppSelector, useAppDispatch } from '@src/hooks/store';

import { getKybStatus } from '../../../api/admin/kybStatusApi';
import { useKybStatusApi } from '../../../hooks/admin/useKybStatusApi';
import { setKybInfo, setKybStage } from '../../../slices/corporateCardsSlice';

vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(),
}));

vi.mock('../../../api/admin/kybStatusApi', () => ({
    getKybStatus: vi.fn(),
}));

vi.mock('../../../slices/corporateCardsSlice', () => ({
    setKybStage: vi.fn((stage: string) => ({ type: 'SET_KYB_STAGE', payload: stage })),
    setKybInfo: vi.fn((info: unknown) => ({ type: 'SET_KYB_INFO', payload: info })),
}));

const mockDispatch = vi.fn();
const mockAuth = { reducer: { auth: { role: 'admin', id: 5 } } };

describe('useKybStatusApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAppSelector as unknown as Mock).mockImplementation((fn: any) => fn(mockAuth));
        (useAppDispatch as unknown as Mock).mockReturnValue(mockDispatch);
    });

    describe('when enabled=false', () => {
        it('does not call getKybStatus', () => {
            renderHook(() => useKybStatusApi(false));
            expect(getKybStatus).not.toHaveBeenCalled();
        });

        it('returns isLoading=false immediately', () => {
            const { result } = renderHook(() => useKybStatusApi(false));
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('when enabled=true', () => {
        it('calls getKybStatus with role and id', async () => {
            (getKybStatus as Mock).mockResolvedValue(false);
            renderHook(() => useKybStatusApi(true));
            await waitFor(() => expect(getKybStatus).toHaveBeenCalledWith('admin', 5));
        });

        it('starts with isLoading=true when enabled', () => {
            (getKybStatus as Mock).mockImplementation(() => new Promise(() => {}));
            const { result } = renderHook(() => useKybStatusApi(true));
            expect(result.current.isLoading).toBe(true);
        });

        it('sets isLoading=false after fetch completes', async () => {
            (getKybStatus as Mock).mockResolvedValue(false);
            const { result } = renderHook(() => useKybStatusApi(true));
            await waitFor(() => expect(result.current.isLoading).toBe(false));
        });

        it('dispatches setKybStage("initiate") when there is no application row yet', async () => {
            (getKybStatus as Mock).mockResolvedValue({ data: { application: null } });
            renderHook(() => useKybStatusApi(true));
            await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
            expect(setKybStage).toHaveBeenCalledWith('initiate');
        });

        it.each([
            ['PENDING', 'initiate'],
            ['SUBMITTED', 'submitted'],
            ['UNDER_REVIEW', 'pending'],
            ['VERIFIED', 'verified'],
            ['REJECTED', 'rejected'],
            ['COMPLETED', 'complete'],
        ])('dispatches setKybStage("%s" -> "%s") when there is no kybReference yet', async (kybStatus, stage) => {
            (getKybStatus as Mock).mockResolvedValue({ data: { application: { kybStatus } } });
            renderHook(() => useKybStatusApi(true));
            await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
            expect(setKybStage).toHaveBeenCalledWith(stage);
        });

        it('dispatches setKybStage("submitted") for PENDING once a kybReference has been stamped', async () => {
            (getKybStatus as Mock).mockResolvedValue({
                data: { application: { kybStatus: 'PENDING', kybReference: 'KYBABC1234567' } },
            });
            renderHook(() => useKybStatusApi(true));
            await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
            expect(setKybStage).toHaveBeenCalledWith('submitted');
        });

        it('falls back to "initiate" for an unrecognized status', async () => {
            (getKybStatus as Mock).mockResolvedValue({ data: { application: { kybStatus: 'SOMETHING_NEW' } } });
            renderHook(() => useKybStatusApi(true));
            await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
            expect(setKybStage).toHaveBeenCalledWith('initiate');
        });

        it('dispatches setKybInfo with refId, a formatted submittedOn, and the rejection reason', async () => {
            (getKybStatus as Mock).mockResolvedValue({
                data: {
                    application: {
                        kybStatus: 'REJECTED',
                        kybReference: 'KYB22402C442C',
                        updatedAt: '2026-07-17T17:56:00.000Z',
                        rejectionReason: 'Blurry PAN card.',
                    },
                },
            });
            renderHook(() => useKybStatusApi(true));
            await waitFor(() => expect(setKybInfo).toHaveBeenCalled());
            expect(setKybInfo).toHaveBeenCalledWith({
                refId: 'KYB22402C442C',
                submittedOn: expect.any(String),
                rejectionReason: 'Blurry PAN card.',
            });
        });

        it('dispatches setKybInfo with nulls when there is no application row', async () => {
            (getKybStatus as Mock).mockResolvedValue({ data: { application: null } });
            renderHook(() => useKybStatusApi(true));
            await waitFor(() => expect(setKybInfo).toHaveBeenCalled());
            expect(setKybInfo).toHaveBeenCalledWith({ refId: null, submittedOn: null, rejectionReason: null });
        });

        it('does not dispatch when the API returns false', async () => {
            (getKybStatus as Mock).mockResolvedValue(false);
            renderHook(() => useKybStatusApi(true));
            await waitFor(() => expect(getKybStatus).toHaveBeenCalled());
            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('exposes refetch, which re-invokes getKybStatus', async () => {
            (getKybStatus as Mock).mockResolvedValue(false);
            const { result } = renderHook(() => useKybStatusApi(true));
            await waitFor(() => expect(getKybStatus).toHaveBeenCalledTimes(1));

            await result.current.refetch();

            expect(getKybStatus).toHaveBeenCalledTimes(2);
        });
    });
});
