import * as Yup from 'yup';

export const esimPlanSchema = Yup.object().shape({
    // id: Yup.number().integer().positive(),
    coverage: Yup.string().required('Please select the coverage'),
    country: Yup.string().required('Please select a country'),
    dataMBs: Yup.number()
        .required('Please specify the data pack')
        .min(1, 'Data pack must be at least 1 MB'),
    periodDays: Yup.number()
        .required('Please specify the validity')
        .min(1, 'Validity must be at least 1 day')
        .max(30, 'Validity must be at most 30 days'),
    amount: Yup.number()
        .required('Please specify the amount')
        .positive('Amount must be greater than zero')
        .max(999999.9999, 'Amount cannot exceed 999999.9999'),
    // coverageId: Yup.string()
    //     .required('Please specify the validity')
    //     .min(1, 'Validity must be at least 1 character'),
});
