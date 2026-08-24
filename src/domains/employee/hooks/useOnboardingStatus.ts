import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { EmployeeProfile, getEmployeeProfile } from '../api/onboarding';

// Completion is a real backend flag (Employee.isCompleted), set once the Emergency
// Contact step succeeds — unlike AE, which infers it client-side from field presence.
export const useOnboardingStatus = () => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [loading, setLoading] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getEmployeeProfile({ userType: role, userId: id });
            setProfile(data);
            setIsComplete(Boolean(data?.isCompleted));
        } catch {
            setIsComplete(false);
        } finally {
            setLoading(false);
        }
    }, [role, id]);

    useEffect(() => {
        load();
    }, [load]);

    return { loading, isComplete, profile, reload: load };
};
