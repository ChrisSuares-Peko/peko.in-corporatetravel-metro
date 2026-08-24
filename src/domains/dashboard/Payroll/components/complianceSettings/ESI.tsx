import React from 'react';

import { Alert, Button, Col, Flex, Form, Row, Typography } from 'antd';
import { Formik } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';

import useAddEsiSettings from '../../hooks/complianceSettings/useAddEsiSettings';
import useUpdateComplianceSettingsApi from '../../hooks/complianceSettings/useUpdateComplianceSettingsApi';
import { payrollEsiSchema } from '../../schema/EmployeeSalary';
import InfoCard from '../organizationSettings/InfoCard';

// import { payrollSettingsSchema } from '../../schema/hrSettings';

type ESIProps = {
    setActiveTabKey?: any;
    settingsId?: string;
    complianceData?: any;
};

const ESI: React.FC<ESIProps> = ({ setActiveTabKey, settingsId, complianceData }) => {
    const dropdwonOptions = [
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Quarterly', value: 'Quarterly' },
        { label: 'Half-Yearly', value: 'Half-Yearly' },
        { label: 'Yearly', value: 'Yearly' },
    ];
    const { handleSaveEsiData, isLoading } = useAddEsiSettings();
    const { handleSettingsUpdate, isLoading: updateLoading } = useUpdateComplianceSettingsApi();

    return (
        <Flex vertical gap={20} className="pt-6">
            <Formik
                initialValues={{
                    esiNumber: complianceData?.esi?.esiNumber || '',
                    deductionCycle: complianceData?.esi?.deductionCycle || 'Monthly',
                    employeeContribution: complianceData?.esi?.employeeContribution || '.75%',
                    employerContribution: complianceData?.esi?.employerContribution || '3.25%',
                }}
                enableReinitialize
                validationSchema={payrollEsiSchema}
                onSubmit={async (values, { resetForm }) => {
                    const processedValues = {
                        ...values,
                        employeeContribution:
                            parseFloat(values.employeeContribution.replace('%', '')) / 100,
                        employerContribution:
                            parseFloat(values.employerContribution.replace('%', '')) / 100,
                    };

                    if (complianceData?.esi?.esiNumber) {
                        await handleSettingsUpdate(processedValues);
                    }
                    await handleSaveEsiData(processedValues);

                    setActiveTabKey('2');
                }}
            >
                {({ handleSubmit, isSubmitting, setFieldValue, values }) => (
                    <Form layout="vertical" onFinish={handleSubmit}>
                        <Row gutter={[20, 0]}  justify="space-between">
                            <Col md={14}>
                                <Row className="w-full">
                                    <Col md={12} xs={24}>
                                        <TextInput
                                            name="esiNumber"
                                            placeholder="Enter ESI number"
                                            label="ESI Number"
                                            type="text"
                                            classes="w-full md:w-[18rem]"
                                            allowNumbersOnly
                                            isRequired
                                            maxLength={17}
                                        />
                                    </Col>
                                    <Col md={6} xs={24}>
                                        <SelectInput
                                            name="deductionCycle"
                                            placeholder="Select deduction cycle"
                                            label="Deduction Cycle"
                                            options={dropdwonOptions}
                                            classes="w-full md:w-[18rem]"
                                            isRequired
                                            isDisabled
                                        />
                                    </Col>
                                    <Col md={24} xs={24}>
                                        <Flex gap={40} className="mt-4 xs:text-nowrap">
                                            <TextInput
                                                name="employeeContribution"
                                                placeholder="0.75%"
                                                label="Employees Contribution"
                                                type="text"
                                                classes="w-full md:w-[18rem]"
                                                allowNumbersAndDots
                                                isRequired
                                                isDisabled
                                            />
                                            <Typography.Text className="mt-9 pl-4">
                                                of Gross Pay
                                            </Typography.Text>
                                        </Flex>
                                    </Col>

                                    <Col md={24}>
                                        <Flex gap={40} className="mt-4 xs:text-nowrap">
                                            <TextInput
                                                name="employerContribution"
                                                // placeholder="3.25%"
                                                label="Employers Contribution"
                                                type="text"
                                                classes="w-full md:w-[18rem]"
                                                allowNumbersAndDots
                                                isRequired
                                                isDisabled
                                            />
                                            <Typography.Text className="mt-9 pl-4">
                                                of Gross Pay
                                            </Typography.Text>
                                        </Flex>
                                    </Col>
                                    <Col md={20}>
                                        <Alert
                                            className="mt-8 mb-3 items-start"
                                            type="warning"
                                            showIcon
                                            message={
                                                <Flex align="start" vertical>
                                                    <Typography.Text>
                                                        <b>Note:</b> If an employee initially earning ₹21,000 or less gets a salary hike that pushes their salary above ₹21,000, ESI contributions do not stop immediately. Instead, contributions will continue until the end of the ongoing contribution period.
                                                    </Typography.Text>
                                                    <Typography.Text className="mt-2">
                                                        <b>The contribution periods are:</b>
                                                        <br />April to September (first half of the financial year)
                                                        <br />October to March (second half of the financial year)
                                                    </Typography.Text>
                                                    <Typography.Text className="mt-2">
                                                        <b>For example:</b>
                                                        <br />
                                                        If an employee’s salary is increased in July, they will still contribute to ESI until September. Similarly, if the hike occurs in December, they will contribute until March.
                                                    </Typography.Text>
                                                </Flex>
                                            }
                                        />
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={10} xs={24}>
                                <InfoCard
                                    title="Why Is ESI Required?"
                                    link="https://www.esic.gov.in/benefits"
                                    description={`Employees’ State Insurance (ESI) is a social security scheme that provides medical and financial benefits to employees. It is legally required for employees earning ₹21,000 or less. Once set up, contributions are automatically calculated and deducted during payroll processing.

Add Learn More button with link to`}
                                />
                            </Col>
                            <Row className="">
                                {/* <Flex vertical className="">
                                    <Alert
                                        className="mt-8 mb-3"
                                        message="Note: If an employee initially earning ₹21,000 or less gets a salary hike that pushes their salary above ₹21,000, ESI contributions do not stop immediately. Instead, contributions will continue until the end of the ongoing contribution period.

The contribution periods are:
April to September (first half of the financial year)
October to March (second half of the financial year)

For example:
If an employee’s salary is increased in July, they will still contribute to ESI until September. Similarly, if the hike occurs in December, they will contribute until March."
                                        type="warning"
                                        showIcon
                                    />
                                </Flex> */}

                                <Flex className="mt-3">
                                    <Button
                                        className="px-4 mr-4"
                                        type="primary"
                                        danger
                                        htmlType="submit"
                                        loading={
                                            complianceData?.esi?.esiNumber
                                                ? updateLoading
                                                : isLoading
                                        }
                                    >
                                        Save
                                    </Button>
                                    <Button type="default" htmlType="button" className="px-4">
                                        Cancel
                                    </Button>
                                </Flex>
                            </Row>
                        </Row>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
};

export default ESI;
