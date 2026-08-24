import { useCallback, useEffect, useState } from 'react';

import { saveAs } from 'file-saver';

import { CommonFileBuffer } from '@customtypes/general';
import { useAppSelector } from '@src/hooks/store';

import {
    getOndcProductFilters,
    getOndcProducts,
    getOndcProductsReport,
    setOndcProductVisibilityApi,
} from '../../api/ondcProducts';
import { AdminOndcProduct, OndcProductFilters, OndcProductsQuery } from '../../types/ondcProduct';

/** Admin ONDC products catalog — list + toolbar filter options + export + visibility toggle. */
const useOndcProducts = (filters: OndcProductsQuery) => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState<number>(1);
    const [tableData, setTableData] = useState<AdminOndcProduct[]>();
    const [filterOptions, setFilterOptions] = useState<OndcProductFilters>({
        categories: [],
        sellers: [],
        cities: [],
    });

    const getAllTableData = useCallback(async () => {
        setIsLoading(true);
        const data = await getOndcProducts({ userId: id, userType: role, ...filters });
        if (data) {
            setTableData(data.data);
            setCount(data.recordsTotal);
        }
        setIsLoading(false);
    }, [id, role, filters]);

    const loadFilters = useCallback(async () => {
        const data = await getOndcProductFilters({ userId: id, userType: role });
        if (data) setFilterOptions(data);
    }, [id, role]);

    const toggleVisibility = async (productId: number, visible: boolean) => {
        // optimistic flip, revert on failure
        setTableData(prev => prev?.map(p => (p.id === productId ? { ...p, visibleOnPeko: visible } : p)));
        const ok = await setOndcProductVisibilityApi({ userId: id, userType: role, id: productId, visible });
        if (!ok) {
            setTableData(prev =>
                prev?.map(p => (p.id === productId ? { ...p, visibleOnPeko: !visible } : p))
            );
        }
        return !!ok;
    };

    const downloadReport = async (type: string) => {
        setIsLoading(true);
        const data: CommonFileBuffer | false = await getOndcProductsReport({
            userId: id,
            userType: role,
            type,
            ...filters,
        });
        if (data) {
            const arrayBuffer = new Uint8Array(data.buffer.data);
            const blob = new Blob([arrayBuffer], { type: data.fileType });
            if (type === 'excel') saveAs(blob, `Products.xlsx`);
            else if (type === 'csv') saveAs(blob, `Products.csv`);
            else if (type === 'pdf') saveAs(blob, `Products.pdf`);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getAllTableData();
    }, [getAllTableData]);

    useEffect(() => {
        loadFilters();
    }, [loadFilters]);

    return { isLoading, tableData, count, filterOptions, getAllTableData, toggleVisibility, downloadReport };
};

export default useOndcProducts;
