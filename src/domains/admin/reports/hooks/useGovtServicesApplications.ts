import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getAllGovtServicesApplications, GovtServicesApplicationBody } from '../api/govtServicesApplications';
import { getData } from '../types/index';

const useGovtServicesApplications = (payload: getData) => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [tableData, setTableData] = useState<GovtServicesApplicationBody[]>();

    const getAllTableData = useCallback(async () => {
        setIsLoading(true);
        const data = await getAllGovtServicesApplications({
            userId: id,
            userType: role,
            ...payload,
        });
        if (data) {
            setTableData(data.data);
            setCount(data.recordsTotal);
        }
        setIsLoading(false);
    }, [id, payload, role]);

    useEffect(() => {
        getAllTableData();
    }, [getAllTableData]);

    return { isLoading, tableData, count, refetch: getAllTableData };
};

export default useGovtServicesApplications;
