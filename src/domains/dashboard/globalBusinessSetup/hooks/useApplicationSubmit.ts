import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { submitApplication } from '../api/globalBusinessSetup';
import { setApplicationId } from '../slices/globalBusinessSetupSlice';
import { SubmissionMeta } from '../types/forms';
import { objectToFormData, transformToSubmissionPayload } from '../utils/objectToFormData';

export type FinalSubmitResult =
    | { ok: true; vendorApplicationId: string }
    | { ok: false; message: string; errors?: string[] };

export const useCompanyApplicationSubmit = (formSchema: any) => {
    const [savingDraft, setSavingDraft] = useState(false);
    const [submittingFinal, setSubmittingFinal] = useState(false);
    const { role, id, username } = useAppSelector(state => state.reducer.auth);
    const { metrics, provider, countryData, applicationId, pricingData, quoteConfig } =
        useAppSelector(state => state.reducer.globalBusinessSetup);
    const dispatch = useAppDispatch();

    const submit = async (values: any, status: 'draft' | 'saved', skipAiValidation = false) => {
        const customObj: SubmissionMeta = {
            status,
            reference_id: username,
            metrics,
            provider: provider._id,
            countryData,
            ...(pricingData && {
                pricingId: pricingData._id,
                quoteConfig,
            }),
        };

        const payload = transformToSubmissionPayload(formSchema, values, customObj);

        const formData = new FormData();
        objectToFormData(payload, formData);

        const res = await submitApplication({
            formData,
            userId: id,
            userType: role,
            applicationId: applicationId || '',
            skipAiValidation,
        });

        if (res?.vendorApplicationId) {
            dispatch(setApplicationId(res.vendorApplicationId));
        }

        return res;
    };

    return {
        saveDraft: async (values: any, status: 'draft' | 'saved', silent = false) => {
            try {
                if (status === 'saved') {
                    setSubmittingFinal(true);
                } else {
                    setSavingDraft(true);
                }

                const res = await submit(values, 'draft');

                if (res && !silent) {
                    const isEdit = Boolean(applicationId);
                    let description = '';

                    if (status === 'saved') {
                        description =
                            'Details saved successfully. Review your application before final submission';
                    } else if (isEdit) {
                        description = 'Draft updated successfully';
                    } else {
                        description = 'Draft saved successfully';
                    }

                    dispatch(
                        showToast({
                            description,
                            variant: 'success',
                        })
                    );
                }

                return res;
            } finally {
                setSavingDraft(false);
                setSubmittingFinal(false);
            }
        },

        finalSubmit: async (values: any, skipAiValidation = false): Promise<FinalSubmitResult> => {
            setSubmittingFinal(true);

            try {
                const res = await submit(values, 'saved', skipAiValidation);

                if (res?.vendorApplicationId) {
                    const appId = res.vendorApplicationId;
                    const toastKey = `submit-toast-shown:${appId}`;

                    const alreadyShown = sessionStorage.getItem(toastKey);

                    if (!alreadyShown) {
                        dispatch(
                            showToast({
                                description:
                                    'Application submitted. Please complete payment to proceed',
                                variant: 'success',
                            })
                        );

                        sessionStorage.setItem(toastKey, 'true');
                    }

                    return { ok: true, vendorApplicationId: res.vendorApplicationId };
                }

                return { ok: false, message: 'Application submission failed' };
            } catch (err: any) {
                const data = err?.response?.data;
                return {
                    ok: false,
                    message: data?.message ?? 'Application submission failed',
                    errors: Array.isArray(data?.errors) ? data.errors : undefined,
                };
            } finally {
                setSubmittingFinal(false);
            }
        },

        savingDraft,
        submittingFinal,
    };
};
