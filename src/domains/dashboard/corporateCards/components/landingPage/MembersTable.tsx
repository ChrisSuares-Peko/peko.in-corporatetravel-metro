import { DeleteOutlined, EditOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/lib/table';

import GenericTable from '@components/atomic/GenericTable';

import InitialsAvatar from './InitialsAvatar';
import { Member } from '../../utils/types';
import StatusTag from '../common/StatusTag';

const { Text } = Typography;

interface MembersTableProps {
    members: Member[];
    isLoading?: boolean;
    onEdit: (member: Member) => void;
    onRemove: (member: Member) => void;
    onResendInvite: (member: Member) => void;
    resendingKey?: string | null;
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
}

/** Small neutral pill used for the role and the "Lead" marker. */
const NeutralPill = ({ children }: { children: string }) => (
    <span className="inline-flex items-center rounded-full bg-listBg px-3 py-1 text-xs font-medium text-textHeadings">
        {children}
    </span>
);

const buildColumns = (
    onEdit: MembersTableProps['onEdit'],
    onRemove: MembersTableProps['onRemove'],
    onResendInvite: MembersTableProps['onResendInvite'],
    resendingKey: MembersTableProps['resendingKey']
): ColumnsType<Member> => [
    {
        key: 'member',
        title: 'Member',
        dataIndex: 'name',
        width: 240,
        render: (_: string, row: Member) => (
            <div className="flex items-center gap-3">
                <InitialsAvatar name={row.name} />
                <div className="flex flex-col">
                    <Text className="text-sm font-semibold text-textHeadings">{row.name}</Text>
                    <Text className="text-xs text-textGreyLight">{row.email}</Text>
                </div>
            </div>
        ),
    },
    {
        key: 'role',
        title: 'Role',
        dataIndex: 'role',
        width: 150,
        render: (role: string) => <NeutralPill>{role}</NeutralPill>,
    },
    {
        key: 'kycStatus',
        title: 'KYC status',
        dataIndex: 'kycStatus',
        width: 150,
        render: (kycStatus: Member['kycStatus']) => <StatusTag status={kycStatus} />,
    },
    {
        key: 'cards',
        title: 'Cards',
        dataIndex: 'cards',
        width: 90,
        render: (cards: number) => <Text className="text-sm text-textHeadings">{cards}</Text>,
    },
    {
        key: 'accountStatus',
        title: 'Account status',
        dataIndex: 'accountStatus',
        width: 140,
        render: (accountStatus: Member['accountStatus']) => <StatusTag status={accountStatus} />,
    },
    {
        key: 'joined',
        title: 'Joined',
        dataIndex: 'joined',
        width: 130,
        render: (joined: string) => <Text className="text-sm text-textBody">{joined}</Text>,
    },
    {
        key: 'actions',
        title: 'Actions',
        dataIndex: 'key',
        align: 'center',
        width: 130,
        render: (_: string, row: Member) => (
            <div className="flex flex-nowrap items-center justify-center gap-1 [&_.ant-btn]:shrink-0">
                {row.inviteStatus === 'PENDING' && (
                    <Tooltip title="Resend invitation">
                        <Button
                            type="text"
                            size="small"
                            aria-label={`Resend invitation to ${row.name}`}
                            icon={<SendOutlined className="text-textBody" />}
                            loading={resendingKey === row.key}
                            onClick={() => onResendInvite(row)}
                        />
                    </Tooltip>
                )}
                <Tooltip title="Edit member">
                    <Button
                        type="text"
                        size="small"
                        aria-label={`Edit ${row.name}`}
                        icon={<EditOutlined className="text-textBody" />}
                        onClick={() => onEdit(row)}
                    />
                </Tooltip>
                <Tooltip title="Remove member">
                    <Button
                        type="text"
                        size="small"
                        danger
                        aria-label={`Remove ${row.name}`}
                        icon={<DeleteOutlined />}
                        onClick={() => onRemove(row)}
                    />
                </Tooltip>
            </div>
        ),
    },
];

/** Admin "People → Members" table. Server-side paginated via the `pagination` prop. */
const MembersTable = ({
    members,
    isLoading,
    onEdit,
    onRemove,
    onResendInvite,
    resendingKey,
    page,
    pageSize,
    total,
    onPageChange,
}: MembersTableProps) => (
    <GenericTable
        columns={buildColumns(onEdit, onRemove, onResendInvite, resendingKey)}
        dataSource={members}
        rowKey="key"
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        pagination={{
            current: page,
            pageSize,
            total,
            onChange: onPageChange,
            showSizeChanger: false,
        }}
    />
);

export default MembersTable;
