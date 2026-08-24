import { useState } from 'react';

import { Button, Collapse, Drawer, Flex, Form, Select, Skeleton, Tag, Typography } from 'antd';
import { Formik } from 'formik';
import * as Yup from 'yup';

import TextAreaInput from '@components/atomic/inputs/TextAreaInput';
import DocumentUploadField from '@src/domains/dashboard/GovernmentServices/components/DocumentUploadField';
import { formattedDateOnly, formattedTime } from '@utils/dateFormat';

// eslint-disable-next-line import/no-cycle
import { STATUS_COLORS, formatServiceName } from './GovtServicesApplications';
import useGovtServiceApplicationDetail from '../../hooks/useGovtServiceApplicationDetail';

const { Text } = Typography;

const STATUS_OPTIONS = [
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'In Review', value: 'IN_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Re-upload', value: 'REUPLOAD' },
];

const statusSchema = Yup.object().shape({
    status: Yup.string().required('Please select a status'),
    remarks: Yup.string().when('status', {
        is: 'REUPLOAD',
        then: schema => schema.required('Please enter remarks for re-upload'),
        otherwise: schema => schema.nullable(),
    }),
    document: Yup.object().nullable().when('status', {
        is: 'APPROVED',
        then: schema => schema.required('Please upload the approved document'),
        otherwise: schema => schema.nullable(),
    }),
});

const isUrl = (val: unknown): val is string =>
    typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'));

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

const InfoRow = ({
    label,
    value,
    onDownload,
}: {
    label: string;
    value?: string | null;
    onDownload?: (url: string) => void;
}) => (
    <Flex justify="space-between" gap={16} className="py-1">
        <Text className="text-xs" style={{ color: '#8C8C8C', minWidth: 160 }}>{label}</Text>
        {value && isUrl(value) ? (
            <Button type="link" size="small" className="p-0 text-xs h-auto" onClick={() => onDownload?.(value)}>
                Download
            </Button>
        ) : (
            <Text className="text-xs font-medium text-right">{value || '-'}</Text>
        )}
    </Flex>
);

interface Props {
    id: number | string;
    open: boolean;
    onClose: () => void;
    onStatusUpdated?: () => void;
}

