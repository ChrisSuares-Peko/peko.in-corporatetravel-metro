import { useState } from 'react';

import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Progress, Typography, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import { getIn, useFormikContext } from 'formik';

import DocIcon from '@domains/dashboard/corporateCards/assets/icons/Doc.svg';

import { normalizeDocumentFormat } from '../../utils/helpers';

const { Text } = Typography;

const DEFAULT_ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const DEFAULT_MAX_SIZE_MB = 5;

interface DocumentUploadFieldProps {
    name: string;
    label: string;
    isRequired?: boolean;
    subLabel?: string;
    allowedFileTypes?: string[];
    maxFileSize?: number; // in KB
    onFileReady?: (file: { base64: string; format: string; name: string }) => void;
}

const DocumentUploadField = ({
    name,
    label,
    isRequired = false,
    subLabel,
    allowedFileTypes = DEFAULT_ALLOWED_TYPES,
    maxFileSize,
    onFileReady,
}: DocumentUploadFieldProps) => {
    const maxSizeMB = maxFileSize !== undefined ? maxFileSize / 1024 : DEFAULT_MAX_SIZE_MB;
    const { setFieldValue, setFieldError, setFieldTouched, values, touched, errors } = useFormikContext<any>();
    const [fileName, setFileName] = useState<string>('');

    const formatLabels = allowedFileTypes
        .map(t => t.split('/')[1].toUpperCase().replace('JPEG', 'JPG'))
        .filter((v, i, a) => a.indexOf(v) === i);
    const formatListText =
        formatLabels.length <= 2
            ? formatLabels.join(' or ')
            : `${formatLabels.slice(0, -1).join(', ')}, or ${formatLabels[formatLabels.length - 1]}`;
    const sizeHint = `${formatLabels.join(', ')} · Max ${maxSizeMB % 1 === 0 ? `${maxSizeMB} MB` : `${maxFileSize} KB`}`;

    const currentValue = getIn(values, name);
    const hasFile = !!currentValue;
    const isTouched = getIn(touched, name);
    const error = getIn(errors, name);

    const beforeUpload = (file: RcFile): boolean => {
        if (file.size === 0) {
            setFieldError(name, 'The selected file is empty. Please upload a valid file.');
            setFieldTouched(name, true, false);
            return false;
        }
        if (!allowedFileTypes.includes(file.type)) {
            setFieldError(name, `Invalid file format. Please upload a ${formatListText} file.`);
            setFieldTouched(name, true, false);
            return false;
        }
        if (file.size / 1024 / 1024 > maxSizeMB) {
            setFieldError(
                name,
                `File size must not exceed ${maxSizeMB % 1 === 0 ? `${maxSizeMB} MB` : `${maxFileSize} KB`}`
            );
            setFieldTouched(name, true, false);
            return false;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                const base64 = reader.result.split(',')[1];
                const format = normalizeDocumentFormat(file.type.split('/')[1], file.name);
                const fileData = { base64, format, name: file.name };
                setFieldValue(name, fileData);
                setFileName(file.name);
                onFileReady?.(fileData);
            }
        };
        reader.readAsDataURL(file);
        return false;
    };

    const handleRemove = () => {
        setFieldValue(name, null);
        setFileName('');
    };

    return (
        <Form.Item
            colon={false}
            required={isRequired}
            validateStatus={isTouched && error ? 'error' : ''}
            help={isTouched && error ? error : undefined}
            className="!mb-0"
        >
            <div
                style={{
                    border: `1.5px dashed ${isTouched && error ? '#FF4F4F' : '#CBD0DC'}`,
                    borderRadius: 16,
                    backgroundColor: '#fff',
                }}
                className="px-3 py-3 sm:px-5 sm:py-4"
            >
                <Flex align="center" gap={10} justify="space-between">
                    {/* Left: icon + label + subLabel */}
                    <Flex align="center" gap={10} className="min-w-0 flex-1">
                        <img
                            src={DocIcon}
                            alt="document"
                            style={{ width: 26, height: 26, flexShrink: 0, objectFit: 'contain' }}
                        />
                        {hasFile ? (
                            <Flex vertical className="min-w-0 flex-1" gap={4}>
                                <Text
                                    className="line-clamp-1 text-xs font-semibold text-textHeadings sm:text-sm"
                                    title={label}
                                >
                                    {label}
                                    {isRequired && <span className="ml-1 text-errorTextRed">*</span>}
                                </Text>
                                <Text
                                    className="truncate text-[10px] text-textGreyLight sm:text-xs"
                                    title={fileName || currentValue?.name || 'Document'}
                                >
                                    {fileName || currentValue?.name || 'Document'}
                                </Text>
                                <Progress
                                    percent={100}
                                    size="small"
                                    showInfo={false}
                                    strokeColor="#FF4F4F"
                                    trailColor="#cbd5e1"
                                    style={{ marginBottom: 0 }}
                                />
                            </Flex>
                        ) : (
                            <Flex vertical gap={1} className="min-w-0 flex-1">
                                <Text
                                    className="line-clamp-1 text-xs font-semibold text-textHeadings sm:text-sm"
                                    title={label}
                                >
                                    {label}
                                    {isRequired && <span className="ml-1 text-errorTextRed">*</span>}
                                </Text>
                                {subLabel && (
                                    <Text
                                        className="line-clamp-1 text-[10px] text-textGreyLight sm:text-xs"
                                        title={subLabel}
                                    >
                                        {subLabel}
                                    </Text>
                                )}
                                <Text
                                    className="line-clamp-1 text-[10px] text-textGreyLight sm:text-xs"
                                    title={sizeHint}
                                >
                                    {sizeHint}
                                </Text>
                            </Flex>
                        )}
                    </Flex>

                    {/* Right: upload or remove */}
                    {hasFile ? (
                        <CloseCircleOutlined
                            onClick={handleRemove}
                            style={{ fontSize: 18, color: '#52525b', cursor: 'pointer', flexShrink: 0 }}
                        />
                    ) : (
                        <Upload beforeUpload={beforeUpload} showUploadList={false} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
                            <Button
                                size="small"
                                className="!rounded-lg !border-slate-300 !text-[11px] !font-medium !text-zinc-600 sm:!rounded-xl sm:!text-sm"
                                style={{ flexShrink: 0 }}
                            >
                                Upload
                            </Button>
                        </Upload>
                    )}
                </Flex>
            </div>
        </Form.Item>
    );
};

export default DocumentUploadField;
