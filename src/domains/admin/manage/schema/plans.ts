import * as Yup from 'yup';

export const plansSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Plan name must be at least 3 characters')
        .required('Please enter the plan name'),
    price: Yup.string().required('Please enter the plan price'),
    description: Yup.string()
        .min(3, 'Plan description must be at least 3 characters')
        .required('Please enter the description'),
    highlights: Yup.string()
        .min(3, 'Plan highlights must be at least 3 characters')
        .required('Please enter the highlights'),
    billingCycle: Yup.string().required('Please select the billing cycle'),
    is_available: Yup.boolean().required('Please select the availability'),
    // logo: Yup.string().required('Please provide logo URL'),
});
