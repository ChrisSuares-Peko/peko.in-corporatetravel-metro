import { ReactNode } from 'react';

import { CheckCircleFilled } from '@ant-design/icons';
import { Button, Spin, Typography } from 'antd';

import { PVT_PAYMENT_INCLUDES, PVT_PAYMENT_NOTES } from '../utils/data';

const { Text, Paragraph } = Typography;

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

interface LineItem {
    label: string;
    amount: number;
}

interface PrivateLimitedPaymentCardProps {
    lineItems: LineItem[];
    total: number;
    loading: boolean;
    onBack: () => void;
    onPay: () => void;
    // "What's included" list + "Please note" paragraph — sourced from the catalog
    // (about / description); each falls back to the static copy when absent.
    includes?: string[];
    description?: string;
    // Wallet/gateway selector rendered above the actions (central payment flow).
    methodSelector?: ReactNode;
    payDisabled?: boolean;
    payLoading?: boolean;
}

// Private Limited payment layout: GST-based breakdown + "What's included" +
// "Please note", all inside one card with the actions at the bottom.
const PrivateLimitedPaymentCard = ({
    lineItems,
    total,
    loading,
    onBack,
    onPay,
    includes,
    description,
    methodSelector,
    payDisabled,
    payLoading,
}: PrivateLimitedPaymentCardProps) => {
    const includeItems = includes?.length ? includes : PVT_PAYMENT_INCLUDES;
    return (
    <div className="bg-white border-[0.5px] border-[rgba(204,204,204,0.8)] rounded-[28px] p-6 sm:p-8 flex flex-col gap-6">
        <div>
            <Text className="!block !text-[20px] !font-semibold !text-[#27272e] !leading-[1.2]">
                Payment Breakdown
            </Text>
            <Text className="!text-[15px] !text-[#425466]">
                Incorporation fees for the selected structure.
            </Text>
        </div>

        <Spin spinning={loading}>
            <div className="border-[0.5px] border-[rgba(204,204,204,0.8)] rounded-[16px] p-5 flex flex-col gap-4">
                {lineItems.map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                        <Text className="!text-[16px] !text-[#4a5565]">{item.label}</Text>
                        <Text className="!text-[16px] !text-[#101828]">{formatINR(item.amount)}</Text>
                    </div>
                ))}
                <div className="flex items-center justify-between">
                    <Text className="!text-[20px] !font-semibold !text-[#101828]">Total Amount</Text>
                    <Text className="!text-[20px] !font-semibold !text-[#101828]">
                        {formatINR(total)}
                    </Text>
                </div>
            </div>
        </Spin>

        <div className="border-[0.5px] border-[rgba(204,204,204,0.8)] rounded-[16px] p-5 flex flex-col gap-3">
            <Text className="!text-[16px] !font-semibold !text-[#1e293b]">What&apos;s included</Text>
            {includeItems.map(item => (
                <div key={item} className="flex items-start gap-2">
                    <CheckCircleFilled style={{ fontSize: 16, color: '#22c55e', marginTop: 3 }} />
                    <Text className="!text-[14px] !text-[#475569]">{item}</Text>
                </div>
            ))}
        </div>

        <div className="bg-[#faf8f7] rounded-[16px] p-5 flex flex-col gap-2">
            <Text className="!text-[15px] !font-semibold !text-[#1e293b]">Please note</Text>
            {description ? (
                <Paragraph className="!mb-0 !text-[13px] !text-[#6a7282] !leading-[20px]">
                    {description}
                </Paragraph>
            ) : (
                <ul className="list-disc pl-4 flex flex-col gap-2">
                    {PVT_PAYMENT_NOTES.map(note => (
                        <li key={note} className="text-[13px] text-[#6a7282] leading-[20px]">
                            {note}
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {methodSelector}

        <div className="flex items-center justify-end gap-4">
            <Button
                onClick={onBack}
                className="!h-[44px] !px-6 !text-[16px] !rounded-[8px] !border-[#e4e4e7] !text-[#1e293b] hover:!bg-[#f8f8f8] transition-colors"
            >
                Back
            </Button>
            <Button
                type="primary"
                onClick={onPay}
                disabled={payDisabled}
                loading={payLoading}
                className="!h-[44px] !px-6 !text-[16px] !font-medium !rounded-[8px] !bg-[#ff4f4f] hover:!bg-[#e64444] transition-colors"
            >
                Pay {formatINR(total)} &amp; Place Order
            </Button>
        </div>
    </div>
    );
};

export default PrivateLimitedPaymentCard;
