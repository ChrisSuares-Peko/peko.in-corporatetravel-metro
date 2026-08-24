import { useState } from 'react';

import { useField } from 'formik';

import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { useDocumentUpload } from '../context/documentUpload';

export type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

// Shared on-the-go document upload for FileUploadField / PhotoUpload. Picks the
// file into Formik as {name, base64}, pushes it to the vendor immediately, and
// on success replaces the value with just the filename (base64 dropped) so the
// Documents-step Next never re-uploads it. On failure the bytes are kept so the
// batch Next retries, and a friendly, field-level error toast is shown.
export const useDocAutoUpload = (name: string) => {
    const [, , helpers] = useField(name);
    const uploadDoc = useDocumentUpload();
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<UploadStatus>('idle');

    const upload = async (file: { name: string; base64: string }) => {
        helpers.setValue(file);
        if (!uploadDoc) return;
        setStatus('uploading');
        const res = await uploadDoc(name, file);
        if (res.ok) {
            // Drop the base64 — the file now lives with the vendor; the filename
            // string keeps the field "filled" for validation + display.
            helpers.setValue(file.name);
            setStatus('done');
        } else if (res.skipped) {
            // No applicationId yet (shouldn't happen post-payment) — leave the
            // bytes for the batch upload on Next.
            setStatus('idle');
        } else {
            setStatus('error');
            dispatch(showToast({ description: res.error || 'Upload failed', variant: 'error' }));
        }
    };

    return { status, upload, setStatus };
};
