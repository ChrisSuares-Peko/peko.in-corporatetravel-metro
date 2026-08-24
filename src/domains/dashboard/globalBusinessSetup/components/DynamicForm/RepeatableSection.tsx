import { useEffect, useMemo, useRef, useState } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { getIn, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';

import RepeaterItemModal from './RepeaterItemModal';
import RepeaterSummary from './RepeaterSummary';
import { ISection, IForm } from '../../types/forms';
import { getNestedValue, evaluateCondition } from '../../utils/conditionalUtils';
import { resolveComplexPath, getValueFromComplexPath } from '../../utils/pathResolver';

const MAX_REPEAT_INSTANCES_SAFETY = 50;

const getDefaultValue = (fieldType: string, value?: any) => {
    if (value !== undefined && value !== null) {
        return value;
    }

    switch (fieldType) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'radio':
            return '';
        case 'phone':
            return '+971';
        case 'number':
            return undefined;
        case 'select':
            return '';
        case 'checkbox':
            return false;
        case 'nested_select':
            return [];
        case 'date':
        case 'file':
        case 'image':
        default:
            return '';
    }
};

const initializeInstanceFields = (
    section: ISection,
    form: IForm,
    values: any,
    pageId: string,
    sectionId: string,
    instanceIdx: number,
    setFieldValue: (field: string, value: any) => void
) => {
    section.fields.forEach(field => {
        let shouldInitialize = true;

        if (field.conditional?.enabled && field.conditional.source_field_name) {
            const sourceValue = getValueFromComplexPath(
                form,
                values,
                field.conditional.source_field_name,
                pageId,
                sectionId
            );

            if (sourceValue === undefined || sourceValue === null || !field.conditional.operator) {
                shouldInitialize = false;
            } else {
                shouldInitialize = evaluateCondition(
                    sourceValue,
                    field.conditional.operator,
                    field.conditional.value
                );
            }
        }

        if (!shouldInitialize) {
            return;
        }

        const fieldPath = `pages.${pageId}.${sectionId}.${instanceIdx}.${field.name}`;
        const currentValue = getNestedValue(values, fieldPath);

        if (currentValue === undefined) {
            let defaultValue: any;

            if (field.type === 'date' && field.default_value) {
                try {
                    defaultValue = dayjs(field.default_value).format('YYYY-MM-DD');
                } catch {
                    defaultValue = getDefaultValue(field.type);
                }
            } else {
                defaultValue = getDefaultValue(field.type);
            }

            setFieldValue(fieldPath, defaultValue);
        }
    });
};

type RepeatableSectionProps = {
    section: ISection;
    pageId: string;
    sectionId: string;
    form: IForm;
};

