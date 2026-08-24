import React, { useEffect, useMemo } from 'react';

import { Alert, Col, Flex, Form, Row, Select, Spin, Typography } from 'antd';
import { useField } from 'formik';

import { useFormTableById } from '../../hooks/useGetTableData';
import { INestedLevel } from '../../types/forms';

interface NestedSelectInputProps {
    name: string;
    label?: string;
    required?: boolean;
    description?: string;
    tableId?: string;
    levels: INestedLevel[];
}

const NestedSelectInput: React.FC<NestedSelectInputProps> = ({
    name,
    label,
    required,
    description,
    tableId,
    levels,
}) => {
    const [field, meta, helpers] = useField<string[]>(name);
    const selected = useMemo<string[]>(
        () => (Array.isArray(field.value) ? field.value : []),
        [field.value]
    );

    const { data, loading, error, fetchFormTableById } = useFormTableById();

    useEffect(() => {
        if (tableId) fetchFormTableById(tableId);
    }, [tableId, fetchFormTableById]);

    const rows = useMemo<Record<string, any>[]>(
        () => (Array.isArray(data?.data) ? (data.data as Record<string, any>[]) : []),
        [data]
    );
    const primaryColumn: string | undefined = data?.primary_column;
    const primaryLabel =
        data?.columns?.find((c: { key: string; label: string }) => c.key === primaryColumn)
            ?.label || primaryColumn;

    const optionsForLevel = (levelIdx: number): string[] => {
        const lvl = levels[levelIdx];
        if (!lvl?.column) return [];
        const seen = new Set<string>();
        const out: string[] = [];
        rows.forEach(row => {
            const matchesParents = levels
                .slice(0, levelIdx)
                .every(
                    (parent, i) => String(row[parent.column] ?? '') === String(selected[i] ?? '')
                );
            if (!matchesParents) return;
            const raw = row[lvl.column];
            if (raw === undefined || raw === null || raw === '') return;
            const v = String(raw);
            if (!seen.has(v)) {
                seen.add(v);
                out.push(v);
            }
        });
        return out;
    };

    const handleSelect = (levelIdx: number, value: string | null) => {
        const next = selected.slice(0, levelIdx);
        if (value) next[levelIdx] = value;
        helpers.setValue(next);
    };

    const primaryValue = useMemo<unknown>(() => {
        if (!primaryColumn || selected.length === 0) return null;
        const matched = rows.find(row =>
            levels.every((lvl, i) => {
                const cell = row[lvl.column];
                if (i < selected.length) return String(cell ?? '') === selected[i];
                return cell === undefined || cell === null || cell === '';
            })
        );
        return matched ? matched[primaryColumn] : null;
    }, [primaryColumn, rows, levels, selected]);

    const firstMissingIdx = levels.findIndex((_, i) => !selected[i]);

    const heading = (label || description) && (
        <Flex vertical gap={2} className="mb-2">
            {label && (
                <Typography.Text className="text-sm font-medium text-neutral-900">
                    {label}
                    {required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
                </Typography.Text>
            )}
            {description && (
                <Typography.Text className="text-xs text-neutral-500">
                    {description}
                </Typography.Text>
            )}
        </Flex>
    );

    if (!tableId || levels.length === 0) {
        return (
            <>
                {heading}
                <Alert
                    type="warning"
                    showIcon
                    message="Nested select field is not fully configured"
                />
            </>
        );
    }

    if (loading && !data) {
        return (
            <>
                {heading}
                <Spin size="small" />
            </>
        );
    }

    if (error) {
        return (
            <>
                {heading}
                <Alert type="error" showIcon message="Failed to load options" />
            </>
        );
    }

    return (
        <>
            {heading}
            <Row gutter={[12, 12]}>
                {levels.map((lvl, idx) => {
                    const opts = optionsForLevel(idx);
                    const isVisible =
                        idx === 0 || (selected[idx - 1] !== undefined && opts.length > 0);
                    if (!isVisible) return null;

                    const showError =
                        meta.touched && Boolean(meta.error) && firstMissingIdx === idx;

                    return (
                        <Col key={`${lvl.column}-${idx}`} xs={24} md={12} lg={8}>
                            <Form.Item
                                label={lvl.label}
                                required={required}
                                validateStatus={showError ? 'error' : ''}
                                help={showError ? (meta.error as string) : undefined}
                            >
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder={`Select ${lvl.label}`}
                                    value={selected[idx] || undefined}
                                    onChange={val => handleSelect(idx, val ?? null)}
                                    allowClear
                                    options={opts.map(o => ({ value: o, label: o }))}
                                />
                            </Form.Item>
                        </Col>
                    );
                })}
            </Row>
            {primaryValue !== null && primaryValue !== undefined && primaryValue !== '' && (
                <Alert
                    type="info"
                    showIcon
                    className="mt-3"
                    message={`${primaryLabel}: ${String(primaryValue)}`}
                    description={selected.join(' › ')}
                />
            )}
        </>
    );
};

export default NestedSelectInput;
