import * as Yup from 'yup';

import { emailRegex } from '@utils/regex';

export const payrollGratuitySchema = Yup.object().shape({
    basicSalary: Yup.number().required('Please enter basic salary'),
    fromDate: Yup.string().required('Please enter first working day'),
    toDate: Yup.string().required('Please enter last working day'),
});
export const payrollOvertimeSchema = Yup.object().shape({
    employeeId: Yup.string().required('Please select an employee'),
    extraHours: Yup.number()
        .required('Please enter the extra hours')
        .moreThan(0, 'Extra hours must be greater than 0'),
    overTimeDate: Yup.string().required('Please select an overtime date'),
    overTimeRate: Yup.number()
        .required('Please enter an overtime rate')
        .moreThan(0, 'Over time rate must be greater than 0'),
});
export const payrollIncentivesSchema = Yup.object().shape({
    employeeId: Yup.string().required('Please select an employee'),
    incentiveDate: Yup.string().required('Please select the effective date'),
    details: Yup.string()
        // No leading space
        .test('no-leading-space', 'Incentives details cannot start with a whitespace', value =>
            value ? value[0] !== ' ' : true
        )

        // No trailing space
        .test('no-trailing-space', 'Incentives details cannot end with a whitespace', value =>
            value ? value[value.length - 1] !== ' ' : true
        )
        // No consecutive spaces
        .test(
            'no-consecutive-spaces',
            'Incentives details cannot contain consecutive whitespaces',
            value => (value ? !/\s{2,}/.test(value) : true)
        )
        .min(3, 'Incentives details must be at least 3 characters')
        .required('Please enter the incentive details'),
    amount: Yup.number()
        .required('Please enter the incentives amount')
        .moreThan(0, 'Incentives amount must be greater than 0'),
});
export const payrollBonusSchema = Yup.object().shape({
    bonusDate: Yup.string().required('Please select the bonus date'),
    bonusAmount: Yup.number()
        .required('Please enter the bonus amount')
        .moreThan(0, 'Bonus amount must be greater than 0'),
});
export const payrollReimbursementSchema = Yup.object().shape({
    expenseDate: Yup.string().required('Please select an expense date'),
    managerEmail: Yup.string()
        .required('Please enter manager email')
        .matches(emailRegex, 'Please enter a valid email'),
    category: Yup.string().required('Please select a category'),
    description: Yup.string()
        // No leading space
        .test('no-leading-space', 'Description cannot start with a whitespace', value =>
            value ? value[0] !== ' ' : true
        )
        // No trailing space
        .test('no-trailing-space', 'Description cannot end with a whitespace', value =>
            value ? value[value.length - 1] !== ' ' : true
        )
        // No consecutive spaces
        .test(
            'no-consecutive-spaces',
            'Description cannot contain consecutive whitespaces',
            value => (value ? !/\s{2,}/.test(value) : true)
        )
        .test('min-length', 'Description must be at least 3 characters', v => !v || v.length >= 3)
        .max(300, 'Description must be at most 300 characters'),

    totalPay: Yup.number()
        .typeError('Please enter the reimbursement amount')
        .required('Please enter the reimbursement amount')
        .moreThan(0, 'Reimbursement amount must be greater than 0'),
});
export const payrollIncrementSchema = Yup.object().shape({
    incrementPercentage: Yup.string().required('Please enter increment percentage'),
    incrementType: Yup.string().required('Please select transfer method'),
    incrementAmount: Yup.string().required('Please enter increment amount'),
    effectiveDate: Yup.string().required('Please select effective date'),
});
export const payrollDeductionSchema = Yup.object().shape({
    employeeId: Yup.string().required('Please select an employee'),
    deductionName: Yup.string().required('Please enter a deduction name'),
    amountPercentage: Yup.string().required('Please enter amount'),
});

export const payrollEPFSchema = Yup.object().shape({
    epfNumber: Yup.string()
        .matches(/^[^\s]/, 'EPF number cannot start with a whitespace')
        .matches(/[^\s]$/, 'EPF number cannot end with a whitespace')
        .matches(/^(?!.*\s{2,})/, 'EPF number cannot contain consecutive whitespaces')
        .min(15, 'EPF number must be at least 15 characters')

        .required('Please enter EPF number'),

    employeeContributionRate: Yup.string().required('Please enter employee contribution rate'),

    employerContributionRate: Yup.string().required('Please enter employer contribution rate'),
    enableProRatedPfWage: Yup.boolean().optional(),
    considerSalaryComponents: Yup.boolean().optional(),
});
export const payrollEsiSchema = Yup.object().shape({
    esiNumber: Yup.string().required('Please enter ESI number'),
});
export const payrollLWFSchema = Yup.object().shape({
    EmployeeContriRate: Yup.number()
        .required('Please enter employee contribution rate')
        .typeError('Employee contribution rate must be a number')
        .min(0, 'Contribution rate must be positive')
        .max(100, 'Contribution rate cannot exceed 100%'),
    EmployerContriRate: Yup.number()
        .required('Please enter employer contribution rate')
        .typeError('Employer contribution rate must be a number')
        .min(0, 'Contribution rate must be positive')
        .max(100, 'Contribution rate cannot exceed 100%'),
    EmployeeContriAmount: Yup.number()
        .required('Please enter employee contribution amount')
        .typeError('Employee contribution amount must be a number')
        .min(0, 'Contribution amount must be positive'),
    EmployerContriAmount: Yup.number()
        .required('Please enter employer contribution amount')
        .typeError('Employer contribution amount must be a number')
        .min(0, 'Contribution amount must be positive'),
    status: Yup.string()
        .required('Please select the status')
        .oneOf(['Active', 'Inactive'], 'Please select a valid status'),
});

export const labWelfareSchema = Yup.object().shape({
    deductionCycle: Yup.string()
        .required('Deduction cycle is required')
        .oneOf(['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], 'Invalid deduction cycle'),
    employeeContribution: Yup.number()
        .required('Employee contribution is required')
        .min(0, 'Employee contribution must be greater than or equal to 0')
        .typeError('Employee contribution must be a number'),
    employerContribution: Yup.number()
        .required('Employer contribution is required')
        .min(0, 'Employer contribution must be greater than or equal to 0')
        .typeError('Employer contribution must be a number'),
});

export const payrollPTSchema = Yup.object().shape({
    ptNumber: Yup.string()
        .max(15, 'PT number cannot be more than 15 characters')
        .required('Please enter PT number'),
    // Ensures PT number is in the format 1234-567890-1234

    deductionCycle: Yup.string()
        .required('Please select deduction cycle')
        .oneOf(['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], 'Invalid deduction cycle'), // Deduction cycle must be one of the predefined values

    incomeSlabs: Yup.array().of(
        Yup.object().shape({
            incomeStartRange: Yup.number()
                .required('Please enter income start range')
                .min(0, 'Income start range must be greater than or equal to 0'),

            incomeEndRange: Yup.number()
                .required('Please enter income end range')
                .min(
                    Yup.ref('incomeStartRange'),
                    'Income end range must be greater than start range'
                ),

            taxAmount: Yup.number()
                .required('Please enter tax amount')
                .min(0, 'Tax amount must be greater than or equal to 0')
                .max(
                    Yup.ref('incomeEndRange'),
                    'Tax amount must be less than or equal to income end range'
                ),
        })
    ),
});
