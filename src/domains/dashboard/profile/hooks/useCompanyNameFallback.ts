import { useEffect, useState } from 'react';

import { getApplications } from '@domains/dashboard/CompanyIncorporation/api';
import { useAppSelector } from '@src/hooks/store';

export function useCompanyNameFallback() {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const basicInfoName = useAppSelector(state => state.reducer.basicInfo.data?.name);
    const userCompanyName = useAppSelector(state => state.reducer.user.user?.companyName);
    const name = basicInfoName || userCompanyName;
    const reduxApplications = useAppSelector(state => state.reducer.incorporation.applications);
    const [applicationId, setApplicationId] = useState<string | null>(null);

    const needsFallback = !name;

    useEffect(() => {
        if (!needsFallback || !id) return;

        if (reduxApplications.length > 0) {
            setApplicationId(reduxApplications[0].applicationId);
            return;
        }

        getApplications({ userId: id, userType: role }).then(result => {
            if (result && result.applications.length > 0) {
                setApplicationId(result.applications[0].applicationId);
            }
        });
    }, [needsFallback, id, role, reduxApplications]);

    return { applicationId, name };
}
