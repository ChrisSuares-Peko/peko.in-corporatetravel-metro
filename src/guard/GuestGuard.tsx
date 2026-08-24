import { useCallback, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';
import { useRootPath } from '@src/hooks/useRootPath';

type GuestGuardProps = {
    children: React.ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
    const navigate = useNavigate();
    const rootPath = useRootPath();

    const { isAuthenticated } = useAppSelector(state => state.reducer.auth);
    const check = useCallback(() => {
        if (isAuthenticated) {
            navigate(rootPath, { replace: true });
        }
    }, [isAuthenticated, navigate, rootPath]);

    useEffect(() => {
        check();
    }, [check]);

    return <>{children}</>;
}
