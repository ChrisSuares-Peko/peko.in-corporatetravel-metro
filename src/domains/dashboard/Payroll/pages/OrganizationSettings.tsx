import React, { useEffect, useState } from 'react';

import { Tabs, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';

import ComplianceSettings from './complianceSettings';
import LeavePolicyTable from '../components/LeaveSettings/LeavePolicyTable';
import BankDetails from '../components/organizationSettings/BankDetails/BankDetails';
import DeductionComp from '../components/organizationSettings/DeductionComponents/DeductionComp';
import EssSettings from '../components/organizationSettings/EssSettings';
import PayrollCycleDetails from '../components/organizationSettings/PayrollCycleDetails';
import PayrollSettingsForm from '../components/organizationSettings/PayrollSettingsForm';
import SalaryComp from '../components/organizationSettings/SalaryComponents/SalaryComp';
import SubscriptionSettings from '../components/organizationSettings/SubscriptionSettings';

const OrganizationSettings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const { user } = useAppSelector(state => state.reducer.user);
    const isFreelancer = user?.accountType === 'freelancer';

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const activeTab = queryParams.get('activeTab');

        if (activeTab) {
            // Subscription Settings (tab 8) is hidden for freelancers; avoid an empty active tab.
            setActiveTabKey(isFreelancer && activeTab === '8' ? '1' : activeTab);
        }
    }, [location, isFreelancer]);

    const onChange = (key: string) => {
        setActiveTabKey(key);
        navigate(`?activeTab=${key}`);
    };

    const items = [
        {
            key: '1',
            label: 'Company Profile',
            children: <PayrollSettingsForm setActiveTabKey={setActiveTabKey} />,
        },
        {
            key: '2',
            label: 'Payroll Cycle',
            children: <PayrollCycleDetails setActiveTabKey={setActiveTabKey} />,
        },
        {
            key: '3',
            label: 'Salary Components',
            children: <SalaryComp setActiveTabKey={setActiveTabKey} />,
        },
        {
            key: '4',
            label: 'Deductions',
            children: <DeductionComp setActiveTabKey={setActiveTabKey} />,
        },
        {
            key: '5',
            label: 'Leave Policies',
            children: <LeavePolicyTable />,
            disabled: false,
        },
        {
            key: '6',
            label: 'Bank Details',
            children: <BankDetails setActiveTabKey={setActiveTabKey} />,
        },
        {
            key: '7',
            label: 'Compliance Settings',
            children: <ComplianceSettings />,
        },
        {
            key: '8',
            label: 'Subscription Settings',
            children: <SubscriptionSettings />,
        },
        {
            key: '9',
            label: 'ESS Settings',
            children: <EssSettings />,
        },
    ];

    // Freelancers are on a fixed free plan and cannot upgrade — hide the Subscription Settings tab.
    const visibleItems = isFreelancer ? items.filter(item => item.key !== '8') : items;

    return (
        <>
            <Typography.Text className="font-normal text-lg sm:text-2xl">
                Payroll Settings
            </Typography.Text>
            <Tabs className="mt-6" activeKey={activeTabKey} items={visibleItems} onChange={onChange} />
        </>
    );
};

export default OrganizationSettings;
