import { useEffect } from 'react';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Divider, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useFormikContext } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';

import { DECIMAL_QUANTITY_UNITS, GST_MODE_OPTIONS, GST_OPTIONS, UNIT_OPTIONS } from '../../constants/createInvoice';
import { CatalogItemApiData } from '../../types/catalog';
import { CreateInvoiceFormValues, ItemValues } from '../../types/createInvoice';
import { computeNetAmount } from '../invoiceCalculations';

// A line item from the linked invoice that still has creditable quantity remaining,
// used to restrict/lock the items table when it's rendered in credit note mode.
export type CreditNoteAvailableProduct = {
    itemId: string;
    name: string;
    hsn: string;
    unit: string;
    unitPrice: string;
    discount: string;
    taxRate: string;
    taxMode: 'Exclusive' | 'Inclusive';
    productId?: string;
    availableQuantity: number;
};

const NetAmountCell = ({ index }: { index: number }) => {
    const { values, setFieldValue } = useFormikContext<CreateInvoiceFormValues>();
    const item = values.items[index];
    const net = computeNetAmount(item);
    const netStr = net > 0 ? net.toFixed(2) : '';

    useEffect(() => {
        // Also depends on the currently-stored netAmount (not just the inputs that produce it) —
        // if something external (e.g. a Formik reinitialize) resets it without those inputs
        // changing, this still notices the mismatch and corrects it.
        if (item.netAmount !== netStr) {
            setFieldValue(`items[${index}].netAmount`, netStr);
        }
    }, [item.quantity, item.unitPrice, item.discount, item.taxRate, item.taxMode, item.netAmount, netStr, setFieldValue, index]);

    return (
        <TextInput name={`items[${index}].netAmount`} placeholder="0.00" type="text" isDisabled />
    );
};

const QuantityCell = ({ index, max }: { index: number; max?: number }) => {
    const { values, setFieldValue } = useFormikContext<CreateInvoiceFormValues>();
    const unit = values.items[index]?.unit ?? '';
    const quantity = values.items[index]?.quantity ?? '';
    const allowsDecimals = !unit || DECIMAL_QUANTITY_UNITS.includes(unit);

    useEffect(() => {
        if (allowsDecimals) return;
        const str = String(quantity);
        if (!str.includes('.')) return;
        const num = parseFloat(str);
        const rounded = Number.isFinite(num) ? String(Math.round(num)) : '';
        setFieldValue(`items[${index}].quantity`, rounded);
    }, [allowsDecimals, quantity, setFieldValue, index]);

    useEffect(() => {
        if (max == null) return;
        const num = parseFloat(String(quantity));
        if (Number.isFinite(num) && num > max) {
            setFieldValue(`items[${index}].quantity`, String(max));
        }
    }, [max, quantity, setFieldValue, index]);

    return (
        <TextInput
            name={`items[${index}].quantity`}
            placeholder="Qty"
            type="text"
            allowTwoDecimalsOnly={allowsDecimals}
            allowNumbersOnly={!allowsDecimals}
            maxLength={7}
        />
    );
};

interface TitleCellProps {
    index: number;
    catalogItems: CatalogItemApiData[];
    catalogLoading: boolean;
    setSearchText: (text: string) => void;
    onAddNewItem: (index: number) => void;
    creditNoteAvailableProducts?: CreditNoteAvailableProduct[];
}

