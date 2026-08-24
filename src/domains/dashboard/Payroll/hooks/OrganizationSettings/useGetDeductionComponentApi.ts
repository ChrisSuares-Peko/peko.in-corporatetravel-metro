import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getDeductionComponent } from '../../api/organizationSettings/index';
import { DeductionComponentListResponse } from '../../types/organizationSettings';

export function useGetAllDeductions(
    page: number,
    limit: number,
    searchText: string,
    reloadTable: boolean
) {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [deductionComp, setDeductionComp] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [count, setCount] = useState<number>();


    const allDeductionComponents = useCallback(async () => {
        setIsLoading(true);
        const data: DeductionComponentListResponse | false = await getDeductionComponent({
            userId: id,
            userType: role,
            limit,
            page,
            searchText,
        });
        if (data) {
            const arr = data?.componentData?.map(item => ({
                deductionName: item?.deductionName ?? '',
                deductionType: item.deductionType ?? '',
                calculationType: item.calculationType ?? '',
                amountPercentage: item.amountPercentage ?? '',
                calculationBasis: item?.calculationBasis ?? '',
                salaryDeductionType: item?.salaryDeductionType ?? '',
                status: item.status ?? '',
                id: item.id,
                action: '',
            }));
            setCount(data.totalCount);
            setDeductionComp(arr);
        }
        setIsLoading(false);
    }, [id, role, limit, page, searchText]);

    useEffect(() => {
        allDeductionComponents();
    }, [allDeductionComponents, reloadTable]);

    return { data: deductionComp, count, tableLoading: isLoading };
}
