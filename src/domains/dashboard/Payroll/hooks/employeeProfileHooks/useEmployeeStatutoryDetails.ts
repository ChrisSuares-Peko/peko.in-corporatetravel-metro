import React, { useCallback, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { getStatutoryComponent, updateStatutorystatus } from '../../api/employeeProfileApi/index';
import {
    setStatutoryData,
    updateStatutoryField,
    setLoading,
} from '../../slices/employeeDetailsSlice';

const useEmployeeStatutoryDetails = (employeeId: string) => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const dispatch = useAppDispatch();

    const statutoryData = useAppSelector(state => state.reducer.employeeDetails.statutoryData);
    const isLoading = useAppSelector(state => state.reducer.employeeDetails.isLoading);

    const [buttonLoader, setButtonLoader] = React.useState<Record<string, boolean>>({});

    const getEmployeeStatutoryData = useCallback(async () => {
        dispatch(setLoading(true));
        const data: any | false = await getStatutoryComponent(employeeId, id, role);

        if (data) {
            const config = data.complianceSettingInfo?.[0] || {};
            const transformedData = [
                {
                    title: 'EPF',
                    isActive: data.enableEPF,
                    fields: [
                        {
                            'EPF Contribution Rate': `Employer : ${config.epf?.employerContributionRate || '-%'}\nEmployee : ${config.epf?.employeeContributionRate || '-%'}`,
                            'UAN Number': config.epf?.epfNumber || '-',
                        },
                    ],
                },
                {
                    title: 'ESI',
                    isActive: data.enableESI,
                    fields: [
                        {
                            'ESI Contribution Rate': `Employer : ${config.esi?.employerContribution || '-%'}\nEmployee : ${config.esi?.employeeContribution || '-%'}`,
                            'ESI Number': config.esi?.esiNumber || '-',
                        },
                    ],
                },
                {
                    title: 'Labor Welfare Fund',
                    isActive: data.laborWelfareFund,
                    fields: [
                        {
                            'LWF Contribution Rate': `Employer : ${config.laborWelfareFund?.employerContribution || '-%'}\nEmployee : ${config.laborWelfareFund?.employeeContribution || '-%'}`,
                            State: 'N/A',
                            'Deduction Cycle': config.laborWelfareFund?.deductionCycle || '-',
                        },
                    ],
                },
                {
                    title: 'Professional Tax',
                    isActive: data.professionalTax,
                    fields: [
                        {
                            State: 'N/A',
                            'PT Number': config.professionalTax?.ptNumber || '-',
                            'PT Rate': `${config.professionalTax?.incomeSlabs?.[0]?.taxAmount || '-'}%`,
                        },
                    ],
                },
            ];
            dispatch(setStatutoryData(transformedData));
        }

        dispatch(setLoading(false));
    }, [employeeId, id, role, dispatch]);

    useEffect(() => {
        getEmployeeStatutoryData();
    }, [getEmployeeStatutoryData]);

    const updateEmployeeStatutoryData = async (fieldKey: string, value: boolean, title: string) => {
        setButtonLoader(prev => ({ ...prev, [title]: true }));

        const payload = { [fieldKey]: value };
        const data: any | false = await updateStatutorystatus(employeeId, id, role, payload);

        if (data) {
            dispatch(
                showToast({
                    description: 'Statutory details updated successfully',
                    variant: 'success',
                })
            );
            dispatch(updateStatutoryField({ title, isActive: value }));
        } else {
            dispatch(
                showToast({
                    description: 'Something went wrong. Please try again later.',
                    variant: 'error',
                })
            );
        }

        setButtonLoader(prev => ({ ...prev, [title]: false }));
        return data;
    };

    return { isLoading, buttonLoader, statutoryData, updateEmployeeStatutoryData };
};

export default useEmployeeStatutoryDetails;
