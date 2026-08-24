import { useEffect, useState } from 'react';

import { DownloadOutlined, EyeOutlined, FileTextOutlined, FileSearchOutlined } from '@ant-design/icons';
import { Flex, Spin, Tag, Typography } from 'antd';
import { useLocation, useParams } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';

import {
    getCorporateDocumentFileForAdmin,
    getCorporateDocumentsForAdmin,
} from '../../api/corporateDocuments';
import { CorporateDocumentKey, CorporateDocumentsMap } from '../../types/corporateDocuments';

// Matches corporateCard controllers/corporate/corporateDocuments.js documentNames exactly — this is
// the corporate-cards KYB document set, a distinct list from the general company KYB elsewhere.
const DOCUMENT_LABELS: Record<CorporateDocumentKey, string> = {
    Corporate_Agreement: 'Corporate Agreement',
    MOA: 'MoA (Memorandum of Association)',
    AOA: 'AoA (Articles of Association)',
    GST_Certificate: 'GST Certificate',
    Signing_Authority_Pan_Card: 'Signing Authority PAN Card',
    Signing_Authority_Aadhaar_Card: 'Signing Authority Masked Aadhaar Card',
    Company_Pan: 'Company PAN',
    Certificate_Of_Incorporation: 'Certificate of Incorporation',
};

const DOCUMENT_ORDER: CorporateDocumentKey[] = [
    'Corporate_Agreement',
    'MOA',
    'AOA',
    'GST_Certificate',
    'Signing_Authority_Pan_Card',
    'Signing_Authority_Aadhaar_Card',
    'Company_Pan',
    'Certificate_Of_Incorporation',
];

const MIME_TYPES: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const fileNameFromKey = (key: string) => key.split('/').pop() || key;

// Filesystem-unsafe characters only — keep spaces so "abc@yopmail.com_Corporate Agreement" reads naturally.
const sanitizeForFileName = (value: string) => value.replace(/[/\\:*?"<>|]/g, '-');

const CorporateDocumentsPage = () => {
    const { corporateId } = useParams<{ corporateId: string }>();
    const location = useLocation();
    const navState = location.state as
        | {
              companyName?: string | null;
              email?: string | null;
              fullName?: string | null;
              pekoAccountNumber?: string | null;
          }
        | null;
    const companyName = navState?.companyName;
    const primaryName = companyName || navState?.fullName || 'Unnamed corporate';
    const showFullNameSegment = Boolean(companyName) && Boolean(navState?.fullName);
    // Prefer the corporate's login email (what the user asked for); fall back to company name/id so a
    // download filename is always produced even if email wasn't passed through.
    const identifier = navState?.email || companyName || `corporate-${corporateId}`;

    const { role, id: userId } = useAppSelector(state => state.reducer.auth);
    const [documents, setDocuments] = useState<CorporateDocumentsMap>({});
    const [isLoading, setIsLoading] = useState(false);
    const [openingAction, setOpeningAction] = useState<string | null>(null);

    useEffect(() => {
        const loadDocuments = async () => {
            if (!corporateId) return;
            setIsLoading(true);
            const resp = await getCorporateDocumentsForAdmin(
                { userType: role, userId },
                Number(corporateId)
            );
            setDocuments(resp || {});
            setIsLoading(false);
        };
        loadDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [corporateId]);

    const openDocument = async (docKey: string, mode: 'view' | 'download', documentLabel: string) => {
        const actionKey = `${mode}-${docKey}`;
        setOpeningAction(actionKey);
        try {
            const data = await getCorporateDocumentFileForAdmin({ userType: role, userId }, docKey);
            if (!data || !data.buffer?.data) {
                window.open(docKey, '_blank', 'noopener,noreferrer');
                return;
            }
            const extension = data.type?.toLowerCase() || 'pdf';
            const mimeType = MIME_TYPES[extension] || 'application/octet-stream';
            const blob = new Blob([new Uint8Array(data.buffer.data)], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);
            if (mode === 'view') {
                window.open(blobUrl, '_blank', 'noopener,noreferrer');
            } else {
                const downloadFileName = `${sanitizeForFileName(identifier)}_${sanitizeForFileName(documentLabel)}.${extension}`;
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = downloadFileName;
                link.click();
            }
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        } finally {
            setOpeningAction(null);
        }
    };

    return (
        <Flex vertical gap={20}>
            <Flex vertical gap={12}>
                <Flex align="center" gap={12}>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-bgIconCard">
                        <FileSearchOutlined className="text-xl text-brandColor" />
                    </div>
                    <Flex vertical gap={2}>
                        <Typography.Title level={4} className="!mb-0">
                            Uploaded Documents
                        </Typography.Title>
                        <Typography.Text className="text-sm text-textBody">
                            {primaryName}
                            {showFullNameSegment ? ` · ${navState?.fullName}` : ''}
                            {navState?.pekoAccountNumber ? ` · ${navState.pekoAccountNumber}` : ''}
                            {navState?.email ? ` · ${navState.email}` : ''}
                        </Typography.Text>
                    </Flex>
                </Flex>
            </Flex>

            <div className="rounded-2xl border border-borderCard bg-white p-4 sm:p-6">
                {isLoading && (
                    <Flex justify="center" className="py-10">
                        <Spin />
                    </Flex>
                )}
                {!isLoading && (
                    <Flex vertical>
                        {DOCUMENT_ORDER.map(key => {
                            const entry = documents[key];
                            const docKey = entry?.document;
                            const uploaded = Boolean(docKey);
                            const fileName = docKey ? fileNameFromKey(docKey) : '';

                            return (
                                <Flex
                                    key={key}
                                    justify="space-between"
                                    align="center"
                                    className="-mx-3 rounded-xl border-b border-borderDivider px-3 py-3 transition-colors last:border-b-0 hover:bg-bgLightPink"
                                >
                                    <Flex gap={10} align="center">
                                        <FileTextOutlined className="text-lg text-textGreyLight" />
                                        <Flex vertical>
                                            <Flex gap={8} align="center">
                                                <Typography.Text className="font-medium">
                                                    {DOCUMENT_LABELS[key]}
                                                </Typography.Text>
                                                <Tag
                                                    className="rounded-full border-0 px-2 text-xs"
                                                    color={uploaded ? 'blue' : 'default'}
                                                >
                                                    {uploaded ? 'Uploaded' : 'Not uploaded'}
                                                </Tag>
                                            </Flex>
                                            {uploaded && (
                                                <Typography.Text className="text-xs text-textGreyLight">
                                                    {fileName}
                                                </Typography.Text>
                                            )}
                                        </Flex>
                                    </Flex>
                                    {uploaded && docKey && (
                                        <Flex gap={12} align="center">
                                            {openingAction === `download-${docKey}` ||
                                            openingAction === `view-${docKey}` ? (
                                                <Spin size="small" />
                                            ) : (
                                                <>
                                                    <DownloadOutlined
                                                        className="cursor-pointer text-textGreyLight hover:text-brandColor"
                                                        onClick={() =>
                                                            openDocument(docKey, 'download', DOCUMENT_LABELS[key])
                                                        }
                                                    />
                                                    <EyeOutlined
                                                        className="cursor-pointer text-textGreyLight hover:text-brandColor"
                                                        onClick={() =>
                                                            openDocument(docKey, 'view', DOCUMENT_LABELS[key])
                                                        }
                                                    />
                                                </>
                                            )}
                                        </Flex>
                                    )}
                                </Flex>
                            );
                        })}
                    </Flex>
                )}
            </div>
        </Flex>
    );
};

export default CorporateDocumentsPage;
