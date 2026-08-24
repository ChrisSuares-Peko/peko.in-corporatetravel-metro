import React from 'react';

import { Col, Typography, Flex } from 'antd';

import AdditionalInfoTab from './AdditionalInfoTab';
import EsimTab from './EsimTab';

type Props = {
    networks: string;
    countryName: string;
    esim: string;
};

const EsimDetailsAdditionalInfoList = ({ networks, countryName, esim }: Props) => (
    <Col className="mt-8" span={24}>
        <AdditionalInfoTab countryName={countryName} networks={networks} esim={esim} />
        <Flex vertical className="mt-10" gap={20}>
            <Typography.Text className="text-xl">Installation Guidelines:</Typography.Text>
            <EsimTab />
        </Flex>
    </Col>
);

export default EsimDetailsAdditionalInfoList;
