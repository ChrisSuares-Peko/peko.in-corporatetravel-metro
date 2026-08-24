import React from 'react';

import { Button, Col, Flex, Form, Row, Skeleton, Typography } from 'antd';
import { Formik } from 'formik';

import FileUploadInput from '@components/atomic/inputs/FileUploadInput';
import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';

import useAddEpfSettingsApi from '../../hooks/complianceSettings/useAddEpfSettingsApi';
import useUpdateComplianceSettingsApi from '../../hooks/complianceSettings/useUpdateComplianceSettingsApi'; // Reusing existing hook
import { tdsSchema } from '../../schema/complianceSchema';
import { TdsSettingsPayload } from '../../types/complianceSettings/complianceSettingsType';

type TDSProps = {
    setActiveTabKey?: any;
    settingsId?: string;
    complianceData?: any;
};

const TDS: React.FC<TDSProps> = ({ setActiveTabKey, settingsId, complianceData }) => {
    const isLoading = false;

    const { handleSettingsUpdate } = useUpdateComplianceSettingsApi();
    const { handleSaveTdsData } = useAddEpfSettingsApi();

    return isLoading ? (
        <Skeleton />
    ) : (
        <Flex vertical gap={20} className="pt-6">
            <Formik
                initialValues={{
                    taxRegime: complianceData?.tds?.taxRegime || '',
                    assignedCommissioner: complianceData?.tds?.assignedCommissioner || '',
                    address: complianceData?.tds?.address || '',
                    bankName: complianceData?.tds?.bsr?.bankName || '',
                    bsrCode: complianceData?.tds?.bsr?.bsrCode || '',
                    name: complianceData?.tds?.authorizedSignatoryDetails?.name || '',
                    fathersName: complianceData?.tds?.authorizedSignatoryDetails?.fathersName || '',
                    signature: complianceData?.tds?.authorizedSignatoryDetails?.signature || '',
                    signatureFormat: '',
                    placeOfSigning:
                        complianceData?.tds?.authorizedSignatoryDetails?.placeOfSigning || '',
                }}
                enableReinitialize
                validationSchema={tdsSchema}
                validateOnChange
                onSubmit={async (values, { resetForm }) => {
                    if (settingsId) {
                        await handleSettingsUpdate(values);
                    }
                    const payload: TdsSettingsPayload = {
                        taxRegime: values.taxRegime,
                        assignedCommissioner: values.assignedCommissioner,
                        address: values.address,
                        bsr: {
                            bankName: values.bankName,
                            bsrCode: values.bsrCode,
                        },
                        authorizedSignatoryDetails: {
                            name: values.name,
                            fathersName: values.fathersName,
                            signature: values.signature,
                            placeOfSigning: values.placeOfSigning,
                        },
                    };
                    await handleSaveTdsData(payload);
                    setActiveTabKey('2');
                }}
            >
                {({ handleSubmit }) => (
                    <Form layout="vertical" onFinish={handleSubmit}>
                        <Flex vertical>
                            <Row>
                                <Col sm={24} md={6} className="mt-3">
                                    <SelectInput
                                        name="taxRegime"
                                        placeholder="Select tax regime"
                                        label="Tax Regime"
                                        options={[
                                            { label: 'Old Tax Regime', value: 'Old Tax Regime' },
                                            { label: 'New Tax Regime', value: 'New Tax Regime' },
                                        ]}
                                        classes="w-full md:w-[18rem]"
                                    />
                                </Col>
                            </Row>
                            <Typography.Text
                                className="font-medium mt-3"
                                style={{ fontSize: '1.2rem', marginBottom: '1rem' }}
                            >
                                CIT (Commissioner of Income Tax) TDS
                            </Typography.Text>

                            <Row gutter={[20, 0]}>
                                <Col sm={24} md={6} className="mt-3">
                                    <TextInput
                                        name="assignedCommissioner"
                                        placeholder="Enter Assigned Commissioner"
                                        label="Assigned Commissioner"
                                        type="text"
                                        allowAlphabetsOnly
                                        classes="w-full md:w-[18rem]"
                                    />
                                </Col>

                                <Col sm={24} md={6} className="mt-3">
                                    <TextInput
                                        name="address"
                                        placeholder="Enter Address"
                                        label="Address"
                                        type="text"
                                        classes="w-full md:w-[18rem]"
                                    />
                                </Col>
                            </Row>

                            <Typography.Text
                                className="font-medium"
                                style={{
                                    fontSize: '1.2rem',
                                    marginTop: '1.5rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                BSR Code of the Bank Branch
                            </Typography.Text>

                            <Row gutter={[20, 0]}>
                                <Col sm={24} md={6}>
                                    <TextInput
                                        name="bankName"
                                        placeholder="Enter Bank Name"
                                        label="Bank Name"
                                        type="text"
                                        allowAlphabetsOnly
                                        classes="w-full md:w-[18rem]"
                                    />
                                </Col>
                                <Col sm={24} md={6}>
                                    <TextInput
                                        name="bsrCode"
                                        placeholder="Enter BSR Code"
                                        label="BSR Code"
                                        type="text"
                                        allowNumbersOnly
                                        classes="w-full md:w-[18rem]"
                                    />
                                </Col>
                            </Row>

                            {/* Title for Authorized Signatory Section */}
                            <Typography.Text
                                className="font-medium text-sm "
                                style={{
                                    fontSize: '1.2rem',
                                    marginTop: '1.5rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                Authorized Signatory Details
                            </Typography.Text>

                            <Row gutter={[20, 0]}>
                                <Col sm={24} md={6} className="mt-3">
                                    <TextInput
                                        name="name"
                                        placeholder="Enter Authorized Signatory Name"
                                        label="Name"
                                        type="text"
                                        allowAlphabetsAndSpaceOnly
                                        classes="w-full md:w-[18rem] "
                                    />
                                </Col>
                                <Col sm={24} md={6} className="mt-3">
                                    <TextInput
                                        name="fathersName"
                                        placeholder="Enter Father's Name"
                                        label="Father's Name"
                                        type="text"
                                        allowAlphabetsAndSpaceOnly
                                        classes="w-full md:w-[18rem]"
                                    />
                                </Col>
                            </Row>

                            <Row gutter={[20, 0]}>
                                <Col sm={24} md={6}>
                                    <TextInput
                                        name="placeOfSigning"
                                        placeholder="Enter Place of Signing"
                                        label="Place of Signing"
                                        type="text"
                                        allowAlphabetsAndSpaceOnly
                                        classes="w-full md:w-[18rem]"
                                    />
                                </Col>
                                <Col sm={24} md={10}>
                                    <FileUploadInput
                                        name="signature"
                                        label="Signature"
                                        format="signatureFormat"
                                        showNotification
                                        showFileName
                                        allowedFileTypes={['image/png']}
                                        isRequired
                                        // classes="w-full"
                                        size="middle"
                                    />
                                </Col>
                            </Row>
                        </Flex>

                        <Flex className="mt-12">
                            <Button className="px-4 mr-4" type="primary" danger htmlType="submit">
                                Save
                            </Button>
                            <Button type="default" htmlType="button" className="px-4">
                                Cancel
                            </Button>
                        </Flex>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
};

export default TDS;