const TitleCell = ({
    index,
    catalogItems,
    catalogLoading,
    setSearchText,
    onAddNewItem,
    creditNoteAvailableProducts,
}: TitleCellProps) => {
    const { values, setFieldValue } = useFormikContext<CreateInvoiceFormValues>();
    const item = values.items[index];
    const isCreditNoteMode = !!creditNoteAvailableProducts;

    const usedItemIds = new Set(
        values.items
            .filter((_, i) => i !== index)
            .map(it => it.itemId)
            .filter(Boolean)
    );
    const selectableProducts = isCreditNoteMode
        ? (creditNoteAvailableProducts as CreditNoteAvailableProduct[]).filter(
            p => p.itemId === item?.itemId || !usedItemIds.has(p.itemId)
        )
        : [];

    const autoOptions = isCreditNoteMode
        ? selectableProducts.map(p => ({
            key: p.itemId,
            value: p.name,
            label: (
                <div className="flex justify-between items-center gap-2">
                    <span>{p.name}</span>
                    <span className="text-gray-400 text-xs shrink-0">
                        {p.availableQuantity} available
                    </span>
                </div>
            ),
        }))
        : catalogItems.map(c => ({
            key: String(c.id),
            value: c.name,
            label: (
                <div className="flex justify-between items-center gap-2">
                    <span>{c.name}</span>
                    <span className="text-gray-400 text-xs shrink-0">
                        ₹{Number(c.unitPrice).toFixed(2)}
                    </span>
                </div>
            ),
        }));

    const handleSelectCreditNoteItem = (name: string) => {
        const product = selectableProducts.find(p => p.name === name);
        if (!product) return;
        setFieldValue(`items[${index}]`, {
            name: product.name,
            hsn: product.hsn,
            quantity: String(product.availableQuantity),
            unit: product.unit,
            unitPrice: product.unitPrice,
            discount: product.discount,
            taxRate: product.taxRate,
            taxMode: product.taxMode,
            netAmount: '',
            productId: product.productId,
            itemId: product.itemId,
        });
    };

    const handleSelect = (name: string) => {
        const cat = catalogItems.find(c => c.name === name);
        if (cat) {
            setFieldValue(`items[${index}].unitPrice`, cat.unitPrice);
            setFieldValue(`items[${index}].taxRate`, cat.gstPercent ?? '0');
            setFieldValue(`items[${index}].hsn`, cat.hsnCode ?? '');
            setFieldValue(`items[${index}].productId`, String(cat.id));
        }
    };

    const handleChange = (val: string) => {
        setFieldValue(`items[${index}].name`, val);
        // Clear productId so this row is treated as manually entered
        setFieldValue(`items[${index}].productId`, undefined);
    };

    const dropdownRender = (menu: React.ReactElement) => (
        <>
            {menu}
            <Divider style={{ margin: '4px 0' }} />
            <Button
                type="text"
                danger
                block
                icon={<PlusOutlined />}
                onMouseDown={e => e.preventDefault()}
                onClick={() => onAddNewItem(index)}
                style={{ justifyContent: 'center' }}
            >
                Add new item
            </Button>
        </>
    );

    return (
        <AutoComplete
            value={item?.name || ''}
            placeholder={isCreditNoteMode ? 'Select an item from the original invoice...' : 'Search or enter item name...'}
            options={autoOptions}
            notFoundContent={!isCreditNoteMode && catalogLoading ? <Spin size="small" /> : undefined}
            onChange={isCreditNoteMode ? () => {} : handleChange}
            onSelect={isCreditNoteMode ? handleSelectCreditNoteItem : handleSelect}
            onSearch={isCreditNoteMode ? undefined : setSearchText}
            dropdownRender={isCreditNoteMode ? undefined : dropdownRender}
            allowClear={!isCreditNoteMode}
            onClear={
                isCreditNoteMode
                    ? undefined
                    : () => {
                        setFieldValue(`items[${index}].name`, '');
                        setFieldValue(`items[${index}].hsn`, '');
                        setFieldValue(`items[${index}].unitPrice`, '');
                        setFieldValue(`items[${index}].taxRate`, '0');
                        setFieldValue(`items[${index}].productId`, undefined);
                    }
            }
            style={{ width: '100%' }}
        />
    );
};

export type CatalogColumnProps = {
    catalogItems: CatalogItemApiData[];
    catalogLoading: boolean;
    setSearchText: (text: string) => void;
    onAddNewItem: (index: number) => void;
};

