import { useCallback, useEffect, useState } from 'react';

import { saveAs } from 'file-saver';

import { CommonFileBuffer } from '@customtypes/general';
import { useAppSelector } from '@src/hooks/store';

import { assign, deleteFleet, getAllFleets, getFileBufferReport } from '../api/index';

export default function useManageFleetApi({
    searchText,
    category,
    sort,
    page,
    itemsPerPage,
    filter,
    from,
    to,
    sortField,
}: any) {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [fleet, setFleets] = useState<any>([]);
    const [details, setDetails] = useState<any>([]);

    const [refresh, setRefresh] = useState<boolean>(false);
    const [count, setCount] = useState<number>(1);

    const geFleets = useCallback(async () => {
        setIsLoading(true);
        const data: any | false = await getAllFleets({
            userId: id,
            userType: role,
            from,
            to,
            searchText,

            page,
            itemsPerPage,
        });

        if (data) {
            const arr = data?.data?.map((values: any) => ({
                vehicleId: values.id,
                vehicleNumber: values.vehicleNumber,
                model: values.model,
            }));
            setDetails(arr);
            setFleets(data.data);
            setCount(data.recordsTotal);

            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
        setRefresh(false);
    }, [id, role, from, to, searchText, page, itemsPerPage]);

    const assignApi = useCallback(
        async (payloads: any) => {
            try {
                const data: any = await assign({
                    userId: id,
                    userType: role,
                    vehicleId: payloads.vehicleId,
                    driverId: payloads.driverId,
                });
                if (data) {
                    setRefresh(true);
                }
                return data;
                // Returning the data directly from the API call
            } catch (error) {
                console.error('Error in API call:', error);
                return null; // Return null or handle error as needed
            }
        },
        [id, role]
    );
    const deleteApi = useCallback(
        async (payloads: any) => {
            try {
                const data: any = await deleteFleet({
                    userId: id,
                    userType: role,
                    id: payloads.id,
                });
                if (data) {
                    setRefresh(true);
                    return true;
                }
                return false;
                // Returning the data directly from the API call
            } catch (error) {
                console.error('Error in API call:', error);
                return null; // Return null or handle error as needed
            }
        },
        [id, role]
    );

    const downloadReport = async (type: string, searchValue: string) => {
        setIsLoading(true);
        const data: CommonFileBuffer | false = await getFileBufferReport({
            userId: id,
            userType: role,
            type,
            searchText: searchValue
        });
        if (data) {
            const arrayBuffer = new Uint8Array(data.buffer.data);

            // Convert ArrayBuffer to Blob
            const blob = new Blob([arrayBuffer], {
                type: data.fileType,
            });

            // Trigger download
            if (type === 'excel') {
                saveAs(blob, `Vehicles Report.xlsx`);
            } else if (type === 'csv') {
                saveAs(blob, `Vehicles Report.csv`);
            } else if (type === 'pdf') {
                saveAs(blob, `Vehicles Report.pdf`);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        geFleets();
    }, [geFleets, refresh]);

    return { isLoading, fleet, count, assignApi, setRefresh, deleteApi, details, downloadReport };
}
