import { Button, Checkbox, Form, Input, Modal, Select, Typography } from 'antd';

import { TEAM_LEAD_OPTIONS, TEAM_ROSTER } from '../../../utils/peopleData';
import { MODAL_CLOSE_ICON, ROUNDED_MODAL_CLASSNAMES } from '../../common/modalProps';
import InitialsAvatar from '../InitialsAvatar';

const { Text } = Typography;

const wsRules = (label: string) => [
    {
        validator: (_: unknown, value: string) => {
            if (!value) return Promise.resolve();
            if (/^\s/.test(value)) return Promise.reject(new Error(`${label} cannot start with a space`));
            if (/\s{2,}/.test(value)) return Promise.reject(new Error(`${label} cannot contain consecutive spaces`));
            if (/^\s*$/.test(value)) return Promise.reject(new Error(`${label} cannot be only spaces`));
            return Promise.resolve();
        },
    },
];

interface CreateTeamModalProps {
    open: boolean;
    onClose: () => void;
}

interface CreateTeamForm {
    name: string;
    lead: string;
    description?: string;
    members: string[];
}

/** "Create a team" modal — names the team, assigns a lead, and selects members. */
const CreateTeamModal = ({ open, onClose }: CreateTeamModalProps) => {
    const [form] = Form.useForm<CreateTeamForm>();

    return (
        <Modal
            open={open}
            onCancel={onClose}
            destroyOnHidden
            centered
            classNames={ROUNDED_MODAL_CLASSNAMES}
            closeIcon={MODAL_CLOSE_ICON}
            width={560}
            title="Create a team"
            footer={
                <div className="flex justify-end gap-3">
                    <Button danger onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="primary" onClick={() => form.submit()}>
                        Create team
                    </Button>
                </div>
            }
        >
            <Text className="mb-5 block text-sm text-textBody">
                Group existing members together and assign a team lead.
            </Text>

            <Form form={form} layout="vertical" onFinish={onClose}>
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                    <Form.Item
                        name="name"
                        label="Team name"
                        rules={[{ required: true, message: 'Please enter the team name' }, ...wsRules('Team name')]}
                    >
                        <Input placeholder="Enter" />
                    </Form.Item>
                    <Form.Item
                        name="lead"
                        label="Team lead"
                        rules={[{ required: true, message: 'Please select the team lead' }]}
                    >
                        <Select placeholder="Select" options={TEAM_LEAD_OPTIONS} />
                    </Form.Item>
                </div>

                <Form.Item name="description" label="Description" rules={wsRules('Description')}>
                    <Input.TextArea rows={3} placeholder="Enter" />
                </Form.Item>

                <Form.Item name="members" label="Members">
                    <Checkbox.Group className="flex w-full flex-col gap-2">
                        {TEAM_ROSTER.map(member => (
                            <div
                                key={member.key}
                                className="flex items-center justify-between gap-3"
                            >
                                <Checkbox
                                    value={member.key}
                                    className="!ml-0 [&>span:last-child]:flex [&>span:last-child]:items-center [&>span:last-child]:gap-2.5"
                                >
                                    <InitialsAvatar
                                        name={member.name}
                                        tone="neutral"
                                        size={28}
                                    />
                                    <span className="text-sm text-textHeadings">
                                        {member.name}
                                    </span>
                                </Checkbox>
                                <span className="text-xs text-textGreyLight">{member.role}</span>
                            </div>
                        ))}
                    </Checkbox.Group>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateTeamModal;
