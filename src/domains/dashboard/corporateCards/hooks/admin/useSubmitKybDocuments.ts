import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { initiateKyb, uploadKybDocuments } from '../../api/admin/kybStatusApi';
import { setKybStage } from '../../slices/corporateCardsSlice';
import { KYB_DOCUMENT_NAME_MAP, KYB_DOCUMENTS } from '../../utils/kybData';
import { KybFileValue } from '../../utils/types';

/**
 * Uploads whichever KYB_DOCUMENTS files are present in the Formik values, then submits the KYB
 * application (POST kyb-status/initiate). `onSubmitted` is called last so the caller can refetch the
 * real status (ref ID / submitted-on) rather than relying on stale local data.
 *
 * Uploaded one document per request, sequentially — batching all 8 (up to 10MB each) into a single
 * request pushed the body past the server's JSON size limit, since base64 inflates each file by ~4/3.
 */
export const useSubmitKybDocuments = (onSubmitted: () => void) => {
    const dispatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [submitLoading, setSubmitLoading] = useState(false);

    const handleSubmit = async (values: Record<string, KybFileValue | null>) => {
        // Formik's validationSchema (see UploadDocumentsKyb.tsx) already requires every KYB_DOCUMENTS
        // entry before this is called, so every file here is guaranteed to be present.
        const documents = KYB_DOCUMENTS.map(doc => ({ doc, file: values[`doc_${doc.key}`] }))
            .filter((entry): entry is { doc: (typeof KYB_DOCUMENTS)[number]; file: KybFileValue } => !!entry.file)
            .map(({ doc, file }) => ({
                documentName: KYB_DOCUMENT_NAME_MAP[doc.key],
                fileBase: file.base64,
                fileFormat: file.format,
            }));

        setSubmitLoading(true);

        // eslint-disable-next-line no-restricted-syntax
        for (const document of documents) {
            // eslint-disable-next-line no-await-in-loop
            const uploadRes = await uploadKybDocuments(role, id, [document]);
            if (!uploadRes) {
                dispatch(
                    showToast({
                        variant: 'error',
                        description: `Failed to upload ${document.documentName}. Please try again.`,
                    })
                );
                setSubmitLoading(false);
                return;
            }
        }

        const initiateRes = await initiateKyb(role, id);
        setSubmitLoading(false);
        if (!initiateRes) {
            dispatch(
                showToast({
                    variant: 'error',
                    description: 'Documents uploaded, but failed to submit KYB. Please try again.',
                })
            );
            return;
        }

        dispatch(setKybStage('submitted'));
        onSubmitted();
    };

    return { handleSubmit, submitLoading };
};
