import { useCallback, useEffect, useState } from 'react';

import { saveAs } from 'file-saver';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import {
    getGovtServicesApplicationById,
    updateGovtServicesApplicationStatus,
    downloadGovtServicesDocument,
    GovtServicesApplicationBody,
} from '../api/govtServicesApplications';

const useGovtServiceApplicationDetail = (id: string | number) => {
    const { role, id: userId } = useAppSelector(state => state.reducer.auth);
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [application, setApplication] = useState<GovtServicesApplicationBody | null>(null);

    const fetchApplication = useCallback(async () => {
        setIsLoading(true);
        const data = await getGovtServicesApplicationById(role, userId, id);
        if (data) setApplication(data);
        setIsLoading(false);
    }, [role, userId, id]);

    useEffect(() => {
        fetchApplication();
    }, [fetchApplication]);

    const updateStatus = async (status: string, remarks?: string, documentBase64?: string, documentFormat?: string) => {
        setIsUpdating(true);
        const res: any = await updateGovtServicesApplicationStatus(role, userId, id, {
            status,
            ...(remarks ? { remarks } : {}),
            ...(documentBase64 ? { documentBase64, documentFormat } : {}),
        });
        setIsUpdating(false);
        if (res?.status === true) {
            dispatch(showToast({ description: 'Status updated successfully', variant: 'success' }));
            fetchApplication();
            return true;
        }
        dispatch(showToast({ description: res?.message ?? 'Failed to update status', variant: 'error' }));
        return false;
    };

    const downloadDocument = async (url: string) => {
        const data = await downloadGovtServicesDocument(role, userId, url);
        if (data) {
            const arrayBuffer = new Uint8Array(data.buffer.data);
            const blob = new Blob([arrayBuffer], { type: data.fileType });
            const fileName = url.split('/').pop()?.split('?')[0] || 'document';
            saveAs(blob, fileName);
        }
    };

    return { isLoading, isUpdating, application, updateStatus, downloadDocument };
};

export default useGovtServiceApplicationDetail;
