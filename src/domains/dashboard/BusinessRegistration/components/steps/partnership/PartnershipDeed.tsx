import { DownloadOutlined, ExclamationCircleOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Button, Checkbox, Typography } from 'antd';
import { useField } from 'formik';

const { Title, Paragraph, Text } = Typography;

// Step 3 of the Partnership registration form (Figma 1835:24101). The deed is
// generated from a standard template (read-only). RM sidebar comes from the shell.
// TODO: render the real deed/preview + wire Download once the template API exists.
const PartnershipDeed = () => {
    const [confirm, , confirmHelpers] = useField('partnershipDeedConfirmed');

    return (
        <div className="flex flex-col gap-4">
            <div>
                <Title level={3} className="!text-[24px] !font-semibold !text-[#1e293b] !mb-1 !leading-[32px]">
                    Partnership Deed
                </Title>
                <Paragraph className="!mb-0 text-[16px] text-[#6a7282] !leading-[24px]">
                    Standard partnership deed with profit-sharing
                </Paragraph>
            </div>

            <div className="border border-[#e4e4e7] rounded-[24px] p-4 sm:p-6 flex flex-col gap-4">
                <div>
                    <Text className="!block !text-[18px] !font-semibold !text-[#1e293b] !mb-1">
                        Partnership Deed
                    </Text>
                    <Text className="!text-[13px] !text-[#6a7282] !leading-[20px]">
                        We prepare your Partnership Deed from the standard, registrar-compliant
                        template. This document is read-only.
                    </Text>
                </div>

                <div className="bg-[#fffbeb] flex gap-2 items-start px-3 py-[10px] rounded-[8px]">
                    <ExclamationCircleOutlined className="text-[#f59e0b] mt-[2px]" style={{ fontSize: 16 }} />
                    <Text className="!text-[13px] !text-[rgba(0,0,0,0.85)] !leading-[20px]">
                        The deed automatically embeds the profit-sharing ratios entered for each
                        partner in the KYC step.
                    </Text>
                </div>

                {/* Read-only template preview */}
                <div className="border border-[#e4e4e7] rounded-[16px] overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <FilePdfOutlined className="text-[#ff4f4f]" style={{ fontSize: 18 }} />
                            <Text className="!text-[15px] !font-semibold !text-[#1e293b]">
                                Memorandum of Association (MOA)
                            </Text>
                        </div>
                        <Button type="text" icon={<DownloadOutlined />} className="!text-[13px] !text-[#ff4f4f]">
                            Download
                        </Button>
                    </div>
                    <div className="h-px w-full bg-[#ebebeb]" />
                    <div className="p-4 flex flex-col gap-2 text-[13px] text-[#475569] leading-[20px]">
                        <Text className="!text-[14px] !font-semibold !text-[#1e293b]">
                            Memorandum of Association
                        </Text>
                        <p>
                            The name of the company is{' '}
                            <span className="font-semibold text-[#1e293b]">
                                ACME TECHNOLOGIES PRIVATE LIMITED
                            </span>
                            .
                        </p>
                        <p>
                            The registered office of the company will be situated in the State of{' '}
                            <span className="font-semibold text-[#1e293b]">Karnataka</span>.
                        </p>
                        <p>
                            <span className="font-semibold text-[#1e293b]">Objects:</span> To carry on
                            the business of software development, customisation and IT-enabled
                            services.
                        </p>
                        <p>
                            <span className="font-semibold text-[#1e293b]">Liability</span> of the
                            members is limited.{' '}
                            <span className="font-semibold text-[#1e293b]">Authorised capital:</span>{' '}
                            ₹10,00,000 divided into 1,00,000 shares of ₹10 each.
                        </p>
                    </div>
                </div>

                <div className="bg-[#f8f8f8] rounded-[8px] px-4 py-3">
                    <Checkbox
                        checked={Boolean(confirm.value)}
                        onChange={e => confirmHelpers.setValue(e.target.checked)}
                    >
                        <span className="text-[13px] text-[#1e293b] leading-[20px]">
                            I confirm the standard Partnership Deed is appropriate for my firm
                        </span>
                    </Checkbox>
                </div>
            </div>
        </div>
    );
};

export default PartnershipDeed;
