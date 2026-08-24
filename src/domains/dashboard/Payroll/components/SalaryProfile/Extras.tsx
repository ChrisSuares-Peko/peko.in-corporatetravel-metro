import React from 'react';

import { Flex } from 'antd';

import Bonus from './Bonus';
import Incentives from './Incentives';
import Overtime from './Overtime';

const Extras = () => (
    <Flex vertical gap={40}>
        <Incentives />
        <Overtime />
        <Bonus />
    </Flex>
);

export default Extras;
