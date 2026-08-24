import React from 'react';

import { Flex } from 'antd';

import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';

import { useAddDeduction } from '../../hooks/employeeSalaryHooks/DeductionHooks/useAddDeductionApi';
import { useUpdateDeduction } from '../../hooks/employeeSalaryHooks/DeductionHooks/useUpdateDeductionApi';
import { payrollDeductionSchema } from '../../schema/EmployeeSalary';
import {
    DeductionFormType,
    deductionTableType,
} from '../../types/salaryProfileTypes/deductionTypes';
import DeductionForm from '../Forms/DeductionForm';

type deductionModalProps = {
    open: boolean;
    handleCancel: () => void;
    selectedRecordData?: deductionTableType | null;
    reloadTable?: React.Dispatch<React.SetStateAction<boolean>>;
    employeeIdFromProfile?: string;
    month: number;
    year: number;
};

const DeductionModal = ({
    open,
    handleCancel,
    selectedRecordData,
    reloadTable,
    employeeIdFromProfile,
    month,
    year,
}: deductionModalProps) => {
    const { deductionAdd } = useAddDeduction(handleCancel);
    const { deductionUpdate } = useUpdateDeduction(handleCancel);

    return (
        <CustomModalWithForm
            modalTitle={selectedRecordData ? 'Edit Deduction' : 'Add Deduction'}
            open={open}
            handleCancel={handleCancel}
            handleFormSubmit={async (values: DeductionFormType) => {
                if (selectedRecordData) {
                    await deductionUpdate(values, selectedRecordData, employeeIdFromProfile!);
                } else {
                    await deductionAdd(values);
                }
                if (reloadTable) reloadTable(p => !p);
            }}
            initialValues={{
                employeeId: selectedRecordData?.employeeId || employeeIdFromProfile || '',
                deductionName: selectedRecordData?.deductionType || '',
                amountPercentage: selectedRecordData?.deductionAmount ?? '',
            }}
            reinitialise
            validationSchema={payrollDeductionSchema}
        >
            <Flex vertical className="w-full">
                <DeductionForm
                    year={year}
                    month={Number(month)}
                    selectedRecordData={selectedRecordData}
                    employeeIdFromProfile={employeeIdFromProfile}
                />
            </Flex>
        </CustomModalWithForm>
    );
};

export default DeductionModal;
