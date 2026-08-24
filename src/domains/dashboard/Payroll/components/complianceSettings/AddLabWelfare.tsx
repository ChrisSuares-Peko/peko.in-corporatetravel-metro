import React from 'react';

import { Button, Col, Flex, Form, Row, Typography } from 'antd';
import { Formik } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';

import useAddLabWelfareFundApi from '../../hooks/complianceSettings/useAddTLabWelfareFundApi';
import { labWelfareSchema } from '../../schema/EmployeeSalary';
import InfoCard from '../organizationSettings/InfoCard';

// import { payrollSettingsSchema } from '../../schema/hrSettings';

type ESIProps = {
    setActiveTabKey?: any;
    data: any;
};

const AddLabWelfare: React.FC<ESIProps> = ({ setActiveTabKey, data }) => {
    const dropdwonOptions = [
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Quarterly', value: 'Quarterly' },
        { label: 'Half-Yearly', value: 'Half-Yearly' },
        { label: 'Yearly', value: 'Yearly' },
    ];
    const { handleSaveLabourData,isLoading } = useAddLabWelfareFundApi();

    return (
        <Flex vertical gap={20} className="">
            <Typography.Text className="font-medium text-base">Labor Welfare Fund</Typography.Text>
            <Typography.Text type="secondary">
                Labor Welfare Fund act ensures social security and improves working conditions for
                employees.
            </Typography.Text>
            <Formik
                initialValues={{
                    deductionCycle: data?.deductionCycle || 'Monthly',
                    employeeContribution: data?.employeeContribution || 0,
                    employerContribution: data?.employerContribution || 0,
                }}
                enableReinitialize
                validationSchema={labWelfareSchema}
                onSubmit={async (values, { resetForm }) => {
                    console.log('values', values);
                    await handleSaveLabourData(values);

                    // setActiveTabKey('2');
                }}
            >
                {({ handleSubmit, isSubmitting, setFieldValue, values }) => (
                    <Form layout="vertical" onFinish={handleSubmit}>
                        <Row gutter={[80, 0]}>
                            {/* Left Side: Form Fields */}
                            <Col xs={24} md={16}>
                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <SelectInput
                                            name="deductionCycle"
                                            placeholder="Select deduction cycle"
                                            label="Deduction Cycle"
                                            options={dropdwonOptions}
                                            classes="w-1/2"
                                            formItemClass="w-1/2"
                                            isDisabled
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <TextInput
                                            name="employeeContribution"
                                            placeholder="Enter employees contribution"
                                            label="Employees Contribution"
                                            type="text"
                                            classes="w-1/2"
                                            allowTwoDecimalsOnly
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <TextInput
                                            name="employerContribution"
                                            placeholder="Enter employer's contribution"
                                            label="Employer Contribution"
                                            type="text"
                                            classes="w-1/2"
                                            allowTwoDecimalsOnly
                                        />
                                    </Col>
                                </Row>

                                {/* Buttons */}
                                <Flex className="mt-8">
                                    <Button
                                        className="px-4 mr-4"
                                        type="primary"
                                        danger
                                        htmlType="submit"
                                        loading={isLoading}
                                    >
                                        Save
                                    </Button>
                                    <Button type="default" htmlType="button" className="px-4">
                                        Cancel
                                    </Button>
                                </Flex>
                            </Col>

                            {/* Right Side: Info Card */}
                            <Col xs={24} md={8}>
                                <InfoCard
                                    title="The Labor Welfare Fund"
                                    description="The Labor Welfare Fund provides financial assistance to employees for housing, medical needs, education, and other welfare measures. Contributions are mandatory in certain states and are used to improve employee well-being and working conditions."
                                />
                            </Col>
                        </Row>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
};

export default AddLabWelfare;
