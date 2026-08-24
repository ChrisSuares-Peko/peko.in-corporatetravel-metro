import { useCallback, useEffect, useState } from 'react';

import saveAs from 'file-saver';
import { useDispatch } from 'react-redux';

import { CommonFileBuffer } from '@customtypes/general';
import { useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import {
    deletePekoCreditsApi,
    getAllCouponCodeData,
    getFileBufferPekoCredit,
    updateCouponCodeStatus,
} from '../../api/pekoCredits';
import { Coupon, getCoupon, updateStatus } from '../../types/pekoCredits';

const useGetSubscriptionCoupon = (payload: getCoupon) => {
    const dispatch = useDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [count, setCount] = useState<number>(1);
    const [tableData, setTableData] = useState<Coupon[]>();

    const getDataFromApi = useCallback(async () => {
        setIsLoading(true);
        const data = await getAllCouponCodeData({
            userId: id,
            userType: role,
            ...payload,
        });
        if (data) {
            setTableData(data.data);
            setCount(data.recordsTotal);
        }
        setIsLoading(false);
    }, [id, role, payload]);

    const updateActiveStatus = useCallback(
        async ({ couponId, status }: updateStatus) => {
            setIsLoading(true);
            const data = await updateCouponCodeStatus({
                userId: id,
                userType: role,
                couponId,
                status,
            });
            if (data) {
                setRefresh(!refresh);
            }
            setIsLoading(false);
        },
        [id, role, refresh]
    );

    const handleDeleteCoupon = async (couponId: number) => {
        setIsLoading(true);
        const response: {} | false = await deletePekoCreditsApi({
            userId: id,
            userType: role,
            couponId,
        });
        setIsLoading(false);
        if (response) {
            dispatch(
                showToast({
                    description: `Package deleted successfully`,
                    variant: 'success',
                })
            );
            // Use functional update to prevent immediate re-render
            setRefresh(prev => !prev);
        }
    };
    const downloadReport = async (type: string) => {
        setIsLoading(true);
        const data: CommonFileBuffer | false = await getFileBufferPekoCredit({
            userId: id,
            userType: role,
            type,
            searchText: payload.searchText,
            partnerId: payload.partnerId,
            page: payload.page,
            itemsPerPage: payload.itemsPerPage,
            sort: '',
        });
        if (data === false) {
            dispatch(
                showToast({
                    description: 'No data is available for export.',
                    variant: 'error',
                })
            );
        }
        if (data) {
            const arrayBuffer = new Uint8Array(data.buffer.data);

            // Convert ArrayBuffer to Blob
            const blob = new Blob([arrayBuffer], {
                type: data.fileType,
            });

            // Trigger download
            if (type === 'excel') {
                saveAs(blob, `Peko Credits.xlsx`);
            } else if (type === 'csv') {
                saveAs(blob, `Peko Credits.csv`);
            } else if (type === 'pdf') {
                saveAs(blob, `Peko Credits.pdf`);
            }
        }
        setIsLoading(false);
    };
    useEffect(() => {
        getDataFromApi();
    }, [getDataFromApi, refresh]);

    return {
        isLoading,
        tableData,
        count,
        updateActiveStatus,
        handleDeleteCoupon,
        setRefresh,
        downloadReport,
    };
};

export default useGetSubscriptionCoupon;
