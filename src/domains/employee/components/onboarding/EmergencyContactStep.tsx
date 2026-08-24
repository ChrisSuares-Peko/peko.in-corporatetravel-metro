import { CheckCircleOutlined, IdcardOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Typography } from 'antd';
import { Formik } from 'formik';

import TextInput from '@components/atomic/inputs/TextInput';

import { onboardingEmergencySchema } from '../../schema';

export interface EmergencyValues {
    fullName: string;
    relationship: string;
    phone: string;
}

interface EmergencyContactStepProps {
    initialValues: EmergencyValues;
    onComplete: (values: EmergencyValues) => void | Promise<void>;
    onBack?: (values: EmergencyValues) => void;
}

const EmergencyContactStep = ({ initialValues, onComplete, onBack }: EmergencyContactStepProps) => (
    <Formik
        initialValues={initialValues}
        validationSchema={onboardingEmergencySchema}
        onSubmit={values => onComplete(values)}
    >
        {({ handleSubmit, isSubmitting, values }) => (
            <Form onFinish={handleSubmit} layout="vertical">
                <Flex
                    vertical
                    gap={4}
                    className="p-6 bg-white border border-solid border-[#f0f0f0] rounded-2xl"
                >
                    <Flex gap={12} className="mb-3">
                        <IdcardOutlined className="text-xl text-brandColor" />
                        <Flex vertical>
                            <Typography.Text className="font-semibold">
                                Emergency Contact
                            </Typography.Text>
                            <Typography.Text className="text-xs text-gray-500">
                                Provide a contact person we can reach in case of an emergency.
                            </Typography.Text>
                        </Flex>
                    </Flex>

                    <TextInput
                        name="fullName"
                        label="Full Name"
                        type="text"
                        placeholder="Contact person full name"
                        allowAlphabetsAndSpaceOnly
                        maxLength={50}
                        isRequired
                    />
                    <TextInput
                        name="relationship"
                        label="Relationship"
                        type="text"
                        placeholder="Enter relationship"
                        allowAlphabetsAndSpaceOnly
                        maxLength={50}
                    />
                    <TextInput
                        name="phone"
                        label="Phone Number"
                        type="text"
                        placeholder="10-digit mobile number"
                        allowNumbersOnly
                        maxLength={10}
                        isRequired
                    />
                </Flex>

                <Button
                    type="primary"
                    block
                    htmlType="submit"
                    loading={isSubmitting}
                    className="h-12 mt-6 font-medium rounded-lg"
                >
                    Complete Setup <CheckCircleOutlined />
                </Button>
                {onBack && (
                    <Button
                        onClick={() => onBack?.(values)}
                        block
                        disabled={isSubmitting}
                        className="mt-3 rounded-lg"
                    >
                        ← Back
                    </Button>
                )}
            </Form>
        )}
    </Formik>
);

export default EmergencyContactStep;
