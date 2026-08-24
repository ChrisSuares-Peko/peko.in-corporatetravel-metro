import React from 'react';

import { UploadOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Typography } from 'antd';

const LicenseDetails = ({ item }: any) => {
    const capitalizeFirstLetter = (text: any): string => {
    if (typeof text === 'string') {
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    return text; 
};
    return (
        <Col xs={12} xl={6}>
            <Flex vertical gap={5} className='justify-between h-full'>
                {item?.isUpload ? (
                    <Button icon={<UploadOutlined />} type="default" size="small" className="w-32">
                        {capitalizeFirstLetter(item.value)}
                    </Button>
                ) : (
                    <Typography.Text className="text-base font-medium">
                        {capitalizeFirstLetter(item.value)}
                    </Typography.Text>
                )}
                <Typography.Text type="secondary" className="mt-1 text-xs">
                    {item.label}
                </Typography.Text>
            </Flex>
        </Col>
    );
};

export default LicenseDetails;
