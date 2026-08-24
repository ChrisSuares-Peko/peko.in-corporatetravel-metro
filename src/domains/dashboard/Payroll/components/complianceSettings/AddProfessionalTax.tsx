import React from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Row, Form, Typography, InputNumber } from 'antd';
import { FieldArray, FieldArrayRenderProps, Formik, FormikErrors } from 'formik';
import { ReactSVG } from 'react-svg';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import add from '@domains/dashboard/Invoice/assets/add.svg';

import useAddTaxSettingsApi from '../../hooks/complianceSettings/useAddTaxSettingsApi';
import { payrollPTSchema } from '../../schema/EmployeeSalary';
import { IncomeSlab, TaxPayload } from '../../types/complianceSettings/complianceSettingsType';
import InfoCard from '../organizationSettings/InfoCard';

type ProfessionalTaxFormProps = {
    complianceData?: any;
    settingsId?: string;
};
type FormValues = {
    ptNumber: string;
    deductionCycle: string;
    incomeSlabs: {
        incomeStartRange: string;
        incomeEndRange: string;
        taxAmount: string;
    }[];
};

const AddProfessionalTax: React.FC<ProfessionalTaxFormProps> = ({ complianceData, settingsId }) => {
   

    const dropdwonOptions = [
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Quarterly', value: 'Quarterly' },
        { label: 'Half-Yearly', value: 'Half-Yearly' },
        { label: 'Yearly', value: 'Yearly' },
    ];

    const { handleSaveTaxData ,isLoading} = useAddTaxSettingsApi();

    const mappedIncomeSlabs = complianceData?.incomeSlabs?.length
        ? complianceData.incomeSlabs.map((slab: any) => ({
              incomeStartRange: slab.incomeStartRange || '',
              incomeEndRange: slab.incomeEndRange || '',
              taxAmount: slab.taxAmount || '',
          }))
        : [{ incomeStartRange: '', incomeEndRange: '', taxAmount: '' }];

    return(
        <Flex vertical gap={20} className="pt-6">
            <Formik<FormValues>
                initialValues={{
                    ptNumber: complianceData?.ptNumber || '',
                    deductionCycle: complianceData?.deductionCycle || 'Monthly',
                    incomeSlabs: mappedIncomeSlabs,
                }}
                enableReinitialize
                validationSchema={payrollPTSchema}
                onSubmit={async (values, { resetForm }) => {
                    const transformedValues: TaxPayload = {
                        ptNumber: values.ptNumber,
                        deductionCycle: values.deductionCycle,
                        incomeSlabs: values.incomeSlabs.map(slab => ({
                            incomeStartRange: Number(slab.incomeStartRange), // Convert to number
                            incomeEndRange: Number(slab.incomeEndRange), // Convert to number
                            taxAmount: Number(slab.taxAmount), // Convert to number
                        })),
                    };
                    await handleSaveTaxData(transformedValues);
                }}
            >
                {({ handleSubmit, setFieldValue, values, errors, touched }) => (
                    <Form layout="vertical" onFinish={handleSubmit}>
                        <Row gutter={[80, 0]}>
                            <Col xs={24} md={16}>
                                <Flex vertical>
                                    <Row gutter={[16, 0]}>
                                        <Col sm={24} md={12}>
                                            <TextInput
                                                name="ptNumber"
                                                placeholder="Enter PT number"
                                                label="PT Number"
                                                type="text"
                                                classes="w-full"
                                                // allowNumbersAndDots
                                                isRequired
                                                allowNumbersOnly
                                                maxLength={15}
                                            />
                                        </Col>
                                        <Col sm={24} md={12}>
                                            <SelectInput
                                                name="deductionCycle"
                                                placeholder="Select deduction cycle"
                                                label="Deduction Cycle"
                                                options={dropdwonOptions}
                                                classes="w-full"
                                                isRequired
                                                isDisabled
                                            />
                                        </Col>
                                    </Row>

                                    {/* Income slab headers */}
                                    <Row className="mt-8 bg-[#F5F5F5] p-3" gutter={[20, 0]}>
                                        <Col xs={24} md={8}>
                                            <Typography.Text>
                                                Income Start Range (₹)
                                            </Typography.Text>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Typography.Text>Income End Range (₹)</Typography.Text>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Typography.Text>Tax Amount (₹)</Typography.Text>
                                        </Col>
                                    </Row>

                                    {/* Slab input fields */}
                                    <FieldArray name="incomeSlabs">
                                        {({ push, remove }: FieldArrayRenderProps) => (
                                            <>
                                                {values.incomeSlabs.map(
                                                    (slab: any, index: number) => (
                                                        <Row
                                                            key={index}
                                                            gutter={[16, 0]}
                                                            align="middle"
                                                            className="mt-4"
                                                        >
                                                            <Col xs={24} md={7}>
                                                                <InputNumber
                                                                    className="w-full"
                                                                    min={0}
                                                                    placeholder="Start range"
                                                                    value={slab.incomeStartRange}
                                                                    onChange={value => {
                                                                        setFieldValue(
                                                                            `incomeSlabs[${index}].incomeStartRange`,
                                                                            value
                                                                        );
                                                                        if (!value) {
                                                                            // Clear End Range and Tax Amount when Start Range is cleared
                                                                            setFieldValue(
                                                                                `incomeSlabs[${index}].incomeEndRange`,
                                                                                ''
                                                                            );
                                                                            setFieldValue(
                                                                                `incomeSlabs[${index}].taxAmount`,
                                                                                ''
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                                {errors.incomeSlabs &&
                                                                    (errors.incomeSlabs[
                                                                        index
                                                                    ] as FormikErrors<IncomeSlab>) &&
                                                                    (
                                                                        errors.incomeSlabs[
                                                                            index
                                                                        ] as FormikErrors<IncomeSlab>
                                                                    ).incomeStartRange &&
                                                                    touched.incomeSlabs &&
                                                                    touched.incomeSlabs[index] && (
                                                                        <div
                                                                            style={{ color: 'red' }}
                                                                        >
                                                                            {
                                                                                (
                                                                                    errors
                                                                                        .incomeSlabs[
                                                                                        index
                                                                                    ] as FormikErrors<IncomeSlab>
                                                                                ).incomeStartRange
                                                                            }
                                                                        </div>
                                                                    )}
                                                            </Col>
                                                            <Col xs={24} md={7}>
                                                                <InputNumber
                                                                    className="w-full"
                                                                    min={0}
                                                                    placeholder="End range"
                                                                    value={slab.incomeEndRange}
                                                                    onChange={value =>
                                                                        setFieldValue(
                                                                            `incomeSlabs[${index}].incomeEndRange`,
                                                                            value
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !slab.incomeStartRange
                                                                    }
                                                                />
                                                                {errors.incomeSlabs &&
                                                                    (errors.incomeSlabs[
                                                                        index
                                                                    ] as FormikErrors<IncomeSlab>) &&
                                                                    (
                                                                        errors.incomeSlabs[
                                                                            index
                                                                        ] as FormikErrors<IncomeSlab>
                                                                    ).incomeEndRange &&
                                                                    touched.incomeSlabs &&
                                                                    touched.incomeSlabs[index] && (
                                                                        <div
                                                                            style={{ color: 'red' }}
                                                                        >
                                                                            {
                                                                                (
                                                                                    errors
                                                                                        .incomeSlabs[
                                                                                        index
                                                                                    ] as FormikErrors<IncomeSlab>
                                                                                ).incomeEndRange
                                                                            }
                                                                        </div>
                                                                    )}
                                                            </Col>
                                                            <Col xs={24} md={7}>
                                                                <InputNumber
                                                                    className="w-full"
                                                                    min={0}
                                                                    placeholder="Tax amount"
                                                                    value={slab.taxAmount}
                                                                    onChange={value =>
                                                                        
                                                                        setFieldValue(
                                                                            `incomeSlabs[${index}].taxAmount`,
                                                                            value
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !slab.incomeStartRange
                                                                    }
                                                                />
                                                                {errors.incomeSlabs &&
                                                                    (errors.incomeSlabs[
                                                                        index
                                                                    ] as FormikErrors<IncomeSlab>) &&
                                                                    (
                                                                        errors.incomeSlabs[
                                                                            index
                                                                        ] as FormikErrors<IncomeSlab>
                                                                    ).taxAmount &&
                                                                    touched.incomeSlabs &&
                                                                    touched.incomeSlabs[index] && (
                                                                        <div
                                                                            style={{ color: 'red' }}
                                                                        >
                                                                            {
                                                                                (
                                                                                    errors
                                                                                        .incomeSlabs[
                                                                                        index
                                                                                    ] as FormikErrors<IncomeSlab>
                                                                                ).taxAmount
                                                                            }
                                                                        </div>
                                                                    )}
                                                            </Col>
                                                            <Col xs={24} md={2}>
                                                                <Button
                                                                    icon={<CloseOutlined />}
                                                                    onClick={() => remove(index)}
                                                                    disabled={index === 0}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    )
                                                )}

                                                <Flex gap={3} className="mt-4">
                                                    <ReactSVG src={add} />
                                                    <Typography.Text
                                                        className="text-bgOrange2 cursor-pointer"
                                                        onClick={() =>
                                                            push({
                                                                incomeStartRange: '',
                                                                incomeEndRange: '',
                                                                taxAmount: '',
                                                            })
                                                        }
                                                    >
                                                        Additional Slab
                                                    </Typography.Text>
                                                </Flex>
                                            </>
                                        )}
                                    </FieldArray>

                                    <Flex className="mt-12">
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
                                </Flex>
                            </Col>

                            <Col xs={24} md={8} className="-mt-3">
                                <InfoCard
                                    title="Professional Tax"
                                    description="Professional Tax is a state-imposed tax on income. Employers are responsible for deducting it from employee salaries and depositing it with the state government. Correct PT setup ensures smooth and legal payroll processing."
                                />
                            </Col>
                        </Row>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
};

export default AddProfessionalTax;
