import { useCallback, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';


import {
    getAllGovtServices,
    updateGovtServiceStatus,
} from '../api/govtServicesApi';
import { GovtService, GovtServiceData, GovtServiceFilters, GovtServiceUpdateStatus } from '../types/govtServicesTypes';

const useGetGovtServices = ({
    searchText,
    itemsPerPage,
    page,
    sort,
    sortField,
}: GovtServiceFilters) => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const dispatch = useAppDispatch();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [tableData, setTableData] = useState<GovtService[]>();

    const getData = useCallback(async () => {
        setIsLoading(true);
        const data: GovtServiceData | false = await getAllGovtServices({
            userId: id,
            userType: role,
            searchText,
            itemsPerPage,
            page,
            sort,
            sortField,
        });
        if (data) {
            setTableData(data.data);
            setCount(data.recordsTotal);
        }
        setRefresh(false);
        setIsLoading(false);
    }, [id, itemsPerPage, page, role, searchText, sort, sortField]);

    const updateActiveStatus = useCallback(
        async ({ id: serviceId, status }: GovtServiceUpdateStatus) => {
            setIsLoading(true);
            const data = await updateGovtServiceStatus({
                userId: id,
                userType: role,
                id: serviceId,
                status,
            });
            if (data) {
                setRefresh(true);
            } else {
                setIsLoading(false);
            }
        },
        [id, role]
    );

    const handleToggleStatus = useCallback(
        (record: GovtService) => {
            const currentlyActive = record.status === true || record.status === 1;
            updateActiveStatus({ id: record.id, status: !currentlyActive });
        },
        [updateActiveStatus]
    );

    useEffect(() => {
        getData();
    }, [getData, refresh]);

    return {
        isLoading,
        tableData,
        count,
        setRefresh,
        handleToggleStatus,
        dispatch,
    };
};

export default useGetGovtServices;
