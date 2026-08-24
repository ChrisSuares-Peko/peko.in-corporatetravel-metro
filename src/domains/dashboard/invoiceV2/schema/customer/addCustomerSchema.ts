import * as Yup from 'yup';

import { withLetterRequired, withSpaceValidation } from '../../utils/yupHelpers';

export const addCustomerSchema = Yup.object().shape({
    name: withLetterRequired(
        withSpaceValidation(
            Yup.string().required('Please enter the customer name'),
            'Customer name'
        )
            .min(3, 'Customer name must be at least 3 characters')
            .max(50, 'Customer name cannot exceed 50 characters'),
        'Customer name'
    ),
    gstin: Yup.string()
        .optional()
        .test('valid-gstin', 'Please enter a valid GST number', v => {
            if (!v) return true;
            if (v.length !== 15) return false;
            return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        }),

    phoneNumber: Yup.string()
        .required('Please enter the customer mobile number')
        .matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'),

    email: Yup.string().optional().email('Please enter a valid email'),

    upiId: Yup.string().trim(),

    primaryAddress: withSpaceValidation(
        Yup.string().required('Please enter the customer address'),
        'Customer address'
    )
        .min(3, 'Customer address must be at least 3 characters')
        .max(100, 'Customer address cannot exceed 100 characters'),

    primaryCity: Yup.string()
        .required('Please enter the city name')
        .test(
            'no-leading-space',
            'City name cannot start with whitespace',
            v => !/^\s/.test(v ?? '')
        )
        .test(
            'no-consecutive-spaces',
            'City name cannot contain consecutive whitespaces',
            v => !/\s{2,}/.test(v ?? '')
        )
        .min(3, 'City name must be at least 3 characters')
        .max(50, 'City name cannot exceed 50 characters'),

    primaryState: Yup.string()
        .required('Please select the state')
        .max(50, 'State cannot exceed 50 characters'),

    primaryPincode: Yup.string()
        .required('Please enter the PIN code')
        .matches(/^[0-9]{6}$/, 'PIN code must be exactly 6 digits'),

    primaryCountry: Yup.string().required('Country is required'),

    shippingSameAsPrimary: Yup.boolean(),

    shippingAddress: withSpaceValidation(Yup.string().optional(), 'Customer address')
        .test(
            'min-length',
            'Customer address must be at least 3 characters',
            v => !v || v.length >= 3
        )
        .max(100, 'Customer address cannot exceed 100 characters'),

    shippingCity: Yup.string()
        .optional()
        .test(
            'no-leading-space',
            'City name cannot start with whitespace',
            v => !/^\s/.test(v ?? '')
        )
        .test(
            'no-consecutive-spaces',
            'City name cannot contain consecutive whitespaces',
            v => !/\s{2,}/.test(v ?? '')
        )
        .test('min-length', 'City name must be at least 3 characters', v => !v || v.length >= 3)
        .max(50, 'City name cannot exceed 50 characters'),

    shippingState: Yup.string().optional().max(50, 'State cannot exceed 50 characters'),

    shippingPincode: Yup.string()
        .optional()
        .matches(/^[0-9]{6}$/, {
            message: 'PIN code must be exactly 6 digits',
            excludeEmptyString: true,
        }),
});
