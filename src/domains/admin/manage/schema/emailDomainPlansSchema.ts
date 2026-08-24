import * as Yup from 'yup';

const noConsecutiveWhitespaces = (message: string) =>
    Yup.string().test('no-consecutive-whitespaces', message, value => {
        if (typeof value !== 'string') return true;
        return !/\s{2,}/.test(value);
    });

const emailDomainPlansSchema = Yup.object().shape({
    name: Yup.string()
        .concat(noConsecutiveWhitespaces('Plan name must not contain consecutive whitespaces'))
        .required('Please enter the plan name')
        .min(3, 'Plan name must be at least 3 characters'),
    monthlyPrice: Yup.number()
        .required('Please enter the monthly price')
        .test('is-greater-than-zero', 'Monthly price must be greater than zero', value => {
            const numberValue = Number(value);
            return !Number.isNaN(numberValue) && numberValue > 0;
        }),
    yearlyPrice: Yup.number()
        .required('Please enter the yearly price')
        .test('is-greater-than-zero', 'Yearly price must be greater than zero', value => {
            const numberValue = Number(value);
            return !Number.isNaN(numberValue) && numberValue > 0;
        })
        .test('is-greater', 'Yearly price must be greater than monthly price', function validateYearlyPrice(value) {
            const { monthlyPrice } = this.parent; // Access the monthlyPrice field
            return value > monthlyPrice;
        }),
    softwaresSubscriptionId: Yup.number().required('Please select a product'),
    image: Yup.string().required('Please select the product image'),
    features: Yup.array()
        .of(
            Yup.object().shape({
                label: Yup.string()
                    .required('Please enter a feature label')
                    .min(2, 'Minimum 2 chars')
                    .max(50, 'Maximum 50 chars'),
                value: Yup.string()
                    .required('Please enter a feature value')
                    .min(2, 'Minimum 2 chars')
                    .max(50, 'Maximum 50 chars'),
            })
        )
        .min(1, 'Please add at least one feature'),
    descriptions: Yup.array()
        .of(
            Yup.object().shape({
                label: Yup.string()
                    .required('Please enter a description label')
                    .min(2, 'Description label must be at least 2 characters')
                    .max(50, 'Description label can be at most 50 characters'),
                value: Yup.string()
                    .required('Please enter a description value')
                    .min(2, 'Description value must be at least 2 characters')
                    .max(500, 'Description value can be at most 500 characters'),
            })
        )
        .min(1, 'Please add at least one description'),
});

export default emailDomainPlansSchema;
