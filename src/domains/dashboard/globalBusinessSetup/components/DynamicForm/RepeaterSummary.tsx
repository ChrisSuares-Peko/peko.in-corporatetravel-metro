import React, { useMemo } from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Empty, Flex, Table, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { getIn, useFormikContext } from 'formik';

import FieldValue from './FieldValue';
import { useCountries } from '../../hooks/useCountries';
import { ISection } from '../../types/forms';

interface RepeaterSummaryProps {
    pageId: string;
    sectionId: string;
    section: ISection;
    instances: { id: string; index: number }[];
    hiddenIndex?: number | null;
    canDelete: boolean;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}

type Row = {
    key: string;
    _rowId: string;
    _index: number;
    _values: Record<string, unknown>;
    _errors: Record<string, string | undefined>;
};

const RepeaterSummary: React.FC<RepeaterSummaryProps> = ({
    pageId,
    sectionId,
    section,
    instances,
    hiddenIndex,
    canDelete,
    onEdit,
    onDelete,
}) => {
    const { values, errors } = useFormikContext<any>();

    const sectionPath = `pages.${pageId}.${sectionId}`;

    const hasCountryField = useMemo(
        () => section.fields.some(f => f.type === 'country'),
        [section.fields]
    );
    const { countryOptions } = useCountries('', '', hasCountryField ? 'is_active=true' : '');
    const countryLabelById = useMemo(() => {
        const map: Record<string, string> = {};
        countryOptions.forEach(c => {
            map[c.value] = c.label;
        });
        return map;
    }, [countryOptions]);

    const rows = useMemo<Row[]>(
        () =>
            instances
                .filter(inst => inst.index !== hiddenIndex)
                .map(inst => {
                    const instanceValues =
                        (getIn(values, `${sectionPath}.${inst.index}`) as Record<
                            string,
                            unknown
                        >) || {};
                    const instanceErrors =
                        (getIn(errors, `${sectionPath}.${inst.index}`) as Record<string, string>) ||
                        {};
                    return {
                        key: inst.id,
                        _rowId: inst.id,
                        _index: inst.index,
                        _values: instanceValues,
                        _errors: instanceErrors,
                    };
                }),
        [instances, hiddenIndex, values, errors, sectionPath]
    );

    const columns = useMemo<ColumnsType<Row>>(() => {
        const fieldCols: ColumnsType<Row> = section.fields.map(field => ({
            title: field.label,
            dataIndex: field.name,
            key: field._id,
            ellipsis: true,
            render: (_: unknown, row: Row) => {
                const err = row._errors?.[field.name];
                if (typeof err === 'string' && err) {
                    return <span className="text-red-500 text-xs">{err}</span>;
                }
                let cellValue = row._values[field.name];
                if (field.type === 'country' && cellValue) {
                    cellValue = countryLabelById[String(cellValue)] ?? cellValue;
                }
                return <FieldValue field={field} value={cellValue} />;
            },
        }));

        return [
            {
                title: '#',
                key: '_sno',
                width: 50,
                render: (_: unknown, row: Row) => row._index + 1,
            },
            ...fieldCols,
            {
                title: 'Actions',
                key: '_actions',
                width: 120,
                align: 'center',
                render: (_: unknown, row: Row) => (
                    <Flex gap={4} justify="center">
                        <Tooltip title="Edit">
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => onEdit(row._index)}
                            />
                        </Tooltip>
                        {canDelete && (
                            <Tooltip title="Remove">
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => onDelete(row._index)}
                                />
                            </Tooltip>
                        )}
                    </Flex>
                ),
            },
        ];
    }, [section.fields, canDelete, onEdit, onDelete, countryLabelById]);

    if (rows.length === 0) {
        return (
            <div
                className="rounded-2xl bg-white"
                style={{ border: '1px solid #E5E7EB', padding: 24 }}
            >
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <Typography.Text type="secondary">No items added yet</Typography.Text>
                    }
                />
            </div>
        );
    }

    return (
        <Table<Row>
            columns={columns}
            dataSource={rows}
            pagination={false}
            size="middle"
            bordered
            scroll={{ x: 'max-content' }}
        />
    );
};

export default RepeaterSummary;
