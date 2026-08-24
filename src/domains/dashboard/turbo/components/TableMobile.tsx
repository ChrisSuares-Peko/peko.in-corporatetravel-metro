/* eslint-disable no-unsafe-optional-chaining */
import React, { useState } from 'react';

import { RightOutlined } from '@ant-design/icons';
import { Badge, Col, Divider, Flex, Row, Typography } from 'antd';
import { Content } from 'antd/es/layout/layout';

import { formattedDateTime } from '@utils/dateFormat';

import DriverAssignedCell from './DriverAssignedCell';

interface DetailProps {
    label: string;
    value: React.ReactNode;
}

const DetailSection: React.FC<DetailProps> = ({ label, value }) => (
    <Flex justify="space-between" className="w-full">
        <Typography.Text className="text-xs">{label} :</Typography.Text>
        <div className="text-xs">{value}</div>
    </Flex>
);

interface TableProp {
    transaction: any;
    drivers: any[];
    handleDriverChange: (driverId: string, vehicleId: string) => void;
}

const TableMobile: React.FC<TableProp> = ({ transaction, drivers, handleDriverChange }) => {
    const { vehicleNumber, rcStatus, fuelType, createdAt, pucValidUpto } = transaction;

    const [showMore, setShowMore] = useState<boolean>(false);

    const statusStyles = {
        ACTIVE: {
            text: '#16a34a',
            background: '#d1fae5',
        },
        INACTIVE: {
            text: '#d97b7b',
            background: '#ffc2c2',
        },
    };

    function findColorByStatus(state: string) {
        let value = statusStyles.ACTIVE;
        if (state === 'ACTIVE' || state === 'INACTIVE') {
            value = statusStyles[state];
        }
        return value;
    }

    const details = [
        { label: 'Date', value: formattedDateTime(new Date(createdAt)) },
        { label: 'Fuel Type', value: fuelType ? fuelType.charAt(0).toUpperCase() + fuelType.slice(1).toLowerCase() : 'N/A', },
        {
            label: 'PUC',
            value: (() => {
                const todays = new Date();
                const expiryDate = new Date(pucValidUpto);
                const diffTime = expiryDate.getTime() - todays.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let statusText = '';
                let badgeStatus: 'default' | 'processing' | 'success' | 'warning' | 'error' = 'success';
                let style = {
                    color: '#3f8600',
                    backgroundColor: '#f6ffed',
                    padding: '2px 7px',
                    borderRadius: '15px',
                };

                if (diffDays < 0) {
                    statusText = 'Expired';
                    badgeStatus = 'error';
                    style = {
                        color: '#cf1322',
                        backgroundColor: '#fff1f0',
                        padding: '2px 7px',
                        borderRadius: '15px',
                    };
                } else if (diffDays <= 15) {
                    statusText = 'Expires Soon';
                    badgeStatus = 'warning';
                    style = {
                        color: '#C89C00',
                        backgroundColor: '#fef9c3',
                        padding: '2px 7px',
                        borderRadius: '15px',
                    };
                } else {
                    statusText = expiryDate.toLocaleDateString('en-IN');
                }

                return (
                    <Badge
                        status={badgeStatus}
                        text={statusText}
                        className="px-2 rounded-2xl"
                        style={style}
                    />
                );
            })(),
        },

        {
            label: 'Driver Assigned',
            value: (
                <DriverAssignedCell
                    record={transaction}
                    drivers={drivers}
                    onAssign={handleDriverChange}
                    size="small"
                    className="w-32 text-xs"
                />
            ),
        },
    ];

    return (
        <Content className="p-5 rounded-md">
            <Flex gap={20} vertical>
                <Row gutter={[20, 20]} align="middle">
                    <Col xs={9}>
                        <Flex justify="start">
                            <Typography.Text className="text-xs">{vehicleNumber}</Typography.Text>
                        </Flex>
                    </Col>

                    <Col xs={10}>
                        <Flex justify="center">
                            <Badge
                                status={rcStatus?.toLowerCase() !== 'active' ? 'error' : 'success'}
                                text={
                                    rcStatus?.charAt(0).toUpperCase() +
                                    rcStatus?.slice(1).toLowerCase()
                                }
                                className="px-2 rounded-2xl"
                                style={{
                                    color: findColorByStatus(rcStatus).text,
                                    backgroundColor: findColorByStatus(rcStatus).background,
                                    padding: '2px 7px',
                                    borderRadius: '15px',
                                }}
                            />
                        </Flex>
                    </Col>

                    <Col xs={4}>
                        <Flex justify="center">
                            <RightOutlined
                                onClick={() => setShowMore(!showMore)}
                                className={`collapse-icon ${showMore ? 'open' : ''}`}
                            />
                        </Flex>
                    </Col>
                </Row>

                {showMore && (
                    <Flex vertical gap={10} className="bg-bgLightGray p-6">
                        {details.map((detail, index) => (
                            <DetailSection key={index} {...detail} />
                        ))}
                    </Flex>
                )}

                <Divider className="border border-solid" />
            </Flex>
        </Content>
    );
};

export default TableMobile;
