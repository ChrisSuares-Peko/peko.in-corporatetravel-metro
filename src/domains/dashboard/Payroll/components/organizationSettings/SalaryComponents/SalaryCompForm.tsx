import React from 'react';

import { Form } from 'antd';
import { useFormikContext } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';

import { useGetSalaryComponent } from '../../../hooks/OrganizationSettings/useGetCurrentSalaryCompApi';
import { salaryAmountCategories, salaryCompStatus } from '../../../utils/orgSettings/data';

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

const SalaryCompForm = ({ selectedRecordData }: SalaryCompFormProps) => {
    const { values, setFieldValue, setFieldTouched, validateField } = useFormikContext<any>();
    const prevCalcType = React.useRef(values.calculationType);

    React.useEffect(() => {
        // Only reset if calculationType actually changed
        if (prevCalcType.current && prevCalcType.current !== values.calculationType) {
            setFieldValue('amountPercentage', '');
            setFieldTouched('amountPercentage', true, false);
            validateField('amountPercentage');

            if (values.calculationType === 'FIXED') {
                setFieldValue('calculationBasedOn', '');
            }
        }

        prevCalcType.current = values.calculationType;
    }, [values.calculationType, setFieldValue, setFieldTouched, validateField]);
    const { data, generateSalaryCompDropdown } = useGetSalaryComponent();
    const filteredCalculationBasisOptions = React.useMemo(() => {
        const options = generateSalaryCompDropdown(data) || [];

        if (!selectedRecordData?.componentName) {
            return options;
        }

        const selectedName = selectedRecordData.componentName.toLowerCase();

        return options.filter(option => {
            const optionValue = option.label?.toLowerCase();

            const isMatch = optionValue === selectedName;

            return !isMatch;
        });
    }, [data, selectedRecordData, generateSalaryCompDropdown]);

    const isBasicSalary = values.componentName?.trim().toLowerCase() === 'basic salary';
    return (
        <Form layout="vertical">
            <TextInput
                name="componentName"
                type="text"
                placeholder="Enter component name"
                label="Component Name"
                allowAlphabetsAndSpaceOnly
                maxLength={50}
                isRequired
                isDisabled={isBasicSalary}
            />

            <SelectInput
                name="calculationType"
                options={salaryAmountCategories || []}
                placeholder="Select calculation type"
                label="Calculation Type"
                isDisabled={isBasicSalary}
                isRequired
            />
            {values.calculationType === 'FIXED' && (
                <TextInput
                    name="amountPercentage"
                    type="text"
                    placeholder="Enter amount "
                    label="Amount"
                    allowTwoDecimalsOnly
                    isRequired
                    maxLength={7}
                />
            )}
            {values.calculationType === 'PERCENTAGE' && (
                <TextInput
                    name="amountPercentage"
                    type="text"
                    placeholder="Enter percentage "
                    label="Percentage"
                    allowTwoDecimalsOnly
                    isRequired
                    maxLength={7}
                />
            )}
            {values.calculationType === 'PERCENTAGE' && (
                <SelectInput
                    name="calculationBasedOn"
                    options={filteredCalculationBasisOptions}
                    placeholder="Select calculation basis"
                    label="Calculation Basis"
                    isDisabled={isBasicSalary}
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

export default SalaryCompForm;
