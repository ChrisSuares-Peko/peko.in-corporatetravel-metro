import React from 'react';

import { Col, Row, Skeleton } from 'antd';
import { useLocation } from 'react-router-dom';

import StatutoryCard from './tabs/StatutoryCard';
import useEmployeeStatutoryDetails from '../../hooks/employeeProfileHooks/useEmployeeStatutoryDetails';

const StatutoryTab = () => {
    const location = useLocation();
    const { employeeId } = location.state;

    const { statutoryData, updateEmployeeStatutoryData, buttonLoader, isLoading } =
        useEmployeeStatutoryDetails(employeeId);

    const handleToggle = async (title: string, newStatus: boolean) => {
        const keyMap: Record<string, string> = {
            EPF: 'enableEPF',
            ESI: 'enableESI',
            'Labor Welfare Fund': 'laborWelfareFund',
            'Professional Tax': 'professionalTax',
        };
        const configKey = keyMap[title];
        if (configKey) {
            await updateEmployeeStatutoryData(configKey, newStatus, title);
        }
    };

    if (isLoading) {
        return <Skeleton active paragraph={{ rows: 5 }} />;
    }

    return (
        <Row gutter={[20, 15]}>
            {Array.isArray(statutoryData) &&
                statutoryData.map((card, index) => (
                    <Col key={index} md={10}>
                        <StatutoryCard
                            {...card}
                            onToggle={handleToggle}
                            switchLoading={buttonLoader[card.title] || false}
                        />
                    </Col>
                ))}
        </Row>
    );
};

export default StatutoryTab;
