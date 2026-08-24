import React from 'react';

import { Col, Row } from 'antd';
import { Content } from 'antd/es/layout/layout';

import DeductionCompTable from '../organizationSettings/DeductionComponents/DeductionCompTable';

interface Props {
    setActiveTabKey: (key: any) => void;
}

const WelcomeDeductionCompents: React.FC<Props> = ({ setActiveTabKey }) => {
    const isWelcomePage = true;
    return (
        <Content>
            <Row>
                <Col xs={24} className="mt-5 ">
                    <DeductionCompTable
                        setActiveTabKey={setActiveTabKey}
                        isWelcomePage={isWelcomePage}
                    />
                </Col>
            </Row>
        </Content>
    );
};

export default WelcomeDeductionCompents;
