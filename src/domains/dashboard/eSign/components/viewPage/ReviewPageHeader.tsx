import { type FC } from 'react';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';

import { useAppSelector } from '@src/hooks/store';
import useFileDownloader from '@src/hooks/useFileDownloader';
import useScreenSize from '@src/hooks/useScreenSize';
// import PdfThumbnail from '@components/molecular/pdfViewer/PdfThumbnail';

import StatusBadge from '../orderHistory/StatusBadge';

interface ReviewPageHeaderProps {}

const ReviewPageHeader: FC<ReviewPageHeaderProps> = () => {
    const { document_url, audit_trail_url, status, isDisabled } = useAppSelector(
        state => state.reducer.eSignDoc
    );
    const { handleDownloadLink } = useFileDownloader();
    const { xs, sm } = useScreenSize();

    // const formattedExpiryDate = doc_expiry_date
    //     ? new Date(doc_expiry_date).toLocaleDateString('en-US', {
    //           year: 'numeric',
    //           month: 'long',
    //           day: 'numeric',
    //       })
    //     : 'Unknown';
    return (
        <>
            <Flex justify="space-between" className="mt-2 md:mt-4 xs:flex-col sm:flex-row ">
                <Flex align="center" gap={10}>
                    {isDisabled && (
                        <Typography.Text className="font-medium sm:text-xl ">eSign</Typography.Text>
                    )}
                    {isDisabled && <StatusBadge status={status!} />}
                </Flex>
                <Flex gap={10} justify={xs ? 'start' : 'end'} className="xs:mt-3 sm:mt-0">
                    {isDisabled && audit_trail_url !== null && status === 'COMPLETED' && (
                        <Button
                            className=""
                            danger
                            size={sm ? 'middle' : 'small'}
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadLink(audit_trail_url!)}
                            disabled={!audit_trail_url}
                        >
                            Certificate
                        </Button>
                    )}
                    {isDisabled && document_url !== null && status === 'COMPLETED' && (
                        <Button
                            className=""
                            danger
                            size={sm ? 'middle' : 'small'}
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadLink(document_url!)}
                            disabled={!document_url}
                        >
                            Document
                        </Button>
                    )}
                </Flex>
            </Flex>
            {/* {status === 'COMPLETED' && (
                <Flex className="xs:mt-3 md:mt-4">
                    {document_url ? (
                        <Alert
                            message={
                                <span>
                                    <strong>Important:</strong> Available to download until{' '}
                                    {formattedExpiryDate}.
                                </span>
                            }
                            type="warning"
                            showIcon
                        />
                    ) : (
                        <Alert
                            message="The document is expired and cannot be downloaded."
                            type="error"
                            showIcon
                        />
                    )}
                </Flex>
            )} */}
        </>
    );
};

export default ReviewPageHeader;
