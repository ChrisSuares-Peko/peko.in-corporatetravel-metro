import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { useAppSelector, useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { initiateKyb, uploadKybDocuments } from '../../../api/admin/kybStatusApi';
import { useSubmitKybDocuments } from '../../../hooks/admin/useSubmitKybDocuments';
import { setKybStage } from '../../../slices/corporateCardsSlice';
import { KYB_DOCUMENTS, KYB_DOCUMENT_NAME_MAP } from '../../../utils/kybData';

vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(),
}));

vi.mock('@src/slices/apiSlice', () => ({
    showToast: vi.fn((payload: unknown) => ({ type: 'SHOW_TOAST', payload })),
}));

vi.mock('../../../api/admin/kybStatusApi', () => ({
    uploadKybDocuments: vi.fn(),
    initiateKyb: vi.fn(),
}));

vi.mock('../../../slices/corporateCardsSlice', () => ({
    setKybStage: vi.fn((stage: string) => ({ type: 'SET_KYB_STAGE', payload: stage })),
}));

const mockDispatch = vi.fn();
const mockAuth = { reducer: { auth: { role: 'admin', id: 5 } } };

// Every KYB_DOCUMENTS entry present, as Formik's validationSchema guarantees by the time onSubmit fires.
const allDocsValues = () =>
    Object.fromEntries(
        KYB_DOCUMENTS.map(doc => [`doc_${doc.key}`, { base64: `base64-${doc.key}`, format: 'pdf', name: `${doc.key}.pdf` }])
    );

describe('useSubmitKybDocuments', () => {
    let onSubmitted: Mock;

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppSelector as unknown as Mock).mockImplementation((fn: any) => fn(mockAuth));
        (useAppDispatch as unknown as Mock).mockReturnValue(mockDispatch);
        onSubmitted = vi.fn();
    });

    it('starts with submitLoading=false', () => {
        const { result } = renderHook(() => useSubmitKybDocuments(onSubmitted));
        expect(result.current.submitLoading).toBe(false);
    });

    it('uploads each document one at a time, mapped to documentName/fileBase/fileFormat via KYB_DOCUMENT_NAME_MAP', async () => {
        (uploadKybDocuments as Mock).mockResolvedValue({ status: true });
        (initiateKyb as Mock).mockResolvedValue({ status: true });
        const { result } = renderHook(() => useSubmitKybDocuments(onSubmitted));

        await result.current.handleSubmit(allDocsValues());

        expect(uploadKybDocuments).toHaveBeenCalledTimes(KYB_DOCUMENTS.length);
        KYB_DOCUMENTS.forEach((doc, index) => {
            expect(uploadKybDocuments).toHaveBeenNthCalledWith(index + 1, 'admin', 5, [
                { documentName: KYB_DOCUMENT_NAME_MAP[doc.key], fileBase: `base64-${doc.key}`, fileFormat: 'pdf' },
            ]);
        });
    });

    it('omits documents that are absent from values', async () => {
        (uploadKybDocuments as Mock).mockResolvedValue({ status: true });
        (initiateKyb as Mock).mockResolvedValue({ status: true });
        const { result } = renderHook(() => useSubmitKybDocuments(onSubmitted));

        const values = allDocsValues();
        delete values[`doc_${KYB_DOCUMENTS[0].key}`];

        await result.current.handleSubmit(values);

        expect(uploadKybDocuments).toHaveBeenCalledTimes(KYB_DOCUMENTS.length - 1);
        const uploadedNames = (uploadKybDocuments as Mock).mock.calls.map(call => call[2][0].documentName);
        expect(uploadedNames).not.toContain(KYB_DOCUMENT_NAME_MAP[KYB_DOCUMENTS[0].key]);
    });

    it('stops uploading and does not call initiateKyb when a later document fails', async () => {
        (uploadKybDocuments as Mock)
            .mockResolvedValueOnce({ status: true })
            .mockResolvedValueOnce(false);
        const { result } = renderHook(() => useSubmitKybDocuments(onSubmitted));

        await result.current.handleSubmit(allDocsValues());

        expect(uploadKybDocuments).toHaveBeenCalledTimes(2);
        expect(initiateKyb).not.toHaveBeenCalled();
        expect(showToast).toHaveBeenCalledWith(
            expect.objectContaining({
                variant: 'error',
                description: expect.stringContaining(KYB_DOCUMENT_NAME_MAP[KYB_DOCUMENTS[1].key]),
            })
        );
    });

    it('calls initiateKyb after a successful upload, then dispatches setKybStage("submitted") and calls onSubmitted', async () => {
        (uploadKybDocuments as Mock).mockResolvedValue({ status: true });
        (initiateKyb as Mock).mockResolvedValue({ status: true });
        const { result } = renderHook(() => useSubmitKybDocuments(onSubmitted));

        await result.current.handleSubmit(allDocsValues());

        expect(initiateKyb).toHaveBeenCalledWith('admin', 5);
        expect(setKybStage).toHaveBeenCalledWith('submitted');
        expect(onSubmitted).toHaveBeenCalled();
    });

    it('shows an error toast and does not call initiateKyb when the upload fails', async () => {
        (uploadKybDocuments as Mock).mockResolvedValue(false);
        const { result } = renderHook(() => useSubmitKybDocuments(onSubmitted));

        await result.current.handleSubmit(allDocsValues());

        expect(initiateKyb).not.toHaveBeenCalled();
        expect(showToast).toHaveBeenCalledWith(
            expect.objectContaining({ variant: 'error', description: expect.stringContaining('upload') })
        );
        expect(onSubmitted).not.toHaveBeenCalled();
        expect(result.current.submitLoading).toBe(false);
    });

    it('shows a distinct error toast when upload succeeds but initiateKyb fails', async () => {
        (uploadKybDocuments as Mock).mockResolvedValue({ status: true });
        (initiateKyb as Mock).mockResolvedValue(false);
        const { result } = renderHook(() => useSubmitKybDocuments(onSubmitted));

        await result.current.handleSubmit(allDocsValues());

        expect(showToast).toHaveBeenCalledWith(
            expect.objectContaining({ variant: 'error', description: expect.stringContaining('Documents uploaded') })
        );
        expect(setKybStage).not.toHaveBeenCalled();
        expect(onSubmitted).not.toHaveBeenCalled();
        expect(result.current.submitLoading).toBe(false);
    });

    it('sets submitLoading=true while the request is in flight', async () => {
        (uploadKybDocuments as Mock).mockImplementation(() => new Promise(() => {}));
        const { result } = renderHook(() => useSubmitKybDocuments(onSubmitted));

        result.current.handleSubmit(allDocsValues());
        await waitFor(() => expect(result.current.submitLoading).toBe(true));
    });
});
