import React from 'react';

import { Divider, Flex, Modal } from 'antd';
import { Content } from 'antd/es/layout/layout';

import FairRuleCollapse from './FairRuleCollapse';
import { FareRules } from '../types/fareRules';

// import FairRuleCollapse from './FairRuleCollapse';

interface modalProps {
    handleCancel: () => void;
    open: boolean;
    fareRulesData: FareRules[];
}
const FairRulesModal = ({ handleCancel, open, fareRulesData }: modalProps) => (
    <Modal
        title="Fare Rules and Baggage"
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={990}
        centered
    >
        <Divider />
        <Content className="sm:px-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Flex vertical gap={4} className="sm:mt-4">
                <FairRuleCollapse fareRulesData={fareRulesData} />
            </Flex>
        </Content>
    </Modal>
);

export default FairRulesModal;