const topCell = () => ({ style: { verticalAlign: 'top' as const } });

export const getItemsTableColumns = (
    remove: (index: number) => void,
    rowCount: number,
    catalogProps: CatalogColumnProps,
    creditNoteAvailableProducts?: CreditNoteAvailableProduct[]
): ColumnsType<ItemValues & { key: number }> => {
    const isCreditNoteMode = !!creditNoteAvailableProducts;

    return [
        {
            title: 'Title',
            minWidth: 200,
            onCell: topCell,
            render: (_, __, index) => (
                <TitleCell index={index} {...catalogProps} creditNoteAvailableProducts={creditNoteAvailableProducts} />
            ),
        },
        {
            title: 'HSN',
            width: 110,
            onCell: topCell,
            render: (_, __, index) => (
                <TextInput
                    name={`items[${index}].hsn`}
                    placeholder="HSN"
                    type="text"
                    allowNumbersOnly
                    maxLength={8}
                    isDisabled={isCreditNoteMode}
                />
            ),
        },
        {
            title: 'Quantity',
            width: 100,
            onCell: topCell,
            render: (_, record, index) => (
                <QuantityCell
                    index={index}
                    max={
                        isCreditNoteMode
                            ? creditNoteAvailableProducts?.find(p => p.itemId === record.itemId)?.availableQuantity
                            : undefined
                    }
                />
            ),
        },
        {
            title: 'Unit',
            width: 80,
            onCell: topCell,
            render: (_, __, index) => (
                <SelectInput
                    name={`items[${index}].unit`}
                    placeholder="Unit"
                    options={UNIT_OPTIONS}
                    isDisabled={isCreditNoteMode}
                />
            ),
        },
        {
            title: 'Unit Price (₹)',
            width: 120,
            onCell: topCell,
            render: (_, __, index) => (
                <TextInput
                    name={`items[${index}].unitPrice`}
                    placeholder="Price"
                    type="text"
                    allowTwoDecimalsOnly
                    maxLength={10}
                    isDisabled={isCreditNoteMode}
                />
            ),
        },
        {
            title: 'Discount (%)',
            width: 70,
            onCell: topCell,
            render: (_, __, index) => (
                <TextInput
                    name={`items[${index}].discount`}
                    placeholder="0"
                    type="text"
                    allowTwoDecimalsOnly
                    maxLength={5}
                    isDisabled={isCreditNoteMode}
                />
            ),
        },
        {
            title: 'Tax Rate (%)',
            width: 80,
            onCell: topCell,
            render: (_, __, index) => (
                <SelectInput
                    name={`items[${index}].taxRate`}
                    placeholder="GST"
                    options={GST_OPTIONS}
                    isDisabled={isCreditNoteMode}
                />
            ),
        },
        {
            title: 'Tax Type',
            width: 115,
            onCell: topCell,
            render: (_, __, index) => (
                <div style={{ width: 115, overflow: 'hidden' }}>
                    <SelectInput
                        name={`items[${index}].taxMode`}
                        placeholder="Tax Type"
                        options={GST_MODE_OPTIONS}
                        isDisabled={isCreditNoteMode}
                    />
                </div>
            ),
        },
        {
            title: 'Net Amount (₹)',
            width: 165,
            onCell: topCell,
            render: (_, __, index) => <NetAmountCell index={index} />,
        },
        {
            title: '',
            width: 10,
            onCell: topCell,
            render: (_, __, index) => {
                const canDelete = isCreditNoteMode || rowCount > 1;
                return (
                    <DeleteOutlined
                        onClick={canDelete ? () => remove(index) : undefined}
                        className={
                            canDelete
                                ? 'text-red-500 cursor-pointer text-sm'
                                : 'text-gray-300 cursor-not-allowed text-sm'
                        }
                    />
                );
            },
        },
    ];
};
