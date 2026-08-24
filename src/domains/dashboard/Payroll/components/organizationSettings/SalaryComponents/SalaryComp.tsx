import React from 'react';

import { Col, Row } from 'antd';
import { Content } from 'antd/es/layout/layout';

import SalaryCompTable from './SalaryCompTable';

interface Props {
    setActiveTabKey: (key: any) => void;
}
const SalaryComp: React.FC<Props> = ({ setActiveTabKey }) => (
    <Content>
        <Row>
            <Col xs={24} className="mt-5">
                <SalaryCompTable />
            </Col>
        </Row>
    </Content>
);

export default SalaryComp;
