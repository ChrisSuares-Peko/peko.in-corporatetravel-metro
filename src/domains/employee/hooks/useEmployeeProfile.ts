import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { EmployeeProfile, getEmployeeProfile } from '../api/onboarding';

// Local-state fetch (matches useOnboardingStatus.ts's pattern) rather than a
// Redux slice — this domain doesn't use Redux for employee data anywhere else.
export const useEmployeeProfile = () => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getEmployeeProfile({ userType: role, userId: id });
            setProfile(data);
        } catch {
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [role, id]);

    useEffect(() => {
        load();
    }, [load]);

    return { loading, profile, reload: load };
};
