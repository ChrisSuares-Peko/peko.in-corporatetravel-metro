import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { Formik } from 'formik';
import * as Yup from 'yup';

import LockIcon from '../../../assets/icons/lock.svg';
import { KYB_DOCUMENTS, KYB_UPLOAD } from '../../../utils/kybData';
import { KybFileValue } from '../../../utils/types';
import DocumentUploadField from '../../common/FileUploadInput';

const { Title, Text } = Typography;

interface UploadDocumentsKybProps {
    onBack: () => void;
    onSubmit: (values: Record<string, KybFileValue | null>) => void | Promise<void>;
    submitLoading?: boolean;
}

const initialValues: Record<string, KybFileValue | null> = Object.fromEntries(
    KYB_DOCUMENTS.map(d => [`doc_${d.key}`, null])
);

const validationSchema = Yup.object(
    Object.fromEntries(
        KYB_DOCUMENTS.map(d => [
            `doc_${d.key}`,
            Yup.mixed().nullable().required(`Please upload the ${d.label}.`),
        ])
    )
);

const UploadDocumentsKyb = ({ onBack, onSubmit, submitLoading }: UploadDocumentsKybProps) => (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ handleSubmit }) => (
            <div className="mx-auto flex w-full max-w-[62rem] flex-col gap-5 pb-4 pt-1 sm:gap-8 xl:pb-8 xl:pt-2">
                {/* Header */}
                <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
                    <span className="rounded-full bg-bgLightPink px-3 py-1 text-xs text-textLightRed sm:px-4 sm:py-1.5 sm:text-sm">
                        {KYB_UPLOAD.badge}
                    </span>
                    <Title level={3} className="!mb-0 !text-xl !text-textHeadings sm:!text-2xl">
                        {KYB_UPLOAD.title}
                    </Title>
                    {/* px-16 was unconditional: 128px of side padding left the description ~200px of a
                        360px screen. Applied from sm up only, matching InitiateKyb's px-4 sm:px-12. */}
                    <Text className="text-sm text-textBody sm:px-16 sm:text-base">
                        {KYB_UPLOAD.description}
                    </Text>
                </div>

                {/* Upload section */}
                <div className="flex flex-col gap-4 rounded-2xl border border-borderGray bg-white p-4 sm:rounded-3xl sm:p-6 xl:p-9">
                    <div className="flex flex-col gap-1">
                        <Text className="text-base font-medium text-textHeadings sm:text-lg">
                            {KYB_UPLOAD.sectionTitle}
                        </Text>
                        <Text className="text-xs text-textBody sm:text-sm">
                            {KYB_UPLOAD.sectionSubtitle}
                        </Text>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                        {KYB_DOCUMENTS.map(doc => (
                            <DocumentUploadField
                                key={doc.key}
                                name={`doc_${doc.key}`}
                                label={doc.label}
                                subLabel={doc.uploadLabel}
                                isRequired
                                maxFileSize={10 * 1024}
                                allowedFileTypes={['image/jpeg', 'image/png', 'application/pdf']}
                            />
                        ))}
                    </div>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
                    <InfoCircleOutlined className="mt-0.5 text-amber-500" />
                    <Text className="whitespace-pre-line text-xs text-amber-500 sm:text-sm">{KYB_UPLOAD.infoNote}</Text>
                </div>

                {/* Buttons */}
                <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <Button danger onClick={onBack} className="!h-11 !px-6 font-medium sm:!h-12">
                        {KYB_UPLOAD.backLabel}
                    </Button>
                    <div className="flex flex-col gap-2">
                        <Button
                            type="primary"
                            loading={submitLoading}
                            onClick={() => handleSubmit()}
                            className="!h-11 !w-full !px-6 font-medium sm:!h-12"
                        >
                            {KYB_UPLOAD.submitLabel}
                        </Button>
                        <span className="flex items-center justify-center gap-1.5 text-[11px] text-textBody">
                            <img src={LockIcon} alt="" className="h-3 w-3" />
                            {KYB_UPLOAD.securityNote}
                        </span>
                    </div>
                </div>
            </div>
        )}
    </Formik>
);

export default UploadDocumentsKyb;
