import React from 'react';

import { Card, Col, Flex, Typography } from 'antd';

interface PassengerProps {
    passenger: any;
    index: number;
}

const GuestCard = ({ passenger, index }: PassengerProps) => (
    <Col key={index} xs={24} sm={24} md={12}>
        <Card bordered style={{ background: '#F0F0F0' }}>
            <Flex>
                <Typography.Text>{`Guest ${index + 1}`}</Typography.Text>
            </Flex>
            <Flex justify="space-between" className="mt-2">
                <Flex vertical gap={7}>
                    <Typography.Text className="text-textGreyColor xs:text-xs md:text-sm">
                        FullName{' '}
                    </Typography.Text>
                    <Typography.Text strong className="line-clamp-1 xs:text-xs md:text-sm">
                        {passenger.FirstName} {passenger.LastName}
                    </Typography.Text>
                    {/* <Typography.Text className="text-textGreyColor xs:text-xs md:text-sm mt-2">
                        Date of Birth{' '}
                    </Typography.Text>
                    <Typography.Text strong className="xs:line-clamp-1 xs:text-xs md:text-sm">
                        {passenger.dob || 'N/A'}
                    </Typography.Text> */}
                </Flex>
                <Flex vertical gap={5}>
                    {/* <Typography.Text className="text-textGreyColor xs:text-xs md:text-sm">
                        Mobile Number{' '}
                    </Typography.Text>
                    <Typography.Text strong className="xs:text-xs md:text-sm">
                        {passenger.Phoneno || 'N/A'}
                    </Typography.Text> */}
                    <Typography.Text className="text-textGreyColor xs:text-xs md:text-sm mt-2">
                        Date of Birth{' '}
                    </Typography.Text>
                    <Typography.Text strong className="xs:line-clamp-1 xs:text-xs md:text-sm">
                        {passenger.dob || 'N/A'}
                    </Typography.Text>
                    {/* <Typography.Text className="text-textGreyColor xs:text-xs mt-3 md:text-sm">
                        Email ID{' '}
                    </Typography.Text>
                    <Typography.Text strong className="line-clamp-1 xs:text-xs md:text-sm">
                        {passenger.Email || 'N/A'}
                    </Typography.Text> */}
                </Flex>
            </Flex>
        </Card>
    </Col>
);

export default GuestCard;
