// useRootPath hook
import { UserRole } from '@customtypes/general';
import { useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

export const useRootPath = () => {
    const { role } = useAppSelector(state => state.reducer.auth);

    switch (role) {
        case UserRole.CORPORATE:
            return paths.dashboard.home;
        case UserRole.SYSTEM:
            return paths.systemUser.dashboard;
        case UserRole.EMPLOYEE:
            return paths.employee.home;
        default:
            return '/auth/login';
    }
};
