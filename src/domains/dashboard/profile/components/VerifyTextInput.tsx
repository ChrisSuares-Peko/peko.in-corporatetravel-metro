import React from 'react';

import { CheckCircleFilled, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Flex, Form, Input, Typography, Spin } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { Field, FieldProps } from 'formik';

interface TextInputProps {
    name: string;
    label?: string;
    placeholder?: string;
    type: string;
    size?: SizeType;
    isDisabled?: boolean;
    isRequired?: boolean;
    classes?: string;
    formItemClass?: string;
    addonBefore?: any;
    addonAfter?: any;
    showToolTip?: boolean;
    tooltipText?: string;
    suffix?: any;
    prefix?: any;
    maxLength?: number;
    minLength?: number;
    allowNumbersOnly?: boolean;
    allowDecimalsOnly?: boolean;
    allowAlphabetsAndSpaceOnly?: boolean;
    allowAlphabetsAndNumbersOnly?: boolean;
    allowAlphabetsSpaceAndNumbersOnly?: boolean;
    onVerify?: () => void;
    verifyText: string;
    isVerified?: boolean;
    valueInDB?: string;
    convertToUppercase?: boolean;
    loading?: boolean;
    handleChange?: (value: string) => void;
}

const VerifyTextInput: React.FC<TextInputProps> = ({
    name,
    label,
    placeholder,
    type,
    size,
    isDisabled,
    isRequired,
    addonBefore,
    addonAfter,
    classes,
    formItemClass,
    showToolTip = false,
    tooltipText,
    suffix,
    maxLength,
    minLength,
    allowNumbersOnly = false,
    allowDecimalsOnly = false,
    allowAlphabetsAndSpaceOnly = false,
    allowAlphabetsAndNumbersOnly = false,
    allowAlphabetsSpaceAndNumbersOnly = false,
    prefix,
    onVerify,
    verifyText,
    isVerified,
    handleChange,
    valueInDB,
    convertToUppercase = false,
    loading = false, // Default to false
}) => {
    const getVerifyStatus = () => {
        if (isVerified) {
            return (
                <CheckCircleFilled
                    style={{ color: '#21AD64', fontSize: '15px', marginLeft: '8px' }}
                />
            );
        }
        if (valueInDB) {
            return (
                <Typography.Link
                    style={{
                        marginLeft: '8px',
                        color: '#ffa200',
                        fontSize: 'small',
                        cursor: 'default',
                    }}
                >
                    Pending
                </Typography.Link>
            );
        }
        return (
            <Typography.Link
                onClick={loading ? undefined : onVerify} // Disable clicking when loading
                style={{
                    marginLeft: '8px',
                    color: loading ? '#bfbfbf' : '#FF4D4F', // Grey color when loading
                    fontSize: 'small',
                    cursor: loading ? 'not-allowed' : 'pointer',
                }}
            >
                {loading ? (
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 12 }} spin />} />
                ) : (
                    'Verify'
                )}
            </Typography.Link>
        );
    };
    return (
        <Field name={name}>
            {({ field, form: { touched, errors, setFieldValue } }: FieldProps) => (
                <Form.Item
                    label={
                        <Flex justify="start" align="center">
                            <span>{label}</span>
                            {getVerifyStatus()}
                        </Flex>
                    }
                    required={isRequired}
                    validateStatus={
                        (touched[name] && errors[name]) || errors[verifyText] ? 'error' : ''
                    }
                    help={
                        (touched[name] && errors[name]) || errors[verifyText]
                            ? (errors[name] as React.ReactNode) ||
                              (errors[verifyText] as React.ReactNode)
                            : undefined
                    }
                    {...(showToolTip && {
                        tooltip: {
                            title: tooltipText,
                            color: 'white',
                            placement: 'right',
                            icon: <InfoCircleOutlined />,
                            overlayInnerStyle: {
                                color: '#171717',
                            },
                            overlayStyle: {
                                minWidth: 300,
                            },
                        },
                    })}
                    className={formItemClass}
                >
                    <Input
                        {...field}
                        maxLength={maxLength}
                        minLength={minLength}
                        type={type}
                        size={size ?? 'middle'}
                        placeholder={placeholder}
                        disabled={isDisabled}
                        className={classes}
                        addonBefore={addonBefore}
                        addonAfter={addonAfter}
                        suffix={suffix}
                        prefix={prefix}
                        onChange={e => {
                            let { value } = e.target;
                            if (convertToUppercase) {
                                value = value.toUpperCase();
                            }

                            let filteredValue = value;
                            if (allowNumbersOnly) {
                                filteredValue = value.replace(/[^\d]/g, '');
                            }
                            if (allowDecimalsOnly) {
                                filteredValue = value
                                    .replace(/[^0-9.]/g, '')
                                    .replace(/(\..*?)\..*/g, '$1');
                            }
                            if (allowAlphabetsAndSpaceOnly) {
                                filteredValue = value.replace(/[^a-zA-Z ]/g, '');
                            }
                            if (allowAlphabetsAndNumbersOnly) {
                                filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
                            }
                            if (allowAlphabetsSpaceAndNumbersOnly) {
                                filteredValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
                            }
                            setFieldValue(name, filteredValue);
                            setFieldValue(verifyText, false);
                            setFieldValue(name, filteredValue);
                            if (handleChange) handleChange(e.target.value);
                        }}
                    />
                </Form.Item>
            )}
        </Field>
    );
};

export default VerifyTextInput;