const GovtServiceApplicationDrawer = ({ id, open, onClose, onStatusUpdated }: Props) => {
    const { isLoading, isUpdating, application, updateStatus, downloadDocument } = useGovtServiceApplicationDetail(id);
    const [selectedStatus, setSelectedStatus] = useState('');

    const formSteps = application?.formData
        ? Object.entries(application.formData).filter(([key, stepData]) => key !== 'eligibility' && Object.keys(stepData).length > 0)
        : [];

    const eligibilityData = application?.formData?.eligibility as Record<string, string> | undefined;

    const items = application
        ? [
              {
                  key: 'info',
                  label: 'Application Information',
                  children: (
                      <>
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
                              value={
                                  application.submittedAt
                                      ? formattedDateOnly(new Date(application.submittedAt))
                                      : null
                              }
                          />
                          <InfoRow
                              label="Completed At"
                              value={
                                  application.completedAt
                                      ? formattedDateOnly(new Date(application.completedAt))
                                      : null
                              }
                          />
                          {application.adminNotes && (
                              <InfoRow label="Admin Notes" value={application.adminNotes} />
                          )}
                      </>
                  ),
              },
              ...(eligibilityData && Object.keys(eligibilityData).length > 0
                  ? [{
                        key: 'eligibility',
                        label: 'Eligibility',
                        children: (
                            <>
                                {Object.entries(eligibilityData).map(([question, answer]) => (
                                    <Flex key={question} justify="space-between" gap={16} className="py-1">
                                        <Text className="text-xs" style={{ color: '#8C8C8C', minWidth: 160 }}>{question}</Text>
                                        <Tag color={answer === 'yes' ? 'green' : 'red'} style={{ margin: 0 }}>
                                            {answer === 'yes' ? 'Yes' : 'No'}
                                        </Tag>
                                    </Flex>
                                ))}
                            </>
                        ),
                    }]
                  : []),
              ...formSteps.map(([stepKey, stepData], index) => ({
                  key: stepKey,
                  label: `Step ${index + 1}`,
                  children: (
                      <>
                          {Object.entries(stepData).map(([field, value]) => (
                              <InfoRow
                                  key={field}
                                  label={field
                                      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
                                      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
                                      .replace(/^./, s => s.toUpperCase())}
                                  value={toDisplayString(value)}
                                  onDownload={downloadDocument}
                              />
                          ))}
                      </>
                  ),
              })),
              {
                  key: 'status',
                  label: 'Update Status',
                  children: application.status === 'APPROVED' ? (
                      <Flex align="center" gap={8}>
                          <Text className="text-xs" style={{ color: '#8C8C8C' }}>Current Status:</Text>
                          <Tag color="green">Approved</Tag>
                      </Flex>
                  ) : (
                      <Formik
                          initialValues={{ status: application.status, remarks: application.status === 'REUPLOAD' ? (application.remarks ?? '') : '', document: null as { base64: string; format: string; name: string } | null }}
                          validationSchema={statusSchema}
                          onSubmit={async (values) => {
                              const success = await updateStatus(
                                  values.status,
                                  values.status === 'REUPLOAD' ? values.remarks : undefined,
                                  values.status === 'APPROVED' ? values.document?.base64 : undefined,
                                  values.status === 'APPROVED' ? values.document?.format : undefined,
                              );
                              if (success) {
                                  onClose();
                                  onStatusUpdated?.();
                              }
                          }}
                          enableReinitialize
                      >
                          {({ values, setFieldValue, handleSubmit }) => (
                              <Form layout="vertical" onFinish={handleSubmit}>
                                  <Form.Item label="Status" required>
                                      <Select
                                          value={values.status}
                                          options={STATUS_OPTIONS}
                                          onChange={val => {
                                              setFieldValue('status', val);
                                              setSelectedStatus(val);
                                              if (val !== 'REUPLOAD') setFieldValue('remarks', '');
                                              if (val !== 'APPROVED') {
                                                  setFieldValue('document', null);
                                              }
                                          }}
                                          placeholder="Select status"
                                          className="w-full"
                                      />
                                  </Form.Item>

                                  {(values.status === 'REUPLOAD' || selectedStatus === 'REUPLOAD') && (
                                      <TextAreaInput
                                          name="remarks"
                                          label="Remarks"
                                          placeholder="Describe what needs to be re-uploaded (e.g. Please re-upload PAN Card)"
                                          isRequired
                                          minRows={3}
                                      />
                                  )}

                                  {values.status === 'APPROVED' && (
                                      <DocumentUploadField
                                          name="document"
                                          label="Upload Approved Document"
                                          isRequired
                                      />
                                  )}

                                  <Button
                                      type="primary"
                                      danger
                                      block
                                      loading={isUpdating}
                                      onClick={() => handleSubmit()}
                                      className="mt-2"
                                  >
                                      Update Status
                                  </Button>
                              </Form>
                          )}
                      </Formik>
                  ),
              },

          ]
        : [];

    return (
        <Drawer
            title={application ? `Application — ${application.applicationNumber}` : 'Application Detail'}
            open={open}
            onClose={onClose}
            width={800}
            styles={{ body: { padding: '12px 16px' } }}
            extra={
                application && (
                    <Tag color={STATUS_COLORS[application.status] ?? 'default'}>
                        {application.status.replace(/_/g, ' ')}
                    </Tag>
                )
            }
        >
            {isLoading && <Skeleton active paragraph={{ rows: 12 }} />}
            {!isLoading && !application && <Text>Application not found.</Text>}
            {!isLoading && application && (
                <Collapse
                    items={items}
                    defaultActiveKey={['timeline', 'status']}
                    className="w-full"
                />
            )}
        </Drawer>
    );
};

export default GovtServiceApplicationDrawer;
