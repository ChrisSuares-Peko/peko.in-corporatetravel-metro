import { useState } from 'react';

import { Col, Flex, Form, Input, Row, Tag } from 'antd';
import { Field, FieldProps } from 'formik';

import { formatNumberWithLocalString } from '@utils/priceFormat';

import PriceTag from './PriceTag';
// import { price } from '../../Hotels/utils/data';

interface AmountFieldProps {
    priceType?: string;
    min_price: string | undefined;
    max_price: string | undefined;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
    isSubmitting: boolean;
    denominations?: number[];
}

const AmountField = ({
    priceType,
    min_price,
    max_price,
    setFieldValue,
    denominations,
}: AmountFieldProps) => {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [inputAmount, setInputAmount] = useState<string>('');
    const minSellingPrice = Number(min_price) || 0;
    const maxSellingPrice = Number(max_price) || Number.MAX_SAFE_INTEGER;
   

    const validateAmount = (val: number): string | undefined => {
        if (
            priceType === "FIXED" &&
            denominations &&
            denominations.length > 0 &&
            !denominations.includes(val)
        ) {
            return `Please select a valid amount: ${denominations
                .slice()
                .sort((a, b) => a - b)
                .map(denomination => `  ₹ ${Number(denomination).toFixed(2)}`)
                .join(', ')}`;
        }
        if (val < minSellingPrice || val > maxSellingPrice) {
            return `Please enter a value between ₹ ${minSellingPrice.toFixed(2)} - ₹ ${maxSellingPrice.toFixed(2)}`;
        }
        return undefined;
    };

    const handleClick = (amount: number) => {
        setInputAmount(String(amount));
        setSelectedAmount(amount);
        setFieldValue('amount', amount);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const truncatedValue = inputValue.slice(0, 5); // Truncate to 4 digits
        setInputAmount(truncatedValue);

        const parsedValue = parseFloat(truncatedValue);
        if (
            !Number.isNaN(parsedValue) &&
            parsedValue <= maxSellingPrice &&
            truncatedValue.length <= maxSellingPrice.toString().length
        ) {
            setInputAmount(inputValue);
            setSelectedAmount(parsedValue);
            setFieldValue('amount', parsedValue);
        } else {
            setInputAmount('');
            setSelectedAmount(null);
            setFieldValue('amount', '');
        }
    };

    return (
        <Flex className="flex-wrap" gap={8}>
           {priceType === 'FLEXI' ? (
                <Flex className="flex-wrap" gap={5}>
                    <Field name="amount" validate={validateAmount}>
                        {({ field, form, meta }: FieldProps<number>) => (
                            <Form.Item
                                validateStatus={meta.touched && meta.error ? 'error' : ''}
                                help={meta.touched && meta.error ? meta.error : ''}
                                style={{ marginBottom: '10px' }}
                            >
                                <Row gutter={8} align="middle">
                                    <Col>
                                        <Input
                                            placeholder="Enter Amount"
                                            className="w-32 mb-2 mr-1"
                                            {...field}
                                            onChange={e => {
                                                handleInputChange(e);
                                                field.onChange(e);
                                            }}
                                            onBlur={() => form.setFieldTouched('amount', true)}
                                            onKeyDown={e => {
                                                // Restrict non-numeric input
                                                if (
                                                    e.key < '0' ||
                                                    (e.key > '9' && e.key !== 'Backspace')
                                                ) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            value={inputAmount}
                                        />
                                    </Col>
                                    {/* Tag element to the right */}
                                    {min_price && max_price && (
                                        <Col>
                                            <Tag
                                                style={{
                                                    textAlign: 'center',
                                                    borderColor: '#E2BE00',
                                                    color: '#E2BE00',
                                                    borderRadius: '.25rem',
                                                }}
                                            >
                                                Min: ₹ {formatNumberWithLocalString(min_price)},
                                                Max: ₹ {formatNumberWithLocalString(max_price)}
                                            </Tag>
                                        </Col>
                                    )}
                                </Row>
                            </Form.Item>
                        )}
                    </Field>
                </Flex>
            ) : (
                // If price type is FIXED, render PriceTags based on denominations
                <Field name="amount" validate={validateAmount}>
                    {({ meta }: FieldProps<number>) => {
                        const hasError = meta.touched && meta.error;
                        return (
                            <Flex vertical>
                                <Flex className="flex-wrap" gap={8}>
                                    {denominations?.slice().sort((a, b) => a - b).map((price, index) => (
                                        <PriceTag
                                            key={index}
                                            price={price}
                                            onClick={() => handleClick(price)}
                                            selected={selectedAmount === price}
                                        />
                                    ))}
                                </Flex>
                                {hasError && !selectedAmount && (
                                    <div style={{ color: 'red', marginTop: '0.5rem' }}>
                                        {meta.error}
                                    </div>
                                )}
                            </Flex>
                        );
                    }}
                </Field>
            )}
        </Flex>
    );
};

export default AmountField;
