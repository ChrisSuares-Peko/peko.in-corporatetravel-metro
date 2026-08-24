import * as Yup from 'yup';

export const bulkUploadSchema = Yup.object().shape({
    fullName: Yup.string()
        .required('Please enter full name of the employee')
        .min(3, 'Name must be at least 3 characters'),

    dateOfBirth: Yup.date().required('Please enter date of birth of the employee').nullable(),

    gender: Yup.string().required('Please select gender of the employee'),

    mobileNo: Yup.string()
        .matches(/^\d{9,10}$/, 'Mobile number must contain 9–10 digits')
        .required('Please enter mobile number of the employee'),

    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Please enter personal email of the employee'),

    country: Yup.string().required('Please select nationality of the employee'),

    state: Yup.string()
        .nullable()
        .when('country', (country, schema) => {
            const countryValue = Array.isArray(country) ? country[0] : country;
            if (countryValue === 'India') {
                return schema.required('State is required for employees from India');
            }
            return schema.nullable();
        }),

    addressLine1: Yup.string().required('Please enter address line 1'),

    addressLine2: Yup.string().required('Please enter address line 2'),

    pinCode: Yup.string().required('Please enter pin code').min(6, 'Pin code must be 6 characters'),

    emergencyContactNumber: Yup.string().nullable().matches(/^\d{9,10}$/, 'Mobile number must contain 9–10 digits').optional(),

    emergencyContactName: Yup.string().nullable().optional(),

    emergencyContactRelation: Yup.string().nullable().optional(),

    employeeId: Yup.string()
    .min(4, 'Employee ID must be at least 4 characters')
    .required('Please enter employee ID'),

    department: Yup.string().nullable(),

    dateOfJoin: Yup.date().required('Please enter joining date').nullable(),

    designation: Yup.string().required('Please enter designation'),

    workEmailId: Yup.string()
        .email('Please enter a valid work email')
        .optional(),

    contractType: Yup.string().required('Please select the job type'),

    reportingStaff: Yup.string().nullable(),

    timeSchedule: Yup.string().required('Please enter work schedule'),

    employeeStatus: Yup.string().required('Please select employee status'),

    probationPeriod: Yup.string().nullable(),

    workingDays: Yup.number()
        .transform(value => (Number.isNaN(value) ? undefined : Number(value)))
        .required('Please enter working days')
        .min(1, 'Minimum working days is 1')
        .max(31, 'Maximum working days is 31'),

    accountHolderName: Yup.string().nullable().optional(),

    accountNumber: Yup.string()
        .nullable()
        .matches(/^\d{9,18}$/, 'Account number must contain 9–18 digits')
        .optional(),

    bankName: Yup.string().nullable().optional(),

    ifscCode: Yup.string()
        .nullable()
        .transform(value => (value ? value.replace(/\s+/g, '').toUpperCase() : value))
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code')
        .optional(),

    validated: Yup.boolean().optional(),
    errors: Yup.array().optional(),
});
