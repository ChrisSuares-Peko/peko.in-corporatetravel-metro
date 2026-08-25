import * as Yup from 'yup';

export const smartCardSchema = Yup.object().shape({
    cardNumber: Yup.string()
        .matches(/^\d+$/, 'Card number must contain digits only')
        .min(6, 'Card number must be at least 6 digits')
        .max(12, 'Card number must be at most 12 digits')
        .required('Please enter the smart card number'),
    label: Yup.string().max(40, 'Label must be at most 40 characters'),
});
