import * as Yup from 'yup';

export const tdsSchema =  Yup.object().shape({
    taxRegime: Yup.string()
        .required('Please Select Tax Regime'),
    assignedCommissioner: Yup.string()
        .test('no-leading-whitespace', 'No whitespace allowed at the start', value =>
            !value || !/^\s/.test(value)
        )
        .test('no-trailing-whitespace', 'No whitespace allowed at the end', value =>
            !value || !/\s$/.test(value)
        )
        .test('no-consecutive-whitespace', 'No consecutive whitespace allowed', value =>
            !value || !/\s{2,}/.test(value)
        )
        .required('Please enter Assigned Commissioner'),
    address: Yup.string()
        .test('no-leading-whitespace', 'Address cannot start with a whitespace', value =>
            !value || !/^\s/.test(value)
        )
        .test('no-trailing-whitespace', 'Address cannot end with a whitespace', value =>
            !value || !/\s$/.test(value)
        )
        .test('no-consecutive-whitespace', 'Address cannot contain consecutive whitespaces', value =>
            !value || !/\s{2,}/.test(value)
        )
        .required('Please enter Address'),
    bankName: Yup.string()
        .test('no-leading-whitespace', 'No whitespace allowed at the start', value =>
            !value || !/^\s/.test(value)
        )
        .test('no-trailing-whitespace', 'No whitespace allowed at the end', value =>
            !value || !/\s$/.test(value)
        )
        .test('no-consecutive-whitespace', 'No consecutive whitespace allowed', value =>
            !value || !/\s{2,}/.test(value)
        )
        .required('Please enter Bank Name'),
    bsrCode: Yup.string()
        .test('no-leading-whitespace', 'No whitespace allowed at the start', value =>
            !value || !/^\s/.test(value)
        )
        .test('no-trailing-whitespace', 'No whitespace allowed at the end', value =>
            !value || !/\s$/.test(value)
        )
        .test('no-consecutive-whitespace', 'No consecutive whitespace allowed', value =>
            !value || !/\s{2,}/.test(value)
        )
        .required('Please enter BSR Code'),
    name: Yup.string()
        .test('no-leading-whitespace', 'No whitespace allowed at the start', value =>
            !value || !/^\s/.test(value)
        )
        .test('no-trailing-whitespace', 'No whitespace allowed at the end', value =>
            !value || !/\s$/.test(value)
        )
        .test('no-consecutive-whitespace', 'No consecutive whitespace allowed', value =>
            !value || !/\s{2,}/.test(value)
        )
        .required('Please enter Name'),
    fathersName: Yup.string()
        .test('no-leading-whitespace', 'No whitespace allowed at the start', value =>
            !value || !/^\s/.test(value)
        )
        .test('no-trailing-whitespace', 'No whitespace allowed at the end', value =>
            !value || !/\s$/.test(value)
        )
        .test('no-consecutive-whitespace', 'No consecutive whitespace allowed', value =>
            !value || !/\s{2,}/.test(value)
        )
        .required("Please enter Father's Name"),
    placeOfSigning: Yup.string()
        .test('no-leading-whitespace', 'No whitespace allowed at the start', value =>
            !value || !/^\s/.test(value)
        )
        .test('no-trailing-whitespace', 'No whitespace allowed at the end', value =>
            !value || !/\s$/.test(value)
        )
        .test('no-consecutive-whitespace', 'No consecutive whitespace allowed', value =>
            !value || !/\s{2,}/.test(value)
        )
        .required('Please enter Place of Signing'),
    signature: Yup.string()
        .required('Please upload Signature'),
});