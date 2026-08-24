import React from 'react';

import { Col, Row } from 'antd';
import { Content } from 'antd/es/layout/layout';

import SalaryCompTable from '../organizationSettings/SalaryComponents/SalaryCompTable';

interface Props {
    setActiveTabKey: (key: any) => void;
}
const WelcomeSalaryComponents: React.FC<Props> = ({ setActiveTabKey }) => {
    const isWelcomePage = true;
    return (
        <Content>
            <Row>
                <Col xs={24} className="mt-5">
                    <SalaryCompTable
                        setActiveTabKey={setActiveTabKey}
                        isWelcomePage={isWelcomePage}
                    />
                </Col>
            </Row>
        </Content>
    );
};

export default WelcomeSalaryComponents;
