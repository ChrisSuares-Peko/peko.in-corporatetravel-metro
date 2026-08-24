import * as Yup from 'yup';

import { PLAN_TYPES } from '../types/domainHostingPlan';

const domainHostingPlansSchema = Yup.object().shape({
    planType: Yup.string()
        .oneOf([...PLAN_TYPES], 'Please select a valid plan type')
        .required('Please select the plan type'),
    planName: Yup.string()
        .required('Please enter the plan name')
        .min(3, 'Plan name must be at least 3 characters')
        .max(100, 'Plan name can be at most 100 characters'),
    productId: Yup.string()
        .required('Please enter the product ID (vendor classkey)')
        .min(2, 'Product ID must be at least 2 characters'),
    planId: Yup.string().required('Please enter the plan ID (vendor plan number)').nullable(),
    billingCycle: Yup.number().nullable(),
    description: Yup.string().nullable(),
    features: Yup.array()
        .of(
            Yup.object().shape({
                label: Yup.string().nullable().max(50, 'Maximum 50 chars'),
                value: Yup.string().nullable().max(100, 'Maximum 100 chars'),
            })
        )
        .nullable(),
});

export default domainHostingPlansSchema;