export default function RepeatableSection({
    section,
    pageId,
    sectionId,
    form,
}: RepeatableSectionProps) {
    const { values, errors, touched, setFieldValue } = useFormikContext<any>();

    const sectionError = getIn(errors, `pages.${pageId}.${sectionId}`);
    const sectionTouched = getIn(touched, `pages.${pageId}.${sectionId}`);
    const [instances, setInstances] = useState<Array<{ id: string; index: number }>>([]);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const snapshotRef = useRef<Record<string, any> | null>(null);
    const isOpen = editingIndex !== null;

    const repeater = section.repeater || { enabled: false };
    const isUserControlled = repeater.enabled && repeater.source_type === 'user_controlled';
    const isFixedCount = repeater.enabled && repeater.source_type === 'fixed_count';
    const isFieldValue = repeater.enabled && repeater.source_type === 'field_value';

    const sourceFieldPath = useMemo(() => {
        if (isFieldValue && repeater.source_field_name) {
            return resolveComplexPath(form, repeater.source_field_name, pageId, sectionId);
        }
        return null;
    }, [isFieldValue, repeater.source_field_name, form, pageId, sectionId]);

    const sourceFieldValue = useMemo(() => {
        if (sourceFieldPath) {
            return getNestedValue(values, sourceFieldPath);
        }
        return undefined;
    }, [sourceFieldPath, values]);

    const effectiveMax = useMemo(() => {
        const configMax = repeater.max_instances;
        if (configMax && configMax > 0) {
            return Math.min(configMax, MAX_REPEAT_INSTANCES_SAFETY);
        }
        return MAX_REPEAT_INSTANCES_SAFETY;
    }, [repeater.max_instances]);

    const requiredCount = useMemo(() => {
        if (!isFieldValue) return null;

        const numericValue = Number(sourceFieldValue);

        if (Number.isNaN(numericValue) || numericValue < 0) return 0;

        return Math.min(numericValue, effectiveMax);
    }, [isFieldValue, sourceFieldValue, effectiveMax]);

    useEffect(() => {
        if (!isFieldValue || !sourceFieldPath) return;
        const raw = Number(sourceFieldValue);
        if (!Number.isNaN(raw) && raw > effectiveMax) {
            setFieldValue(sourceFieldPath, effectiveMax);
            message.warning(`Maximum ${effectiveMax} entries allowed for this section`);
        }
    }, [isFieldValue, sourceFieldPath, sourceFieldValue, effectiveMax, setFieldValue]);

    const userMutatedInstancesRef = useRef(false);

    useEffect(() => {
        if (!repeater.enabled) {
            if (instances.length !== 1) setInstances([{ id: uuid(), index: 0 }]);
            return;
        }

        if (isFieldValue) {
            return;
        }

        const sectionData = getIn(values, `pages.${pageId}.${sectionId}`);
        const savedCount =
            sectionData && typeof sectionData === 'object'
                ? Object.keys(sectionData).filter(k => !Number.isNaN(Number(k))).length
                : 0;

        let expectedCount: number;
        if (isFixedCount) {
            expectedCount = repeater.fixed_count || 1;
        } else if (isUserControlled) {
            const minCount = repeater.min_instances || 1;
            expectedCount = userMutatedInstancesRef.current
                ? instances.length
                : Math.max(minCount, savedCount);
        } else {
            expectedCount = 1;
        }

        if (instances.length === expectedCount) return;
        setInstances(Array.from({ length: expectedCount }, (_, i) => ({ id: uuid(), index: i })));
    }, [
        repeater.enabled,
        isFixedCount,
        isUserControlled,
        isFieldValue,
        repeater.source_type,
        repeater.fixed_count,
        repeater.min_instances,
        sectionId,
        pageId,
        values,
        instances.length,
    ]);

    useEffect(() => {
        if (isFieldValue && sourceFieldPath && requiredCount !== null) {
            if (instances.length !== requiredCount) {
                if (instances.length < requiredCount) {
                    const newInstanceIndices = Array.from(
                        { length: requiredCount - instances.length },
                        (_, i) => instances.length + i
                    );
                    const newInstances = [
                        ...instances,
                        ...newInstanceIndices.map(index => ({
                            id: uuid(),
                            index,
                        })),
                    ];
                    setInstances(newInstances);

                    newInstanceIndices.forEach(instanceIdx => {
                        initializeInstanceFields(
                            section,
                            form,
                            values,
                            pageId,
                            sectionId,
                            instanceIdx,
                            setFieldValue
                        );
                    });
                } else if (instances.length > requiredCount) {
                    const newInstances = instances.slice(0, requiredCount);
                    setInstances(newInstances);
                    const indicesToClear = Array.from(
                        { length: instances.length - requiredCount },
                        (_, idx) => requiredCount + idx
                    );
                    indicesToClear.forEach(i => {
                        const instancePath = `pages.${pageId}.${sectionId}.${i}`;
                        setFieldValue(instancePath, undefined);
                    });
                }
            } else if (instances.length === 0 && requiredCount > 0) {
                const newInstances = Array.from({ length: requiredCount }, (_, i) => ({
                    id: uuid(),
                    index: i,
                }));
                setInstances(newInstances);

                for (let i = 0; i < requiredCount; i += 1) {
                    initializeInstanceFields(
                        section,
                        form,
                        values,
                        pageId,
                        sectionId,
                        i,
                        setFieldValue
                    );
                }
            }
        }
    }, [
        isFieldValue,
        sourceFieldPath,
        requiredCount,
        instances.length,
        pageId,
        sectionId,
        setFieldValue,
        instances,
        section,
        form,
        values,
    ]);

    const removeInstance = (indexToRemove: number) => {
        if (!isUserControlled) return;

        const minCount = repeater.min_instances || 1;
        if (instances.length <= minCount) {
            message.warning(`Minimum ${minCount} instances required`);
            return;
        }

        const newInstances = instances.filter((_, idx) => idx !== indexToRemove);
        const reindexedInstances = newInstances.map((inst, idx) => ({
            ...inst,
            index: idx,
        }));

        const sectionPath = `pages.${pageId}.${sectionId}`;

        const indicesToShift = Array.from(
            { length: instances.length - indexToRemove - 1 },
            (_, idx) => indexToRemove + 1 + idx
        );
        indicesToShift.forEach(i => {
            const oldPath = `${sectionPath}.${i}`;
            const newPath = `${sectionPath}.${i - 1}`;
            const oldValue = getNestedValue(values, oldPath);
            if (oldValue) {
                setFieldValue(newPath, oldValue);
            }
        });

        const lastIndex = instances.length - 1;
        setFieldValue(`${sectionPath}.${lastIndex}`, undefined);

        userMutatedInstancesRef.current = true;
        setInstances(reindexedInstances);
    };

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

    if (!shouldRenderSection) {
        return null;
    }

    if (isFieldValue && requiredCount === 0) {
        return null;
    }

    const noun =
        (repeater.title_template || 'Item {index}').replace('{index}', '').trim() || 'Item';

    const handleAdd = () => {
        if (!isUserControlled) return;
        const maxCount = repeater.max_instances || Infinity;
        if (instances.length >= maxCount) {
            message.warning(`Maximum ${maxCount} ${noun.toLowerCase()}(s) allowed`);
            return;
        }
        const newIndex = instances.length;
        userMutatedInstancesRef.current = true;
        setInstances([...instances, { id: uuid(), index: newIndex }]);
        initializeInstanceFields(section, form, values, pageId, sectionId, newIndex, setFieldValue);
        snapshotRef.current = null;
        setMode('add');
        setEditingIndex(newIndex);
    };

    const handleEdit = (idx: number) => {
        const snapshot = getIn(values, `pages.${pageId}.${sectionId}.${idx}`);
        snapshotRef.current = snapshot ? JSON.parse(JSON.stringify(snapshot)) : null;
        setMode('edit');
        setEditingIndex(idx);
    };

    const handleSave = () => {
        setEditingIndex(null);
        snapshotRef.current = null;
    };

    const handleCancel = () => {
        if (editingIndex === null) {
            return;
        }
        if (mode === 'add') {
            // Drop the freshly-appended draft instance + its Formik subtree
            const newInstances = instances.filter(i => i.index !== editingIndex);
            setInstances(newInstances);
            setFieldValue(`pages.${pageId}.${sectionId}.${editingIndex}`, undefined);
        } else if (snapshotRef.current !== null) {
            setFieldValue(
                `pages.${pageId}.${sectionId}.${editingIndex}`,
                snapshotRef.current,
                false
            );
        }
        snapshotRef.current = null;
        setEditingIndex(null);
    };

    const minInstances = repeater.min_instances || 0;
    const canDelete = isUserControlled && instances.length > minInstances;

    return (
        <Flex vertical gap={15} id={`section-${section._id}`}>
            <Flex justify="space-between" align="center" gap={10} wrap="wrap">
                <Flex vertical>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                        {section.title}
                    </Typography.Title>
                    {section.description && (
                        <Typography.Text type="secondary">{section.description}</Typography.Text>
                    )}
                </Flex>
                {isUserControlled && (
                    <Button
                        type="default"
                        danger
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        disabled={instances.length >= (repeater.max_instances || Infinity)}
                    >
                        Add {noun}
                    </Button>
                )}
            </Flex>

            <RepeaterSummary
                pageId={pageId}
                sectionId={sectionId}
                section={section}
                instances={instances}
                hiddenIndex={isOpen && mode === 'add' ? editingIndex : null}
                canDelete={canDelete}
                onEdit={handleEdit}
                onDelete={removeInstance}
            />

            {isOpen && editingIndex !== null && (
                <RepeaterItemModal
                    open
                    mode={mode}
                    noun={noun}
                    section={section}
                    pageId={pageId}
                    sectionId={sectionId}
                    instanceIdx={editingIndex}
                    form={form}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            )}

            {typeof sectionError === 'string' && sectionTouched && (
                <Alert
                    type="error"
                    showIcon
                    message="Please correct the below error"
                    description={sectionError}
                    className="mt-3"
                />
            )}
        </Flex>
    );
}
