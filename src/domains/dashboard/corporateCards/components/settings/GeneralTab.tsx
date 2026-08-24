import { Card, Col, Flex, Form, Input, List, Row, Switch, Typography } from 'antd';

const { Text, Title } = Typography;

const NOTIFICATION_CONTROLS = [
    { key: 'receipts', label: 'Require receipts on transactions over ₹5,000' },
    { key: 'auto-decline', label: 'Auto-decline cards over their monthly limit' },
    { key: 'kyc-notify', label: 'Notify admins of pending KYC after 48 hours' },
    { key: 'digest', label: 'Send weekly spend digest by email' },
];

const GeneralTab = () => (
    <Row gutter={[24, 24]}>
        {/* Company */}
        <Col xs={24} lg={12}>
            <Card className="rounded-2xl border-borderCard" styles={{ body: { padding: 24 } }}>
                <Flex vertical gap={4} className="mb-5">
                    <Title level={5} className="!mb-0 !text-textHeadings">
                        Company
                    </Title>
                    <Text className="text-xs text-textBody">
                        Information shown on cards and statements.
                    </Text>
                </Flex>
                <Form layout="vertical">
                    <Form.Item label="Company name" className="!mb-4">
                        <Input placeholder="Enter" />
                    </Form.Item>
                    <Form.Item label="Billing email" className="!mb-0">
                        <Input placeholder="Enter" />
                    </Form.Item>
                </Form>
            </Card>
        </Col>

        {/* Notifications & controls */}
        <Col xs={24} lg={12}>
            <Card className="rounded-2xl border-borderCard" styles={{ body: { padding: 24 } }}>
                <Title level={5} className="!mb-5 !text-textHeadings">
                    Notifications &amp; controls
                </Title>
                <List
                    itemLayout="horizontal"
                    dataSource={NOTIFICATION_CONTROLS}
                    renderItem={n => (
                        <List.Item key={n.key}>
                            <Flex justify="space-between" align="center" className="w-full">
                                <Text className="text-sm text-textBody">{n.label}</Text>
                                <Switch
                                    defaultChecked
                                    className="ml-4 shrink-0 [&.ant-switch-checked]:!bg-brandColor"
                                />
                            </Flex>
                        </List.Item>
                    )}
                />
            </Card>
        </Col>
    </Row>
);

export default GeneralTab;
