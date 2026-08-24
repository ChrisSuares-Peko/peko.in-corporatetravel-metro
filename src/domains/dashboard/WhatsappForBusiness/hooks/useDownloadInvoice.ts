import { useState, useCallback } from 'react';

import { saveAs } from 'file-saver';

import { useAppSelector } from '@src/hooks/store';

import { downloadInvoice } from '../api';
import { downloadResponse } from '../types/types';

export const useDownloadInvoice = () => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);

    const getInvoiceData = useCallback(
        async (subscriptionId: number) => {
            setIsLoading(true);
            const data: downloadResponse | false = await downloadInvoice({
                userId: id,
                userType: role,
                subscriptionId,
            });
            if (data) {
                const uint8Array = new Uint8Array(data.pdfBuffer.data);

                const blob = new Blob([uint8Array], { type: 'application/pdf' });

                saveAs(blob, `Invoice-${subscriptionId}.pdf`);
            }
            setIsLoading(false);
        },
        [id, role]
    );

    return { loader: isLoading, getInvoiceData };
};
