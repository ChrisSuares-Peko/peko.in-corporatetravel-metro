import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { saveProfessionalTaxSettingsApi } from '../../api/complianceSettings/index';
import { saveEpfResponse, TaxPayload } from '../../types/complianceSettings/complianceSettingsType';

export default function useAddTaxSettingsApi(handleCancel?: () => void) {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [responseData] = useState<saveEpfResponse | false>();
    const [nextStep, setNextStep] = useState<Boolean>(false);
    const dispatch = useAppDispatch();
    const[isLoading,setIsLoading]=useState(false)

    const handleSaveTaxData = async (payload: TaxPayload) => {
        setIsLoading(true)
        const response = await saveProfessionalTaxSettingsApi({
            ...payload,
            userId: id,
            userType: role,
        });
        if (response.success && response.data) {
            dispatch(
                showToast({
                    description:
                        response.data.message || 'Professional Tax settings saved successfully',
                    variant: 'success',
                })
            );
            setNextStep(true);
            setIsLoading(false);
            if (handleCancel) handleCancel();
        }
        setIsLoading(false);
    };

    return { handleSaveTaxData, responseData, nextStep,isLoading };
}
