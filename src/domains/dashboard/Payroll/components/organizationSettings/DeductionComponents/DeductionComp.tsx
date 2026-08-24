import React from 'react';

import { Col, Row } from 'antd';
import { Content } from 'antd/es/layout/layout';

import DeductionCompTable from './DeductionCompTable';

interface Props {
    setActiveTabKey: (key: any) => void;
}

const DeductionComp: React.FC<Props> = ({ setActiveTabKey }) => (
    <Content>
        <Row>
            <Col xs={24} className="mt-5">
                <DeductionCompTable />
            </Col>
        </Row>
    </Content>
);

export default DeductionComp;
