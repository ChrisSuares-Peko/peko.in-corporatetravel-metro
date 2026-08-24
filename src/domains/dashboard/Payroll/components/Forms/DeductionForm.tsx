import React from 'react';

import { Form } from 'antd';

import SelectInputWithSearch from '@components/atomic/inputs/SelectInputWithSearch';
import TextInput from '@components/atomic/inputs/TextInput';

import { useGetEmployee } from '../../hooks/dashboardHooks/useGetEmployeeApi';
import { deductionTableType } from '../../types/salaryProfileTypes/deductionTypes';

interface deductionFormProps {
    selectedRecordData?: deductionTableType | null;
    employeeIdFromProfile?: string;
    month: number;
    year: number;
}

const DeductionForm = ({
    selectedRecordData,
    employeeIdFromProfile,
    month,
    year,
}: deductionFormProps) => {
    const { data, generateEmployeesDropdown } = useGetEmployee(month, year);

    return (
        <Form layout="vertical">
            {!selectedRecordData && !employeeIdFromProfile ? (
                <SelectInputWithSearch
                    name="employeeId"
                    options={generateEmployeesDropdown(data) || []}
                    placeholder="Select employee"
                    label="Employee name"
                    isRequired
                    handleChange={() => {}}
                />
            ) : (
                ''
            )}

            <TextInput
                name="deductionName"
                label="Deduction Name"
                type="text"
                placeholder="Enter deduction name"
                classes="rounded-sm"
                isRequired
            />

            <TextInput
                name="amountPercentage"
                label="Amount"
                type="text"
                placeholder="Enter amount"
                classes="rounded-sm"
                allowNumbersOnly
                maxLength={6}
                isRequired
            />
        </Form>
    );
};

export default DeductionForm;
