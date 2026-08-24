import React from 'react';

import { Flex } from 'antd';

import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';

import DeductionCompForm from './DeductionCompForm';
import { useDeductionActions } from '../../../hooks/OrganizationSettings/useDeductionComponentApi';
import { deductionCompFormSchema } from '../../../schema/organizationSettings';

interface DeductionCompModalProps {
    open: boolean;
    handleCancel: () => void;
    selectedRecordData?: any | null;
    reloadTable?: React.Dispatch<React.SetStateAction<boolean>>;
    isEmployeeSpecific: boolean;
}

const DeductionCompModal = ({
    open,
    handleCancel,
    selectedRecordData,
    reloadTable,
    isEmployeeSpecific
}: DeductionCompModalProps) => {
    const { addDeductionAction, updateDeductionAction,isAdding,isUpdating,isGeneralAdding,isGeneralUpdating } = useDeductionActions(handleCancel);
    const modalLoading = React.useMemo(() => {
        if (selectedRecordData) {
            // UPDATE
            return isEmployeeSpecific ? isUpdating : isGeneralUpdating;
        }

        // ADD
        return isEmployeeSpecific ? isAdding : isGeneralAdding;
    }, [
        selectedRecordData,
        isEmployeeSpecific,
        isAdding,
        isUpdating,
        isGeneralAdding,
        isGeneralUpdating,
    ]);
    const handleFormSubmit = async (values: any) => {
        console.log(Boolean(values?.salaryDeductionType));
        if(!values?.salaryDeductionType){
            values.salaryDeductionType = 'BASIC_SALARY';
        }
        if (selectedRecordData) {
            await updateDeductionAction(values, selectedRecordData.id);
        } else {
            await addDeductionAction(values);
        }
        handleCancel();
        if (reloadTable) reloadTable(p => !p);
    };

    return (
        <CustomModalWithForm
            modalTitle={selectedRecordData ? 'Edit Deduction' : 'Add New Deduction'}
            isLoading={modalLoading}
            open={open}
            handleCancel={handleCancel}
            handleFormSubmit={v => handleFormSubmit(v)}
            initialValues={{
                deductionName: selectedRecordData?.deductionName || '',
                deductionType: selectedRecordData?.deductionType || '',
                calculationType: selectedRecordData?.calculationType || '',
                amountPercentage: selectedRecordData?.amountPercentage || '',
                calculationBasis: selectedRecordData?.calculationBasis || '',
                status: selectedRecordData?.status || '',
                applicabilityCriteria: selectedRecordData?.applicabilityCriteria || '',
                isGlobal:true,
                salaryDeductionType:selectedRecordData?.salaryDeductionType || '',
            }}
            validationSchema={deductionCompFormSchema}
        >
            <Flex vertical className="w-full">
                <DeductionCompForm selectedRecordData={selectedRecordData} />
            </Flex>
        </CustomModalWithForm>
    );
};

export default DeductionCompModal;
