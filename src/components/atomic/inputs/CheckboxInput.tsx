import React from 'react';

import { Checkbox as AntCheckbox, Flex, Form } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { Field, FieldProps, getIn } from 'formik';

interface CheckboxProps {
    name: string;
    children?: React.ReactNode;
    checked?: boolean;
    disabled?: boolean;
    onChange?: (e: CheckboxChangeEvent) => void;
    classes?: string;
    isRequired?: boolean;
}

const CheckboxInput: React.FC<CheckboxProps> = ({
    name,
    children,
    checked,
    disabled,
    onChange,
    classes,
    isRequired,
}) => (
    <Field name={name}>
        {({ field, form: { touched, errors } }: FieldProps) => (
            <Form.Item
                validateStatus={getIn(touched, name) && getIn(errors, name) ? 'error' : ''}
                help={getIn(touched, name) && getIn(errors, name) ? (getIn(errors, name) as React.ReactNode) : undefined}
                required={isRequired}
            >
                <Flex align="flex-start">
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <AntCheckbox
                            {...field}
                            id={`${name}-checkbox`}
                            checked={checked ?? field.value}
                            disabled={disabled}
                            required={isRequired}
                            onChange={e => {
                                field.onChange(e);
                                if (onChange) {
                                    onChange(e);
                                }
                            }}
                            className={classes}
                        />
                        <label
                            htmlFor={`${name}-checkbox`}
                            style={{ marginLeft: 8 }}
                            className="cursor-pointer"
                        >
                            {children}
                        </label>
                    </div>
                </Flex>
            </Form.Item>
        )}
    </Field>
);

export default CheckboxInput;
