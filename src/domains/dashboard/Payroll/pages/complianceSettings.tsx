import React, { useEffect, useState } from 'react';

import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import EPF from '../components/complianceSettings/EPF';
import ESI from '../components/complianceSettings/ESI';
import LabWelfareFund from '../components/complianceSettings/LabWelfareFund';
import ProfessionalTax from '../components/complianceSettings/ProfessionalTax';
import TDS from '../components/complianceSettings/Tds';
import { useGetComplianceSettingsApi } from '../hooks/complianceSettings/useGetComplianceSettingsApi';

const ComplianceSettings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTabKey, setActiveTabKey] = useState('1');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isEditingProfessionalTax, setIsEditingProfessionalTax] = useState(false);
    const { complianceData, settingsId } = useGetComplianceSettingsApi();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const subTab = queryParams.get('subTab');
        if (subTab) {
            setActiveTabKey(subTab);
        } else {
            // Ensure default EPF tab is active and URL stays in sync
            queryParams.set('subTab', '1');
            navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });
        }
    }, [location.pathname, location.search, navigate]); // Only run when navigating to this page

    const onChange = (key: string) => {
        setActiveTabKey(key);
    };
   
    const items = [
        {
            key: '1',
            label: 'EPF',
            children: (
                <EPF
                    setActiveTabKey={setActiveTabKey}
                    settingsId={settingsId}
                    complianceData={complianceData}
                />
            ),
        },
        {
            key: '2',
            label: 'ESI',
            children: <ESI settingsId={settingsId} complianceData={complianceData} />,
        },
        {
            key: '3',
            label: 'Professional Tax',
            // children: isEditingProfessionalTax ? (
            //     <AddProfessionalTax />
            // ) : (
            //     <ProfessionalTax
            //         onEdit={() => setIsEditingProfessionalTax(true)}
            //         complianceData={complianceData}
            //         settingsId={settingsId}
            //     /> // Passing the edit handler
            // ),
            //    children: professionalTaxContent,
            children: (
                <ProfessionalTax
                    onEdit={() => setIsEditingProfessionalTax(true)}
                    complianceData={complianceData}
                    settingsId={settingsId}
                />
            ), // Passing the edit handler
        },
        {
            key: '4',
            label: 'Labour Welfare Fund',
            children: <LabWelfareFund data={complianceData?.laborWelfareFund} />,
        },
        {
            key: '5',
            label: 'TDS',
            children: <TDS complianceData={complianceData} />,
        },
    ];

    return <Tabs className="" activeKey={activeTabKey} items={items} onChange={onChange} />;
};

export default ComplianceSettings;
