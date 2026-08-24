import { ArrowRightOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Input, Row, Typography, Upload } from 'antd';

import { getEntityOnboardingFields, OnboardingField } from './entityDocuments';

interface Props {
    entityType: string;
    files: Record<string, File>;
    textValues: Record<string, string>;
    onFile: (name: string, file: File | null) => void;
    onText: (name: string, value: string) => void;
    onBack: () => void;
    onSubmit: () => void;
    submitting?: boolean;
}

const labelNode = (field: OnboardingField) => (
    <Flex vertical gap={2} className="mb-1">
        <Typography.Text className="text-[13px] font-medium text-[#344054]">
            {field.label} {field.required && <span className="text-[#FF4D4F]">*</span>}
        </Typography.Text>
        {field.hint && (
            <Typography.Text className="text-[11px] leading-4 text-[#98A2B3]">{field.hint}</Typography.Text>
        )}
    </Flex>
);

// Step 3 — Documents Upload. Fields render dynamically per selected entity type.
const NupayDocumentsStep = ({
    entityType,
    files,
    textValues,
    onFile,
    onText,
    onBack,
    onSubmit,
    submitting,
}: Props) => {
    const fields = getEntityOnboardingFields(entityType);

    return (
        <Flex vertical gap={20} className="mt-2">
            <Row gutter={[24, 18]}>
                {fields.map(field => (
                    <Col xs={24} lg={12} key={field.name}>
                        {labelNode(field)}
                        {field.type === 'text' ? (
                            <Input
                                placeholder={`Enter ${field.label}`}
                                value={textValues[field.name] || ''}
                                onChange={e => onText(field.name, e.target.value)}
                                className="!h-11 !rounded-lg"
                            />
                        ) : (
                            <Flex align="center" gap={10} className="rounded-lg border border-[#D0D5DD] px-3 py-1.5">
                                <Typography.Text className="flex-1 truncate text-[13px] text-[#667085]">
                                    {files[field.name]?.name || 'Upload File'}
                                </Typography.Text>
                                <Upload
                                    maxCount={1}
                                    showUploadList={false}
                                    beforeUpload={file => {
                                        onFile(field.name, file as File);
                                        return false;
                                    }}
                                >
                                    <Button size="small" icon={<PaperClipOutlined />} className="!rounded-md">
                                        Browse File
                                    </Button>
                                </Upload>
                            </Flex>
                        )}
                    </Col>
                ))}
            </Row>

            <Flex justify="end" gap={12} className="mt-2">
                <Button onClick={onBack} className="!h-10 !rounded-lg !border-[#FF4D4F] !px-6 !text-[#FF4D4F]">
                    Back
                </Button>
                <Button
                    type="primary"
                    loading={submitting}
                    onClick={onSubmit}
                    className="!h-10 !rounded-lg !border-0 !bg-[#FF4D4F] !px-6 font-semibold"
                >
                    Activate Now <ArrowRightOutlined />
                </Button>
            </Flex>
        </Flex>
    );
};

export default NupayDocumentsStep;
