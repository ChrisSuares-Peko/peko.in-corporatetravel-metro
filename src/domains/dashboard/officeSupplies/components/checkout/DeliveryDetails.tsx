import React, { useState } from 'react';

import { Form, Row, Col, Flex, Select, Typography, Skeleton } from 'antd';
import { Formik } from 'formik';

import CheckboxInput from '@components/atomic/inputs/CheckboxInput';
import InputTextArea from '@components/atomic/inputs/InputTextArea';
import TextInput from '@components/atomic/inputs/TextInput';

import { useFetchAddressApi } from '../../hooks/useFetchAddressApi';
import useForm from '../../hooks/useForm';
import { addressSchema } from '../../schema/index';
import { AddressField } from '../../types/address';

const { Text } = Typography;

interface DeliveryDetailsProps {
    formRef: React.MutableRefObject<any>;
    setAddress: (address: AddressField) => void;
}

/** Delivery details card (Figma 2342-24561): GST/business info + contact + address. */
const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({ formRef, setAddress }) => {
    const { addressOptions, isLoading } = useFetchAddressApi();
    const [selectedAddress, setSelectedAddress] = useState<AddressField>();
    const { handleSubmission, data } = useForm();

    return isLoading ? (
        <Skeleton className="my-4" />
    ) : (
        <Flex
            vertical
            gap={20}
            className="w-full rounded-3xl bg-white p-6 drop-shadow-[0px_1.2px_6px_rgba(0,0,0,0.06)]"
        >
            <Text className="text-[18px] font-semibold leading-[26px] text-[#101828]">
                Delivery details
            </Text>

            <Flex vertical className="w-full">
                <Typography.Text className="pb-2">Saved Address</Typography.Text>
                <Select
                    showSearch
                    allowClear
                    placeholder="Select a person"
                    optionFilterProp="children"
                    onChange={value => {
                        const parsed: AddressField | undefined = value
                            ? JSON.parse(value)
                            : undefined;
                        setSelectedAddress(parsed);
                        // surface the pick to CheckoutList → OrderSummary (pincode for
                        // the pre-checkout ONDC seller validation)
                        if (parsed) setAddress(parsed);
                    }}
                    options={addressOptions}
                />
            </Flex>

            <Formik
                enableReinitialize
                initialValues={{
                    address: selectedAddress?.address ?? '',
                    phoneNumber: selectedAddress?.phoneNumber ?? '',
                    pincode: selectedAddress?.zipCode ?? '',
                    remarks: '',
                    contactName:
                        selectedAddress?.contactName ?? data?.contactPersonName ?? '',
                    businessName: selectedAddress?.businessName ?? data?.name ?? '',
                    gstin: '',
                    noGst: false,
                    saveAddress: false,
                }}
                innerRef={formRef}
                validationSchema={addressSchema}
                onSubmit={values =>
                    // firstName/lastName are legacy fields useForm (ONDC /init billing
                    // name) and the admin portal still read — keep them populated from
                    // the new single contactName input.
                    handleSubmission({ ...values, firstName: values.contactName, lastName: '' })
                }
            >
                {({ values, setFieldValue }) => (
                    <Form layout="vertical" className="w-full">
                        <CheckboxInput
                            name="noGst"
                            onChange={e => {
                                if (e.target.checked) setFieldValue('gstin', '');
                            }}
                        >
                            I don&apos;t have GST / unregistered business
                        </CheckboxInput>

                        <Row gutter={10}>
                            <Col xs={12}>
                                <TextInput
                                    name="businessName"
                                    label="Business name"
                                    placeholder="Enter business name"
                                    type="text"
                                    isRequired
                                />
                            </Col>
                            <Col xs={12}>
                                <TextInput
                                    name="gstin"
                                    label="GSTIN"
                                    placeholder="Enter GST Number"
                                    type="text"
                                    convertToUppercase
                                    allowAlphabetsAndNumbersOnly
                                    maxLength={15}
                                    isDisabled={values.noGst}
                                    isRequired={!values.noGst}
                                />
                            </Col>
                        </Row>
                        <Row gutter={10}>
                            <Col xs={12}>
                                <TextInput
                                    name="contactName"
                                    label="Contact name"
                                    placeholder="Enter contact name"
                                    type="text"
                                    allowAlphabetsAndSpaceOnly
                                    isRequired
                                />
                            </Col>
                            <Col xs={12}>
                                <TextInput
                                    name="phoneNumber"
                                    label="Mobile number"
                                    placeholder="Enter mobile number"
                                    type="text"
                                    allowNumbersOnly
                                    maxLength={12}
                                    isRequired
                                />
                            </Col>
                        </Row>
                        <InputTextArea
                            autoSize={{ minRows: 3 }}
                            name="address"
                            label="Delivery address"
                            placeholder="House no, Building name, Area, Colony"
                            isRequired
                        />
                        <Row gutter={10}>
                            <Col xs={12}>
                                <TextInput
                                    name="pincode"
                                    label="Pincode"
                                    placeholder="Enter delivery pincode"
                                    type="text"
                                    allowNumbersOnly
                                    maxLength={6}
                                    isRequired
                                />
                            </Col>
                        </Row>

                        {!selectedAddress && (
                            <CheckboxInput name="saveAddress">
                                Save this address for next time
                            </CheckboxInput>
                        )}

                        <Row gutter={10}>
                            <Col xs={12}>
                                <TextInput
                                    name="remarks"
                                    label="Remarks"
                                    placeholder="Enter remarks"
                                    type="text"
                                />
                            </Col>
                        </Row>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
};

export default DeliveryDetails;
