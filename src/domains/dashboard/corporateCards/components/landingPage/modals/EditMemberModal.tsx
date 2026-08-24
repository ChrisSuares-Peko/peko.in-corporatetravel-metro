import { Button, Form, Input, Modal, Select, Switch, Typography } from 'antd';

import { PEOPLE_COPY, ROLE_OPTIONS, TEAM_OPTIONS } from '../../../utils/peopleData';
import { Member } from '../../../utils/types';
import { MODAL_CLOSE_ICON, ROUNDED_MODAL_CLASSNAMES } from '../../common/modalProps';

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

interface EditMemberModalProps {
    open: boolean;
    member: Member | null;
    onClose: () => void;
}

interface EditMemberForm {
    role?: string;
    team?: string;
    makeLead: boolean;
    department?: string;
}

/** "Edit member" modal — update a member's role, team, lead status and department. */
const EditMemberModal = ({ open, member, onClose }: EditMemberModalProps) => {
    const [form] = Form.useForm<EditMemberForm>();

    return (
        <Modal
            open={open}
            onCancel={onClose}
            destroyOnHidden
            centered
            classNames={ROUNDED_MODAL_CLASSNAMES}
            closeIcon={MODAL_CLOSE_ICON}
            width={560}
            title={`Edit ${member?.name ?? 'member'}`}
            footer={
                <div className="flex justify-end gap-3">
                    <Button danger onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="primary" onClick={() => form.submit()}>
                        Save changes
                    </Button>
                </div>
            }
        >
            <Text className="mb-5 block text-sm text-textBody">
                Update this member&apos;s role, team, and department.
            </Text>

            <Form
                form={form}
                layout="vertical"
                initialValues={{ makeLead: false }}
                onFinish={onClose}
            >
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                    <Form.Item name="role" label="Role">
                        <Select placeholder="Select" options={ROLE_OPTIONS} />
                    </Form.Item>
                    <Form.Item name="team" label="Team">
                        <Select placeholder="Select" options={TEAM_OPTIONS} />
                    </Form.Item>
                </div>

                <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-borderCard p-4">
                    <div className="flex flex-col">
                        <Text className="text-sm font-medium text-textHeadings">Make team lead</Text>
                        <Text className="text-xs text-textGreyLight">
                            Replaces the current lead of this team.
                        </Text>
                    </div>
                    <Form.Item name="makeLead" valuePropName="checked" noStyle>
                        <Switch />
                    </Form.Item>
                </div>

                <Form.Item name="department" label="Department" rules={wsRules('Department')}>
                    <Input placeholder="Enter" />
                </Form.Item>
            </Form>

            <Text className="block text-xs text-textGreyLight">{PEOPLE_COPY.rolesNote}</Text>
        </Modal>
    );
};

export default EditMemberModal;
