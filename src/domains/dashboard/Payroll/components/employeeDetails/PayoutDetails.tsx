import React from 'react';

import { Flex } from 'antd';

import Bonus from '../SalaryProfile/Bonus';
import Incentives from '../SalaryProfile/Incentives';
import Overtime from '../SalaryProfile/Overtime';

const PayoutDetails = () => (
    <Flex vertical gap={40}>
        <Incentives />
        <Overtime />
        <Bonus />
    </Flex>
);

export default PayoutDetails;
