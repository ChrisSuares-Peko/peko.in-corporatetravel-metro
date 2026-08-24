import { Checkbox, Typography } from 'antd';
import { useFormikContext } from 'formik';

import StandardLlpAgreement from './StandardLlpAgreement';
import { LLP_AGREEMENT_CONFIRM_TEXT } from '../../../utils/llp';
import FileUploadField from '../../FileUploadField';

const { Title, Paragraph, Text } = Typography;

const OPTIONS = [
    { value: 'standard', title: 'Standard LLP Agreement', subtitle: 'Auto-generated' },
    { value: 'custom', title: 'Custom LLP Agreement', subtitle: 'Upload your own agreement' },
];

// Step 4 of the LLP registration form (Figma 1854:39775 / 1866:41520).
const LlpAgreement = () => {
    const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();
    const agreement = (values.llpAgreement as { type?: string; confirmed?: boolean }) || {};
    const mode = agreement.type || 'standard';

    return (
        <div className="flex flex-col gap-4">
            <div>
                <Title level={3} className="!text-[24px] !font-semibold !text-[#1e293b] !mb-1 !leading-[32px]">
                    LLP Agreement
                </Title>
                <Paragraph className="!mb-0 text-[16px] text-[#6a7282] !leading-[24px]">
                    Standard LLP agreement
                </Paragraph>
            </div>

            <div className="border border-[#e4e4e7] rounded-[24px] p-4 sm:p-6 flex flex-col gap-6">
                <div>
                    <Text className="!block !text-[18px] !font-semibold !text-[#1e293b]">
                        LLP Agreement Template
                    </Text>
                    <Text className="!text-[13px] !text-[#6a7282]">
                        The LLP Agreement is a mandatory document that defines the mutual rights and
                        duties of partners.
                    </Text>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    {OPTIONS.map(option => {
                        const selected = mode === option.value;
                        return (
                            <button
                                type="button"
                                key={option.value}
                                onClick={() => setFieldValue('llpAgreement.type', option.value)}
                                className={`flex-1 flex items-start gap-3 border rounded-[12px] px-4 py-4 text-left transition-colors ${
                                    selected ? 'border-[#ff4f4f] bg-[#fff7f8]' : 'border-[#e4e4e7]'
                                }`}
                            >
                                <span className={`mt-[2px] w-[18px] h-[18px] rounded-full border flex items-center justify-center flex-shrink-0 ${selected ? 'border-[#ff4f4f]' : 'border-[#cbd5e1]'}`}>
                                    {selected && <span className="w-[10px] h-[10px] rounded-full bg-[#ff4f4f]" />}
                                </span>
                                <span>
                                    <span className="block text-[14px] font-medium text-[#1e293b]">
                                        {option.title}
                                    </span>
                                    <span className="block text-[12px] text-[#6a7282]">
                                        {option.subtitle}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                {mode === 'standard' ? (
                    <StandardLlpAgreement />
                ) : (
                    <FileUploadField name="llpAgreement.document" label="Upload LLP Agreement" />
                )}

                <div className="bg-[#f8f8f8] rounded-[8px] px-4 py-3">
                    <Checkbox
                        checked={Boolean(agreement.confirmed)}
                        onChange={e => setFieldValue('llpAgreement.confirmed', e.target.checked)}
                    >
                        <span className="text-[13px] text-[#1e293b] leading-[20px]">
                            {LLP_AGREEMENT_CONFIRM_TEXT}
                        </span>
                    </Checkbox>
                </div>
            </div>
        </div>
    );
};

export default LlpAgreement;
