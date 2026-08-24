import dayjs from 'dayjs';
import * as Yup from 'yup';

export const userDetailsSchema = (isFirstAdult: boolean) =>
    Yup.object().shape({
       firstName: Yup.string()
        .required('Please enter the first name')
        .test(
            'no-leading-trailing-space',
            'First name cannot start or end with a whitespace',
            value => (value ? value.trim() === value : true)
        )
        .test('no-multiple-spaces', 'First name cannot contain consecutive whitespaces', value =>
            value ? !/\s{2,}/.test(value) : true
        )
        .min(3, 'First name must be at least 3 characters')
        .max(12, 'First name cannot be longer than 12 characters'),

    lastName: Yup.string()
        .required('Please enter the last name')
        .test(
            'no-leading-trailing-space',
            'Last name cannot start or end with a whitespace',
            value => (value ? value.trim() === value : true)
        )
        .test('no-multiple-spaces', 'Last name cannot contain consecutive whitespaces', value =>
            value ? !/\s{2,}/.test(value) : true
        )
        .min(2, 'Last name must be at least 2 characters')
        .max(12, 'Last name cannot be longer than 12 characters'),

        dob: Yup.string().required('Please select the date of birth'),

        // email: isFirstAdult
        //     ? Yup.string()
        //           .required('Please enter the email ID')
        //           .email('Please enter a valid email ID')
        //           .matches(
        //               /^(?!\.)[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        //               'Please enter a valid email ID'
        //           )
        //     : Yup.string().nullable(),

        // phone: isFirstAdult
        //     ? Yup.string()
        //           .required('Please enter the mobile number')
        //           .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
        //     : Yup.string().nullable(),

        isPassportRequired: Yup.boolean(),
        passportNo: Yup.string().when('isPassportRequired', {
            is: true,
            then: schema =>
                schema
                    .required('Please enter the passport number')
                    .matches(/^[A-Z0-9]*$/, 'No special characters or spaces are allowed.')
                    .min(6, 'Passport number must be at least 6 characters long'),
            otherwise: schema => schema.nullable(),
        }),
        passportIssueDate: Yup.string().when('isPassportRequired', {
            is: true,
            then: schema =>
                schema
                    .required('Please select the issue date')
                    .test(
                        'is-future-date',
                        'Issue date must be in the past',
                        value => !!value && dayjs(value).isBefore(dayjs())
                    ),
            otherwise: schema => schema.nullable(),
        }),
        passportExpDate: Yup.string().when('isPassportRequired', {
            is: true,
            then: schema =>
                schema
                    .required('Please select the expiry date')
                    .test(
                        'is-future-date',
                        'Expiry date must be in the future',
                        value => !!value && dayjs(value).isAfter(dayjs())
                    ),
            otherwise: schema => schema.nullable(),
        }),

        isPanRequired: Yup.boolean(),
        pan: Yup.string()

            .when('isPanRequired', {
                is: true,
                then: schema =>
                    schema
                        .required('Please enter the PAN')
                        .test(
                            'no-lowercase',
                            'PAN must be in uppercase',
                            value => !/[a-z]/.test(value || '')
                        )
                        .min(10, 'PAN must be 10 characters')
                        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),

                otherwise: schema => schema.nullable(),
            }),
    });
