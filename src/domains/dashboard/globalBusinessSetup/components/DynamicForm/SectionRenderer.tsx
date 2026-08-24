/* eslint-disable no-nested-ternary */
import { useMemo } from 'react';

import { Alert, Col, Flex, Row, Typography } from 'antd';
import { getIn, useFormikContext } from 'formik';

import FieldRenderer from './FieldRenderer';
import RepeatableSection from './RepeatableSection';
import { useDownloadVendorFile } from '../../hooks/useDownloadVendorFile';
import { ISection, IForm } from '../../types/forms';
import { evaluateCondition } from '../../utils/conditionalUtils';
import { getValueFromComplexPath } from '../../utils/pathResolver';

type SectionRendererProps = {
    section: ISection;
    pageId: string;
    form: IForm;
};

export default function SectionRenderer({ section, pageId, form }: SectionRendererProps) {
    const { values, errors, touched } = useFormikContext<any>();
    const downloadVendorFile = useDownloadVendorFile();

    const sectionError = getIn(errors, `pages.${pageId}.${section._id}`);
    const sectionTouched = getIn(touched, `pages.${pageId}.${section._id}`);

    const shouldRenderByCondition = (
        conditional: any | undefined,
        _form: IForm,
        _values: any,
        _pageId: string,
        _sectionId: string
    ) => {
        if (!conditional?.enabled || !conditional.source_field_name) {
            return true;
        }

        const sourceValue = getValueFromComplexPath(
            _form,
            _values,
            conditional.source_field_name,
            _pageId,
            _sectionId
        );
        if (sourceValue === undefined || sourceValue === null) return false;
        if (!conditional.operator) return false;

        return evaluateCondition(sourceValue, conditional.operator, conditional.value);
    };
    const shouldRenderSection = useMemo(
        () => shouldRenderByCondition(section.conditional, form, values, pageId, section._id),
        [section.conditional, values, pageId, section._id, form]
    );

    const shouldRenderField = (field: any) =>
        shouldRenderByCondition(field.conditional, form, values, pageId, section._id);

    if (!shouldRenderSection) {
        return null;
    }

    // Check if section is repeatable
    const isRepeatable = section.repeater?.enabled;

    if (isRepeatable) {
        return (
            <RepeatableSection
                section={section}
                pageId={pageId}
                sectionId={section._id}
                form={form}
            />
        );
    }

    const formatFileSize = (bytes: number) => {
        if (!bytes && bytes !== 0) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Non-repeatable section
    return (
        <Flex vertical gap={15} id={`section-${section._id}`}>
            <Flex vertical className="gap-2">
                <Typography.Title level={5} className="!mb-0">
                    {section.title}
                </Typography.Title>

                {section.description && (
                    <Typography.Text type="secondary" className="leading-snug">
                        {section.description}
                    </Typography.Text>
                )}
            </Flex>
            <div className="mt-2" />

            <Row gutter={[16, 16]}>
                {section.fields.filter(shouldRenderField).map(field => {
                    const isFullWidth =
                        field.type === 'checkbox' ||
                        field.type === 'nested_select' ||
                        field.type === 'table';

                    return (
                        <Col
                            key={field._id}
                            xs={24}
                            sm={isFullWidth ? 24 : 12}
                            lg={isFullWidth ? 24 : 12}
                            xxl={isFullWidth ? 24 : 8}
                        >
                            <FieldRenderer
                                field={field}
                                pageId={pageId}
                                sectionId={section._id}
                                form={form}
                            />
                            {typeof sectionError === 'string' && sectionTouched && (
                                <Alert
                                    type="error"
                                    showIcon
                                    message="Please correct the below error"
                                    description={sectionError}
                                    className="mt-3"
                                />
                            )}
                        </Col>
                    );
                })}
            </Row>
            {/* ✅ Supporting Documents Section */}
            {section.documents?.enabled && section.documents.files?.length > 0 && (
                <Flex vertical gap={8} className="mt-8">
                    <Typography.Text strong className="text-[15px]">
                        {section.documents.title || 'Supporting Documents'}
                    </Typography.Text>

                    {section.documents.description && (
                        <Typography.Text type="secondary" className="text-sm">
                            {section.documents.description}
                        </Typography.Text>
                    )}

                    {/* Files grid */}
                    <Row gutter={[12, 12]} className="mt-2">
                        {section.documents.files.map(file => (
                            <Col key={file._id} xs={24} sm={12} md={8}>
                                <Flex
                                    align="center"
                                    justify="space-between"
                                    className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                                >
                                    <Flex align="center" gap={10} className="min-w-0">
                                        <div className="w-9 h-9 rounded-md bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700 uppercase">
                                            {file.extension || 'FILE'}
                                        </div>

                                        <Flex vertical className="min-w-0">
                                            <Typography.Text
                                                className="text-[13px] font-medium truncate max-w-[120px]"
                                                title={file.name}
                                            >
                                                {file.name}
                                            </Typography.Text>
                                            <Typography.Text
                                                type="secondary"
                                                className="text-[11px]"
                                            >
                                                {formatFileSize(file.size)}
                                            </Typography.Text>
                                        </Flex>
                                    </Flex>

                                    {file._id ? (
                                        <button
                                            type="button"
                                            onClick={() => downloadVendorFile(file._id)}
                                            className="text-primary flex-shrink-0 ml-2 bg-transparent border-0 p-0 cursor-pointer"
                                            title="Open file"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M14 3h7v7" />
                                                <path d="M10 14L21 3" />
                                                <path d="M21 14v7h-7" />
                                                <path d="M3 10v11h11" />
                                            </svg>
                                        </button>
                                    ) : file.url ? (
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary flex-shrink-0 ml-2"
                                            title="Open file"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M14 3h7v7" />
                                                <path d="M10 14L21 3" />
                                                <path d="M21 14v7h-7" />
                                                <path d="M3 10v11h11" />
                                            </svg>
                                        </a>
                                    ) : null}
                                </Flex>
                            </Col>
                        ))}
                    </Row>
                </Flex>
            )}
        </Flex>
    );
}
