import { useState } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Form, Select, Skeleton, Tag, Typography } from 'antd';
import { Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

import TextAreaInput from '@components/atomic/inputs/TextAreaInput';
import { formattedDateOnly, formattedTime } from '@utils/dateFormat';

import { STATUS_COLORS, formatServiceName } from './GovtServicesApplications';
import useGovtServiceApplicationDetail from '../../hooks/useGovtServiceApplicationDetail';

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'In Review', value: 'IN_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Action Required', value: 'ACTION_REQUIRED' },
    { label: 'Re-upload', value: 'REUPLOAD' },
];

const statusSchema = Yup.object().shape({
    status: Yup.string().required('Please select a status'),
    remarks: Yup.string().when('status', {
        is: 'REUPLOAD',
        then: schema => schema.required('Please enter remarks for re-upload'),
        otherwise: schema => schema.nullable(),
    }),
});

const toDisplayString = (value: unknown): string | null | undefined => {
    if (value === null || value === undefined) return value as null | undefined;
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        if (typeof obj.url === 'string') return obj.url;
        if (typeof obj.name === 'string') return obj.name;
    }
    return String(value);
};

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <Flex justify="space-between" gap={16} className="py-1">
        <Text className="text-xs" style={{ color: '#8C8C8C', minWidth: 180 }}>{label}</Text>
        <Text className="text-xs font-medium text-right">{value || '-'}</Text>
    </Flex>
);

const GovtServiceApplicationDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoading, isUpdating, application, updateStatus } = useGovtServiceApplicationDetail(id!);
    const [selectedStatus, setSelectedStatus] = useState('');

    if (isLoading) return <Skeleton active className="p-6" paragraph={{ rows: 12 }} />;
    if (!application) return <Text>Application not found.</Text>;

    const formSteps = application.formData
        ? Object.entries(application.formData).filter(([, stepData]) => Object.keys(stepData).length > 0)
        : [];

    return (
        <Flex vertical gap={24} className="p-6">
            {/* Header */}
            <Flex align="center" gap={12}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    type="text"
                    onClick={() => navigate(-1)}
                />
                <Flex vertical gap={2}>
                    <Title level={4} className="!mb-0">
                        {formatServiceName(application.service)} — Application Detail
                    </Title>
                    <Text style={{ color: '#8C8C8C' }} className="text-sm">
                        {application.applicationNumber}
                    </Text>
                </Flex>
                <Tag color={STATUS_COLORS[application.status] ?? 'default'} className="ml-auto">
                    {application.status.replace(/_/g, ' ')}
                </Tag>
            </Flex>

            {/* Application Info */}
            <Flex
                vertical
                gap={4}
                className="p-5 rounded-xl"
                style={{ border: '1px solid #F0F0F0', backgroundColor: '#FFFFFF' }}
            >
                <Text strong className="text-sm mb-2">Application Information</Text>
                <Divider className="!my-2" />
                <InfoRow label="Application Number" value={application.applicationNumber} />
                <InfoRow label="Service" value={formatServiceName(application.service)} />
                <InfoRow label="Corporate Name" value={application.credential?.name} />
                <InfoRow label="Corporate ID" value={application.credential?.username} />
                <InfoRow
                    label="Applied On"
                    value={`${formattedDateOnly(new Date(application.createdAt))} ${formattedTime(new Date(application.createdAt))}`}
                />
                <InfoRow
                    label="Submitted At"
                    value={application.submittedAt ? formattedDateOnly(new Date(application.submittedAt)) : null}
                />
                <InfoRow
                    label="Completed At"
                    value={application.completedAt ? formattedDateOnly(new Date(application.completedAt)) : null}
                />
                {application.adminNotes && (
                    <InfoRow label="Admin Notes" value={application.adminNotes} />
                )}
            </Flex>

            {/* Form Data */}
            {formSteps.map(([stepKey, stepData]) => (
                <Flex
                    key={stepKey}
                    vertical
                    gap={4}
                    className="p-5 rounded-xl"
                    style={{ border: '1px solid #F0F0F0', backgroundColor: '#FFFFFF' }}
                >
                    <Text strong className="text-sm mb-2">
                        {stepKey.replace('step', 'Step ')} — Details
                    </Text>
                    <Divider className="!my-2" />
                    {Object.entries(stepData).map(([field, value]) => (
                        <InfoRow
                            key={field}
                            label={field
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, s => s.toUpperCase())}
                            value={toDisplayString(value)}
                        />
                    ))}
                </Flex>
            ))}

            {/* Update Status */}
            <Flex
                vertical
                gap={12}
                className="p-5 rounded-xl"
                style={{ border: '1px solid #F0F0F0', backgroundColor: '#FFFFFF' }}
            >
                <Text strong className="text-sm">Update Status</Text>
                <Divider className="!my-2" />
                <Formik
                    initialValues={{ status: application.status, remarks: '' }}
                    validationSchema={statusSchema}
                    onSubmit={async (values, { resetForm }) => {
                        const success = await updateStatus(
                            values.status,
                            values.status === 'REUPLOAD' ? values.remarks : undefined
                        );
                        if (success) resetForm({ values: { status: values.status, remarks: '' } });
                    }}
                    enableReinitialize
                >
                    {({ values, setFieldValue, handleSubmit }) => (
                        <Form layout="vertical" onFinish={handleSubmit}>
                            <Flex gap={16} align="flex-end" wrap="wrap">
                                <Form.Item label="Status" required className="!mb-0" style={{ minWidth: 220 }}>
                                    <Select
                                        value={values.status}
                                        options={STATUS_OPTIONS}
                                        onChange={val => {
                                            setFieldValue('status', val);
                                            setSelectedStatus(val);
                                            if (val !== 'REUPLOAD') setFieldValue('remarks', '');
                                        }}
                                        placeholder="Select status"
                                        style={{ width: 220 }}
                                    />
                                </Form.Item>

                                {(values.status === 'REUPLOAD' || selectedStatus === 'REUPLOAD') && (
                                    <div style={{ flex: 1, minWidth: 280 }}>
                                        <TextAreaInput
                                            name="remarks"
                                            label="Remarks"
                                            placeholder="Describe what needs to be re-uploaded (e.g. Please re-upload PAN Card)"
                                            isRequired
                                            minRows={2}
                                        />
                                    </div>
                                )}

                                <Form.Item className="!mb-0">
                                    <Button
                                        type="primary"
                                        danger
                                        loading={isUpdating}
                                        onClick={() => handleSubmit()}
                                    >
                                        Update Status
                                    </Button>
                                </Form.Item>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </Flex>
        </Flex>
    );
};

export default GovtServiceApplicationDetail;
