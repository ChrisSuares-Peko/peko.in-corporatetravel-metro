import React from 'react';

import { Button, Col, Flex, Form, Row, Skeleton } from 'antd';
import { Formik } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';

import useAddEpfSettingsApi from '../../hooks/complianceSettings/useAddEpfSettingsApi';
import useUpdateComplianceSettingsApi from '../../hooks/complianceSettings/useUpdateComplianceSettingsApi';
import { payrollEPFSchema } from '../../schema/EmployeeSalary';
import InfoCard from '../organizationSettings/InfoCard';

type EPFProps = {
    setActiveTabKey?: any;
    settingsId?: string;
    complianceData?: any;
};

const EPF: React.FC<EPFProps> = ({ setActiveTabKey, settingsId, complianceData }) => {
    const isLoading = false;
    // const [checked, setChecked] = useState(true);

    const dropdwonOptions = [
        { label: '12% of Basic Salary', value: '12% of Basic Salary' },
        {
            label: 'Restrict Contribution to ₹15000 of PF Wage',
            value: 'Restrict Contribution to ₹15000 of PF Wage',
        },
    ];

    const { handleSaveEpfData, nextStep } = useAddEpfSettingsApi();
    const { handleSettingsUpdate } = useUpdateComplianceSettingsApi();

    return isLoading ? (
        <Skeleton />
    ) : (
        <Flex vertical gap={20} className="pt-6">
            <Formik
                initialValues={{
                    epfNumber: complianceData?.epf?.epfNumber || '',
                    employerContributionRate: complianceData?.epf?.employerContributionRate || '',
                    enableProRatedPfWage: complianceData?.epf?.enableProRatedPfWage || true,
                    considerSalaryComponents: complianceData?.epf?.considerSalaryComponents || true,
                    employeeContributionRate: complianceData?.epf?.employeeContributionRate || '',
                }}
                enableReinitialize
                validationSchema={payrollEPFSchema}
                onSubmit={async (values, { resetForm }) => {
                    if (settingsId) {
                        await handleSettingsUpdate(values);
                    }
                    await handleSaveEpfData(values);
                    if (nextStep) setActiveTabKey('2');
                }}
            >
                {({ handleSubmit, isSubmitting, setFieldValue, values }) => (
                    <Form layout="vertical" onFinish={handleSubmit}>
                       
                        <Row gutter={[24, 24]}>
                            {/* Form Fields */}
                            <Col xs={24} md={16}>
                                <Row gutter={[20, 20]}>
                                    <Col xs={24} md={12}>
                                        <TextInput
                                            isRequired
                                            showToolTip
                                            tooltipText="EPF Number format: State/Region/Establishment Code/Extension/Employee Number (e.g., TN/MAS/0054321/000/0000456)"
                                            name="epfNumber"
                                            placeholder="Enter EPF number"
                                            label="EPF Number"
                                            type="text"
                                            allowAlphabetsNumberAndSpecialCharacters={['/']}
                                            convertToUppercase
                                            maxLength={30}
                                        />
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <SelectInput
                                            name="employeeContributionRate"
                                            placeholder="Select employee contribution rate"
                                            label="Employee Contribution Rate"
                                            options={dropdwonOptions}
                                            isRequired
                                        />
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <SelectInput
                                            name="employerContributionRate"
                                            placeholder="Select employer contribution rate"
                                            label="Employer Contribution Rate"
                                            options={dropdwonOptions}
                                            isRequired
                                        />
                                    </Col>
                                </Row>
                                <Flex className="">
                                    <Button
                                        className="px-4 mr-4"
                                        type="primary"
                                        danger
                                        htmlType="submit"
                                    >
                                        Save
                                    </Button>
                                    <Button type="default" htmlType="button" className="px-4">
                                        Cancel
                                    </Button>
                                </Flex>
                            </Col>
                            <Col xs={24} md={8}>
                                <InfoCard
                                    title="Why Is EPF Important?"
                                    description={`EPF ensures that employees save a portion of their salary every month for future financial security, such as retirement or emergencies.

As an employer, setting up EPF is legally required for companies with more than 20 employees and helps you stay compliant with Indian labor laws.

Once configured, contributions are automatically calculated and deducted during payroll processing, ensuring accuracy and peace of mind.`}
                                />
                            </Col>{' '}
                        </Row>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
};

export default EPF;
