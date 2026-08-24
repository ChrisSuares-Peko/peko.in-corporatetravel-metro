import { InfoCircleOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';

import DocumentIcon from '../../../assets/icons/document.svg';
import { KYB_DOCUMENTS, KYB_INTRO } from '../../../utils/kybData';

const { Title, Text } = Typography;

interface InitiateKybProps {
    onInitiate: () => void;
}

const InitiateKyb = ({ onInitiate }: InitiateKybProps) => (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-4 pt-1 sm:gap-8 xl:pb-8 xl:pt-2">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
            <span className="rounded-full bg-bgLightPink px-3 py-1 text-xs text-textLightRed sm:px-4 sm:py-1.5 sm:text-sm">
                {KYB_INTRO.badge}
            </span>
            <Title level={3} className="!mb-0 !text-xl !text-textHeadings sm:!text-2xl">
                {KYB_INTRO.title}
            </Title>
            <Text className="text-sm text-textBody sm:px-12 sm:text-base">
                {KYB_INTRO.description}
            </Text>
        </div>

        {/* Document checklist */}
        <div className="flex flex-col gap-4 rounded-2xl border border-borderGray bg-white p-4 sm:gap-5 sm:rounded-3xl sm:p-6 xl:p-9">
            <Text className="text-base font-medium text-textHeadings sm:text-lg">
                {KYB_INTRO.checklistTitle}
            </Text>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                {KYB_DOCUMENTS.map(doc => (
                    <div
                        key={doc.key}
                        className="flex items-center gap-3 rounded-xl border border-borderGray bg-white px-3 py-3 sm:rounded-2xl sm:px-5 sm:py-3.5"
                    >
                        <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 sm:size-11">
                            <img
                                src={DocumentIcon}
                                alt=""
                                className="block size-4 object-contain sm:size-5"
                            />
                        </div>
                        <Text className="flex-1 text-xs font-medium text-textHeadings sm:text-sm">
                            {doc.label}
                        </Text>
                    </div>
                ))}
            </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            <InfoCircleOutlined className="mt-0.5 text-amber-500" />
            <Text className="whitespace-pre-line text-xs text-amber-500 sm:text-sm">{KYB_INTRO.infoNote}</Text>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Button
                type="primary"
                block
                onClick={onInitiate}
                className="!h-12 text-sm font-medium sm:!h-14 sm:text-base"
            >
                {KYB_INTRO.ctaLabel}
            </Button>
            <span className="flex items-center gap-1.5 text-xs text-textBody">
                <LockOutlined />
                {KYB_INTRO.securityNote}
            </span>
        </div>
    </div>
);

export default InitiateKyb;
