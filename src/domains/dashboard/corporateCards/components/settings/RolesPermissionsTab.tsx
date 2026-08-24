import { useState } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Form, Input, Modal, Row, Select, Space, Switch, Typography } from 'antd';

import { cn } from '../../utils/cn';
// import { ROUNDED_MODAL_CLASSNAMES } from '../common/modalProps';

const { Text, Title } = Typography;

const ROLES = [
    { key: 'admin', label: 'Admin', permissions: 16 },
    { key: 'accountant', label: 'Accountant', permissions: 11 },
    { key: 'manager', label: 'Manager', permissions: 14 },
    { key: 'developer', label: 'Developer', permissions: 9 },
    { key: 'support', label: 'Support', permissions: 7 },
];

const PERMISSION_GROUPS = [
    {
        category: 'General',
        items: [{ key: 'view-dashboard', label: 'View dashboard' }],
    },
    {
        category: 'Members',
        items: [
            { key: 'invite-remove', label: 'Invite & remove members' },
            { key: 'assign-roles', label: 'Assign roles to members' },
            { key: 'create-teams', label: 'Create & edit teams' },
        ],
    },
    {
        category: 'Cards',
        items: [
            { key: 'issue-cards', label: 'Issue new cards' },
            { key: 'freeze-cards', label: 'Freeze / unfreeze cards' },
            { key: 'set-limits', label: 'Set card spend limits' },
        ],
    },
    {
        category: 'Approvals',
        items: [
            { key: 'approve-txn', label: 'Approve card transactions' },
            { key: 'approve-reimb', label: 'Approve reimbursements' },
            { key: 'approve-vendor', label: 'Approve vendor invoices' },
            { key: 'approve-card-req', label: 'Approve card issuance requests' },
            { key: 'approve-topup', label: 'Approve card top-up requests' },
        ],
    },
    {
        category: 'Wallet',
        items: [
            { key: 'view-wallet', label: 'View wallet & balances' },
            { key: 'topup-wallet', label: 'Top up wallet' },
        ],
    },
    {
        category: 'Accounting',
        items: [
            { key: 'view-accounting', label: 'View accounting report' },
            { key: 'export-accounting', label: 'Map & export to accounting software' },
        ],
    },
    {
        category: 'Audit',
        items: [{ key: 'view-audit', label: 'View audit logs (read-only)' }],
    },
];

const START_FROM_OPTIONS = ROLES.map(r => ({ label: r.label, value: r.key }));

const RolesPermissionsTab = () => {
    const [activeRole, setActiveRole] = useState('admin');
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleCreate = () => {
        form.resetFields();
        setModalOpen(false);
    };

    return (
        <>
        <Row gutter={[24, 24]} align="top">
            {/* Left: role list */}
            <Col xs={24} lg={8}>
            <Card
                className="rounded-2xl border-borderCard"
                styles={{ body: { padding: 24 } }}
            >
                <Flex justify="space-between" align="center" className="mb-5">
                    <Title level={5} className="!mb-0 !text-textHeadings">
                        Roles
                    </Title>
                    <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => setModalOpen(true)}
                        className="!font-semibold !text-textLightRed"
                    >
                        Add New
                    </Button>
                </Flex>
                <Space direction="vertical" size={12} className="w-full">
                    {ROLES.map(role => {
                        const isActive = activeRole === role.key;
                        return (
                            <Button
                                key={role.key}
                                type="text"
                                block
                                onClick={() => setActiveRole(role.key)}
                                className={cn(
                                    '!h-auto !rounded-2xl !px-4 !py-3 !text-left',
                                    isActive ? '!border !border-bgLightPink !bg-bgLightPink' : ''
                                )}
                            >
                                <Flex justify="space-between" align="center" className="w-full">
                                    <Text
                                        className={cn(
                                            'text-sm font-bold',
                                            isActive ? '!text-textLightRed' : '!text-textHeadings'
                                        )}
                                    >
                                        {role.label}
                                    </Text>
                                    <Text
                                        className={cn(
                                            'text-sm',
                                            isActive
                                                ? '!text-textLightRed'
                                                : '!text-textGreyLight'
                                        )}
                                    >
                                        {role.permissions} permissions
                                    </Text>
                                </Flex>
                            </Button>
                        );
                    })}
                </Space>
            </Card>
            </Col>

            {/* Right: permissions panel */}
            <Col xs={24} lg={16}>
            <Card className="rounded-2xl border-borderCard" styles={{ body: { padding: 24 } }}>
                <Flex justify="flex-end" className="mb-6">
                    <Button type="primary" className="font-medium">
                        Save changes
                    </Button>
                </Flex>
                <Space direction="vertical" size={24} className="w-full">
                    {PERMISSION_GROUPS.map(group => (
                        <Space key={group.category} direction="vertical" size={8} className="w-full">
                            <Text className="block text-xs font-semibold uppercase tracking-wide text-textGreyLight">
                                {group.category}
                            </Text>
                            <Space direction="vertical" size={8} className="w-full">
                                {group.items.map(item => (
                                    <Card
                                        key={item.key}
                                        className="rounded-xl border-borderCard"
                                        styles={{ body: { padding: '12px 16px' } }}
                                    >
                                        <Flex justify="space-between" align="center">
                                            <Text className="text-sm text-textBody">
                                                {item.label}
                                            </Text>
                                            <Switch
                                                defaultChecked
                                                className="ml-4 shrink-0 [&.ant-switch-checked]:!bg-brandColor"
                                            />
                                        </Flex>
                                    </Card>
                                ))}
                            </Space>
                        </Space>
                    ))}
                </Space>
            </Card>
            </Col>
        </Row>

            {/* Create custom role modal */}
            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                centered
                destroyOnHidden
                className="[&_.ant-modal-content]:rounded-2xl"
                styles={{ content: { padding: '32px' }, header: { marginBottom: '20px' } }}
                title={
                    <Title level={5} className="!mb-0 !text-textHeadings">
                        Create custom role
                    </Title>
                }
                footer={
                    <Flex gap={12}>
                        <Button
                            onClick={() => setModalOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => form.submit()}
                            className="flex-1"
                        >
                            Create role
                        </Button>
                    </Flex>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                    onFinish={handleCreate}
                >
                    <Form.Item name="roleName" label="Role name">
                        <Select placeholder="Select" options={[]} />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea placeholder="Note" rows={3} />
                    </Form.Item>
                    <Form.Item name="startFrom" label="Start from" className="!mb-0">
                        <Select placeholder="Select" options={START_FROM_OPTIONS} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default RolesPermissionsTab;
