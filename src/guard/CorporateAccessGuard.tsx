import { useCallback, useEffect, useState } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { AUTH_DISABLED } from '@src/config/authBypass';
import CorporateAccessDenied from '@src/domains/failed/pages/CorporateAccessDenied';
import { useAppSelector } from '@src/hooks/store';
// import { paths } from '@src/routes/paths';
import { checkServiceAccessAndSubService } from '@utils/checkAccess';

import CorporateAccessLoadingSkeleton from './CorporateAccessLoadingSkeleton';

type CorporateAccessGuardProps = {
    children: React.ReactNode;
};

const whitelabeledRoutes = [
    'payments',
    'service not available',
    'plans',
    'profile',
    'peko club',
    'notifications',
    'early access',
    'service down',
    'peko credit',
    'procure',
    'more services',
    'session expired',
    'compliance',
    'tax more', // TODO: remove once admin enables "Tax More" service access
    // Interim: the Corporate Cards service has no backend accessKey yet, so it can't pass the
    // subscription check. Allow the route while the UI is in development; remove once the
    // backend ships the accessKey + subscription entitlement.
    'corporate cards',
];

// Corporate travel sub-routes not yet in backend services config — grant access if parent service is accessible
const whitelabeledCorpTravelSubRoutes = ['bus'];

export default function CorporateAccessGuard({ children }: CorporateAccessGuardProps) {
    const { roleName } = useAppSelector(state => state.reducer.auth);
    const { services } = useAppSelector(state => state.reducer.services);
    const location = useLocation();
    const currentPath = location.pathname.toLowerCase();

    const [grantAccess, setGrantAccess] = useState<boolean | null>(null);

    const serviceCategory =
        currentPath
            .split('/')[1]
            ?.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') || '';

    const subService =
        currentPath
            .split('/')[2]
            ?.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') || '';
    let hasAccess = false;

    if (whitelabeledRoutes.includes(serviceCategory.toLowerCase())) {
        hasAccess = true;
    } else if (
        serviceCategory.toLowerCase() === 'corporate travel' &&
        whitelabeledCorpTravelSubRoutes.includes(currentPath.split('/')[2] || '')
    ) {
        hasAccess = checkServiceAccessAndSubService(serviceCategory, '');
    } else {
        hasAccess = checkServiceAccessAndSubService(serviceCategory, subService);
    }

    const checkRole = useCallback(() => {
        // LOGIN DISABLED: without a real login, `services` never populates, so the
        // real `hasAccess` check below would always deny access. Flip `AUTH_DISABLED`
        // in `@src/config/authBypass` to `false` to restore the check.
        // if (hasAccess) {
        if (AUTH_DISABLED || hasAccess) {
            setGrantAccess(true);
        } else setGrantAccess(false);
    }, [hasAccess]);

    useEffect(() => {
        checkRole();
    }, [checkRole]);
    if (grantAccess === null) {
        return <CorporateAccessLoadingSkeleton />;
    }

    if (serviceCategory.toLowerCase() === 'dashboard' && grantAccess === false) {
        if (roleName === 'corporate sub user') {
            const firstRoute = services?.data.find(obj => obj.hasAccess === true);
            if (firstRoute?.label) {
                return <Navigate to={`/${firstRoute.label.toLowerCase().replace(/\s+/g, '-')}`} />;
            }
        }
    }
    if (grantAccess === false) {
        return <CorporateAccessDenied />;
    }
    if (grantAccess === null) {
        return null;
    }

    return <>{children}</>;
}
