import { Flex, Spin } from 'antd';
import { Navigate } from 'react-router-dom';

import { paths } from '@src/routes/paths';

import Dashboard from './Dashboard';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';

// Entry point for the ESS portal: onboarding gate, then the employee dashboard.
const EmployeeHome = () => {
    const { loading, isComplete } = useOnboardingStatus();

    if (loading) {
        return (
            <Flex align="center" justify="center" className="py-24">
                <Spin size="large" />
            </Flex>
        );
    }

    if (!isComplete) {
        return <Navigate to={paths.employee.onboarding} replace />;
    }

    return <Dashboard />;
};

export default EmployeeHome;
