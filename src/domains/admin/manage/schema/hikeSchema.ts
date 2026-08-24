import * as Yup from 'yup';

const noConsecutiveWhitespaces = (message: string) =>
    Yup.string().test('no-consecutive-whitespaces', message, value => {
        if (typeof value !== 'string') return true;
        return !/\s{2,}/.test(value);
    });
const hikeCodeSchema = Yup.object().shape({
    name: Yup.string()
        .concat(noConsecutiveWhitespaces('Name must not contain consecutive whitespaces'))
        .required('Please enter name')
        .min(3, 'Name must be at least 3 characters'),
    features: Yup.string()
        .concat(noConsecutiveWhitespaces('Features must not contain consecutive whitespaces'))
        .required('Please enter features')
        .min(3, 'Features must be at least 3 characters'),
    planType: Yup.string()
        .required('Please select the plan type')
        .oneOf(['YEARLY', 'MONTHLY'], 'Plan type must be either Yearly or Monthly'),
    amount: Yup.string()
        .concat(noConsecutiveWhitespaces('Amount must not contain consecutive whitespaces'))
        .required('Please enter amount'),
    salaryAmount: Yup.string()
        .concat(noConsecutiveWhitespaces('Salary amount must not contain consecutive whitespaces'))
        .required('Please enter salary amount'),
    salaryValidation: Yup.string()
        .required('Please select the salary validation')
        .oneOf(['LESS_THAN', 'GREATER_THAN'], 'Plan type must be either less than or greater than'),
    partnersBase: Yup.string().required('Please upload the partners image'),
    logoBase: Yup.string().required('Please upload the logo'),
});

export default hikeCodeSchema;
