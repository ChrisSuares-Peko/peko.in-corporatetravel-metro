import * as Yup from 'yup';

import { withLetterRequired, withSpaceValidation } from '../../utils/yupHelpers';

export const sendPaymentLinkSchema = Yup.object().shape({
    amount: Yup.string().trim().required('Amount is required'),
    customerName: withLetterRequired(
        withSpaceValidation(Yup.string().optional(), 'Customer name'),
        'Customer name'
    ),
    customerPhone: Yup.string()
        .trim()
        .required('Customer phone is required')
        .matches(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
    linkExpiry: Yup.string()
        .nullable()
        .oneOf(['5m', '10m', '1h', '6h', '12h', '24h', null], 'Invalid expiry duration'),
});
