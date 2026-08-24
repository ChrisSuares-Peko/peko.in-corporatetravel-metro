import * as Yup from 'yup';

export const catalogSchema = Yup.object().shape({
    amount: Yup.number()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .typeError('Amount must be a number')
        .min(0, 'Amount cannot be negative')
        .nullable(),
    sortOrder: Yup.number()
        .typeError('Order must be a number')
        .min(0, 'Order cannot be negative')
        .required('Order is required'),
});
