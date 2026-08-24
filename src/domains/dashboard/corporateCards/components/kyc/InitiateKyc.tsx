import { LockOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';

import RequirementRow from './RequirementRow';
import { KYC_INTRO, KYC_REQUIREMENTS } from '../../utils/kycData';

const { Title, Text } = Typography;

interface InitiateKycProps {
    onInitiate: () => void;
    loading?: boolean;
}

/** First-time KYC gate: explains the process and lists what to keep ready. */
const InitiateKyc = ({ onInitiate, loading }: InitiateKycProps) => (
        <Flex vertical>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-4 pt-1 xl:pb-8 xl:pt-2">
            {/* Header */}
            <div className="flex flex-col items-center gap-4 text-center">
                <span className="rounded-full bg-bgLightPink px-4 py-1.5 text-sm text-textLightRed">
                    {KYC_INTRO.badge}
                </span>
                <Title level={3} className="!mb-0 !text-textHeadings">
                    {KYC_INTRO.title}
                </Title>
                <Text className="text-base text-textBody">{KYC_INTRO.description}</Text>
            </div>

            {/* Checklist card */}
            <div className="flex flex-col gap-6 rounded-3xl border border-borderGray bg-white p-6 xl:p-9">
                <Text className="text-lg font-medium text-textHeadings">
                    {KYC_INTRO.checklistTitle}
                </Text>
                <div className="flex flex-col gap-4">
                    {KYC_REQUIREMENTS.map(item => (
                        <RequirementRow key={item.key} item={item} />
                    ))}
                </div>
            </div>

            {/* CTA + security note */}
            <div className="flex flex-col items-center gap-4">
                {/* TEMPORARY role selector — commented out; defaults to Cardholder */}
                {/* <div className="flex flex-col items-center gap-2">
                    <Text className="text-xs uppercase tracking-wide text-textGreyLight">
                        Continue as (temporary)
                    </Text>
                    <Segmented
                        value={role}
                        onChange={value => setRole(value as CorporateCardRole)}
                        options={[
                            { label: 'Admin', value: 'admin' },
                            { label: 'Cardholder', value: 'user' },
                        ]}
                        style={{ borderRadius: 9999, padding: '4px' }}
                        className="[&_.ant-segmented-item]:!rounded-full [&_.ant-segmented-thumb]:!rounded-full [&_.ant-segmented-item-selected]:!rounded-full [&_.ant-segmented-item-selected]:!text-textLightRed [&_.ant-segmented-item:not(.ant-segmented-item-selected):hover]:!bg-transparent"
                    />
                </div> */}
                <Button
                    type="primary"
                    block
                    loading={loading}
                    onClick={onInitiate}
                    className="!h-14 text-base font-medium"
                >
                    {KYC_INTRO.ctaLabel}
                </Button>
                <span className="flex items-center gap-1.5 text-xs text-textBody">
                    <LockOutlined />
                    {KYC_INTRO.securityNote}
                </span>
            </div>
        </div>
        </Flex>
);

export default InitiateKyc;
