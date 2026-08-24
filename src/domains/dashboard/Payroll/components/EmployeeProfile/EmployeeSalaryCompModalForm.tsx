import React from 'react';

import { Form } from 'antd';
import { useFormikContext } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';

import { useGetEmployeeSalaryComponent } from '../../hooks/OrganizationSettings/useGetEmployeeCurrentSalaryCompApi';
import { salaryAmountCategories, salaryCompStatus } from '../../utils/orgSettings/data';

interface SalaryComponent {
    id: string;
    componentName: string;
    calculationType: 'FIXED' | 'PERCENTAGE';
    calculationBasedOn?: string;
    amountPercentage?: string | number;
    status: string;
    isGlobal?: boolean;
}

interface SalaryCompFormProps {
    selectedRecordData?: SalaryComponent | null;
}

const EmployeeSalaryCompModalForm = ({ selectedRecordData }: SalaryCompFormProps) => {
    const { values, setFieldValue } = useFormikContext<any>();
    const { data, generateEmployeeSalaryCompDropdown } = useGetEmployeeSalaryComponent();
    
    const filteredCalculationBasisOptions = React.useMemo(() => {
        const options = generateEmployeeSalaryCompDropdown(data) || [];

        if (!selectedRecordData?.componentName) {
            return options;
        }

        const selectedName = selectedRecordData.componentName.toLowerCase();

        return options.filter(option => {
            const optionValue = option.label?.toLowerCase();
            const isMatch = optionValue === selectedName;
            return !isMatch;
        });
    }, [data, selectedRecordData, generateEmployeeSalaryCompDropdown]);

    const isBasicSalary = values.componentName?.trim().toLowerCase() === 'basic salary';
    
    return (
        <Form layout="vertical">
            <TextInput
                name="componentName"
                type="text"
                placeholder="Enter component name"
                label="Component Name"
                isRequired
                maxLength={50}
                isDisabled={isBasicSalary}
                allowAlphabetsAndSpaceOnly
            />

            <SelectInput
                name="calculationType"
                options={salaryAmountCategories || []}
                placeholder="Select calculation type"
                label="Calculation Type"
                isRequired
                isDisabled={isBasicSalary}
                handleChange={(value: string) => {
                    setFieldValue('calculationType', value);
                    setFieldValue('amountPercentage', '');
                    setFieldValue('calculationBasis', '');
                }}
            />
            {values.calculationType === 'FIXED' && (
                <TextInput
                    name="amountPercentage"
                    type="text"
                    placeholder="Enter amount "
                    label="Amount"
                    isRequired
                    allowTwoDecimalsOnly
                    maxLength={10}
                />
            )}
            {values.calculationType === 'PERCENTAGE' && (
                <TextInput
                    name="amountPercentage"
                    type="text"
                    placeholder="Enter percentage "
                    label="Percentage"
                    isRequired
                    allowTwoDecimalsOnly
                    maxLength={6}
                />
            )}
            {values.calculationType === 'PERCENTAGE' && (
                <SelectInput
                    name="calculationBasedOn"
                    isDisabled={isBasicSalary}
                    options={filteredCalculationBasisOptions}
                    placeholder="Select calculation basis"
                    label="Calculation Basis"
                    isRequired
                />
            )}

            <SelectInput
                name="status"
                options={salaryCompStatus || []}
                placeholder="Select status"
                label="Status"
                isRequired
                isDisabled={values.componentName === 'Basic Salary'}
            />
        </Form>
    );
};

export default EmployeeSalaryCompModalForm;