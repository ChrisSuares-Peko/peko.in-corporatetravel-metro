import * as Yup from 'yup';

export const giftCardSchema = Yup.object().shape({
    product_name: Yup.string().trim().required('Product Name is required'),
    product_id: Yup.string().required('Product ID is required'),
    merchant_name: Yup.string().optional(),
    merchant_id: Yup.string().optional(),
    brand_name: Yup.string().required('Brand Name is required'),
    is_open_denominnation: Yup.string()
        .oneOf(['OPEN', 'FIXED'], 'Invalid Domination type')
        .required('Domination Type is required'),
    gv_type: Yup.string()
        .oneOf(['ONLINE', 'OFFLINE', 'OMNI-CHANNEL'], 'Invalid GV type')
        .required('GV type is required'),
    min_price: Yup.number().when('is_open_denominnation', {
        is: 'OPEN',
        then: schema =>
            schema
                .required('Minimum Price is required for open denomination')
                .min(1, 'Minimum Price must be greater than or equal to 1'),
        otherwise: schema => schema.optional(),
    }),
    max_price: Yup.number().when('is_open_denominnation', {
        is: 'OPEN',
        then: schema =>
            schema
                .required('Maximum Price is required for open denomination')
                .min(Yup.ref('min_price'), 'Maximum Price must be greater than Minimum Price'),
        otherwise: schema => schema.optional(),
    }),
    // mrp: Yup.number().when('is_open_denominnation', {
    //     is: false,
    //     then: schema => schema.required('MRP is required for fixed denomination'),
    //     otherwise: schema => schema.optional(),
    // }),
    // selling_price: Yup.number().when('is_open_denominnation', {
    //     is: false,
    //     then: schema => schema.required('Selling Price is required for fixed denomination'),
    //     otherwise: schema => schema.optional(),
    // }),
    denominations: Yup.array()
        .of(Yup.number())
        .when('is_open_denominnation', {
            is: 'FIXED',
            then: schema =>
                schema
                    .min(1, 'At least one denomination is required for fixed denomination')
                    .required('Denominations are required for fixed denomination'),
            otherwise: schema => schema.optional(),
        }),
    expiry: Yup.date()
        .required('Expiry Date is required')
        .min(new Date(), 'Expiry Date must be a future date'),
    brand_logo: Yup.mixed().optional(),
});
