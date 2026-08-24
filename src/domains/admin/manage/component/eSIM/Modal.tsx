import { useState } from 'react';

import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';

import useEsimPlanUpdate from '../../hooks/useEsimPlanUpdate';
import { esimPlanSchema } from '../../schema/eSIMPlans';
import { EsimPlan } from '../../types/eSIM';
import PlanForm from '../forms/eSIMPlansForm';

type DepartmentModalProps = {
    open: boolean;
    handleCancel: () => void;
    data?: EsimPlan;
    handleRefresh: () => void;
    mode: string;
};

const CreateUpdateModal = ({
    open,
    handleCancel,
    data,
    handleRefresh,
    mode,
}: DepartmentModalProps) => {
    const [searchCountry, setSearchCountry] = useState<string>('');
    const {
        isLoading,
        handleEsimPlanCreation,
        updateEsimPlanDetails,
        coverageData,
        countryLoading,
    } = useEsimPlanUpdate(searchCountry);
    const modalTitle = mode === 'add' ? 'Add eSIM Plan' : 'Edit eSIM Plan';
    return (
        <CustomModalWithForm
            modalTitle={modalTitle}
            open={open}
            isDisabled={countryLoading}
            isLoading={isLoading}
            handleCancel={handleCancel}
            handleFormSubmit={async values => {
                let result;
                if (!values.id) {
                    delete values.name;
                }
                values.coverageId = values.coverage;
                const found = coverageData?.find(
                    item => values.coverage === item.value || values.country === item.label
                );
                // if (!values.id ) {
                // delete values.coverage;
                // }
                values.networks = found?.network;
                values.provider = found?.provider?.toUpperCase();
                values.country = found?.label.split(',')[0];

                if (values.id) {
                    result = await updateEsimPlanDetails(values);
                } else {
                    result = await handleEsimPlanCreation(values);
                }
                if (result) {
                    handleCancel();
                    handleRefresh();
                }
            }}
            initialValues={{
                id: data?.planId || '',
                name: data?.name || '',
                country: data?.country,
                coverage: data?.coverageId,
                dataMBs: data?.dataMBs || '',
                periodDays: data?.periodDays || '',
                amount: data?.amount ? Number(data.amount).toFixed(2) : '',
            }}
            validationSchema={esimPlanSchema}
        >
            <PlanForm
                isEdit={!!data}
                coverageData={coverageData}
                setSearchCountry={setSearchCountry}
            />
        </CustomModalWithForm>
    );
};

export default CreateUpdateModal;
