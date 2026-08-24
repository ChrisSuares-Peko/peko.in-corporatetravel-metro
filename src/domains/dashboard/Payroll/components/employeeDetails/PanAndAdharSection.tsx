import React, { useState } from 'react';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Form, Row, Col, Typography, Flex, Button } from 'antd';
import { Formik } from 'formik';
import { StringSchema } from 'yup';

import TextInput from '@components/atomic/inputs/TextInput';
import OtpModal from '@components/molecular/modals/OtpModal';

import usePanVerifyApi from '../../hooks/employeeHooks/usePanVerifyApi';
import { validationSchema } from '../../schema/employee/panAdharschema';

type Props = {
    employeeId?: string;
    panNumber?: string;
    aadhaarNumber?: string;
    setRefState: (num: number) => void;
};

const PanAndAdharSection: React.FC<Props> = ({
    employeeId,
    panNumber,
    aadhaarNumber,
    setRefState,
}) => {
    const {
        isLoading,
        getPan,
        sendAadhaarOtp,
        isAadharLoading,
        isPanVerified,
        otpSending,
        verifyAadhaarOtp,
    } = usePanVerifyApi(employeeId!);

    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpRefId, setOtpRefId] = useState<string | null>(null);
    const [currentAadhaar, setCurrentAadhaar] = useState<string>('');

    const handleOtpSubmit = async (otp: string) => {
        if (!otpRefId) return; // safety check

        try {
            // call the verify OTP function from your hook
            const isVerified = await verifyAadhaarOtp(otp, otpRefId, currentAadhaar);

            // show success, close modal, etc.
            setIsOtpModalOpen(false);
            if (isVerified) {
                setIsOtpModalOpen(false);
                setRefState(new Date().valueOf());
            }
        } catch (error) {
            console.error('OTP verification failed', error);
            // optionally show a toast
        }
    };

    return (
        <Row>
            <Formik
                initialValues={{
                    panNumber: panNumber || '',
                    aadhaarNumber: aadhaarNumber || '',
                }}
                validationSchema={validationSchema}
                onSubmit={values => {
                    // Handle form submission
                }}
                enableReinitialize
            >
                {({ values, errors, validateField, setFieldTouched }) => (
                    <Form layout="vertical">
                        <Row>
                            <Typography.Text className="text-base font-medium mt-8">
                                PAN & Aadhar Information
                            </Typography.Text>
                            <Col span={24} className="mt-8">
                                <Flex className="w-full" justify="space-between" gap={10}>
                                    <TextInput
                                        label={
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                }}
                                            >
                                                {panNumber ? 'PAN Number (Verified)' : 'PAN Number'}
                                                {panNumber && (
                                                    <CheckCircleOutlined className="text-green-500 ml-2" />
                                                )}
                                            </span>
                                        }
                                        placeholder="Enter PAN"
                                        type="text"
                                        name="panNumber"
                                        classes="w-full"
                                        isRequired
                                        formItemClass="w-full"
                                        allowUpperCaseOnly
                                        maxLength={10}
                                        isDisabled={!!panNumber || isPanVerified}
                                    />

                                    <Button
                                        danger
                                        disabled={!!panNumber || isPanVerified}
                                        className="mt-7"
                                        // disabled={!values.panNumber || !!errors.panNumber || isPanVerified}
                                        loading={isLoading}
                                        onClick={async () => {
                                            const panFieldSchema = validationSchema.fields
                                                .panNumber as StringSchema;
                                            await panFieldSchema.validate(values.panNumber);
                                            getPan(values.panNumber);
                                        }}
                                    >
                                        {panNumber ? 'Verified' : 'Verify'}
                                    </Button>
                                </Flex>
                            </Col>
                            <Col span={24}>
                                <Flex className="w-full" justify="space-between" gap={10}>
                                    <TextInput
                                        label={
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                }}
                                            >
                                                {aadhaarNumber
                                                    ? 'Aadhaar Number (Verified)'
                                                    : 'Aadhaar Number'}
                                                {aadhaarNumber && (
                                                    <CheckCircleOutlined
                                                        style={{ color: 'green', fontSize: 16 }}
                                                    />
                                                )}
                                            </span>
                                        }
                                        placeholder="Enter Aadhaar number"
                                        type="text"
                                        name="aadhaarNumber"
                                        classes="w-full"
                                        formItemClass="w-full"
                                        maxLength={12}
                                        isRequired
                                        allowNumbersOnly
                                        isDisabled={!!aadhaarNumber || isAadharLoading}
                                    />

                                    <Button
                                        danger
                                        disabled={!!aadhaarNumber}
                                        loading={isAadharLoading}
                                        className="mt-7"
                                        onClick={async () => {
                                            try {
                                                // mark field touched so error UI shows
                                                await setFieldTouched('aadhaarNumber', true, true);

                                                // validate ONLY aadhaar using yup
                                                const aadhaarSchema = validationSchema.fields
                                                    .aadhaarNumber as StringSchema;

                                                await aadhaarSchema.validate(values.aadhaarNumber);

                                                //  only reaches here if valid
                                                const ref_id = await sendAadhaarOtp(
                                                    values.aadhaarNumber
                                                );
                                                setOtpRefId(ref_id);
                                                setCurrentAadhaar(values.aadhaarNumber);
                                                setIsOtpModalOpen(true);
                                            } catch (err) {
                                                console.error('Validation error:', err);
                                            }
                                        }}
                                    >
                                        {aadhaarNumber ? 'Verified' : 'Verify'}
                                    </Button>
                                </Flex>
                            </Col>
                        </Row>
                    </Form>
                )}
            </Formik>
            <OtpModal
                isOpen={isOtpModalOpen}
                handleCancel={() => setIsOtpModalOpen(false)}
                title="Enter OTP"
                handleSubmit={handleOtpSubmit}
                isLoading={otpSending}
            />
        </Row>
    );
};

export default PanAndAdharSection;
