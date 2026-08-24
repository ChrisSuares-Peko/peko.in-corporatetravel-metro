import { InfoCircleFilled, IdcardOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Typography } from 'antd';
import { Formik } from 'formik';

import TextInput from '@components/atomic/inputs/TextInput';

import { onboardingBankSchema } from '../../schema';

export interface BankValues {
    accountName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
}

interface BankStepProps {
    initialValues: BankValues;
    onContinue: (values: BankValues) => void | Promise<void>;
    onBack?: (values: BankValues) => void;
    onSkip: () => void;
}

const BankStep = ({ initialValues, onContinue, onBack, onSkip }: BankStepProps) => (
    <Formik
        initialValues={initialValues}
        validationSchema={onboardingBankSchema}
        onSubmit={values => onContinue(values)}
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
                                Bank Account Details
                            </Typography.Text>
                            <Typography.Text className="text-xs text-gray-500">
                                Your salary will be deposited to this account.
                            </Typography.Text>
                        </Flex>
                    </Flex>

                    <TextInput
                        name="accountName"
                        label="Account Holder Name"
                        type="text"
                        placeholder="Enter account holder name"
                        allowAlphabetsAndSpaceOnly
                        maxLength={100}
                        isRequired
                    />
                    <TextInput
                        name="bankName"
                        label="Bank Name"
                        type="text"
                        placeholder="Enter bank name"
                        allowAlphabetsAndSpaceOnly
                        maxLength={50}
                        isRequired
                    />
                    <TextInput
                        name="accountNumber"
                        label="Account Number"
                        type="text"
                        placeholder="Enter account number"
                        allowNumbersOnly
                        isRequired
                    />
                    <TextInput
                        name="ifscCode"
                        label="IFSC Code"
                        type="text"
                        placeholder="Enter IFSC code"
                        allowAlphabetsAndNumbersOnly
                        isRequired
                    />
                    <TextInput
                        name="upiId"
                        label="UPI ID (optional)"
                        type="text"
                        placeholder="Enter UPI ID"
                    />

                    <Flex align="center" gap={8} className="px-3 py-2 mt-1 rounded-lg bg-[#fffcf2]">
                        <InfoCircleFilled className="text-bgOrange2" />
                        <Typography.Text className="text-xs text-gray-600">
                            Bank details will be verified by HR before your first salary is
                            processed.
                        </Typography.Text>
                    </Flex>
                </Flex>

                <Button
                    type="primary"
                    block
                    htmlType="submit"
                    loading={isSubmitting}
                    className="h-12 mt-6 font-medium rounded-lg"
                >
                    Continue
                </Button>
                <Flex justify={onBack ? 'space-between' : 'flex-end'} className="mt-3">
                    {onBack && (
                        <Button
                            onClick={() => onBack?.(values)}
                            disabled={isSubmitting}
                            className="rounded-lg"
                        >
                            ← Back
                        </Button>
                    )}
                    <Button
                        type="text"
                        onClick={onSkip}
                        disabled={isSubmitting}
                        className="text-gray-500"
                    >
                        Skip for now
                    </Button>
                </Flex>
            </Form>
        )}
    </Formik>
);

export default BankStep;
