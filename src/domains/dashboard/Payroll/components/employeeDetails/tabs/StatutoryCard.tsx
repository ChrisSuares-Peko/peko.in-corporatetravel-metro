import React from 'react';

import { Typography, Switch, Row, Col, Flex, Badge } from 'antd';

const { Title, Text } = Typography;

type FieldSection = Record<string, string>;

type StatutoryCardProps = {
    title: string;
    fields: FieldSection[];
    isActive?: boolean;
    onToggle?: (title: string, currentStatus: boolean) => void;
    switchLoading?: boolean; // new prop for switch loading
};

const StatutoryCard: React.FC<StatutoryCardProps> = ({
    title,
    fields,
    isActive,
    onToggle,
    switchLoading = false,
}) => (
    <Flex vertical className="bg-[#FCFCFC] border rounded-md p-4 min-h-64">
        <Flex justify="space-between">
            <Flex justify="space-between" className="w-full">
                <Flex gap={15}>
                    <Title level={4} style={{ margin: 0 }}>
                        {title}
                    </Title>
                    <Badge
                        status={isActive === true ? 'success' : 'error'}
                        text={isActive === true ? 'Active' : 'Inactive'}
                        style={{
                            color: isActive === false ? '#FF4D4F' : '#27AE60',
                        }}
                    />
                </Flex>
                <Flex>
                    <Switch
                        checked={isActive}
                        onChange={() => onToggle?.(title, !isActive)}
                        loading={switchLoading}
                    />
                </Flex>
            </Flex>
        </Flex>

        <Row style={{ marginTop: 16 }} gutter={[0, 16]}>
            {fields.map((section, index) => (
                <Col span={12} key={index}>
                    {Object.entries(section).map(([label, value]) => (
                        <div key={label} style={{ marginBottom: 8 }}>
                            <Text strong>{label}</Text>
                            <br />
                            <Text>{value}</Text>
                        </div>
                    ))}
                </Col>
            ))}
        </Row>
    </Flex>
);

export default StatutoryCard;
