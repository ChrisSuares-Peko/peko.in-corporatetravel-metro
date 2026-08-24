import * as Yup from 'yup';

const govtServicesSchema = Yup.object().shape({
    name: Yup.string().required('Service name is required'),
    tag: Yup.string().required('Tag is required'),
    category: Yup.string().required('Category is required'),
    authority: Yup.string().nullable(),
    price: Yup.number()
        .typeError('Price must be a number')
        .required('Price is required')
        .min(0, 'Price must be 0 or greater'),
    govtFee: Yup.number()
        .typeError('Government fee must be a number')
        .min(0, 'Government fee must be 0 or greater')
        .nullable(),
    accessKey: Yup.string().required('Access key is required'),
    processingTime: Yup.string().required('Processing time is required'),
    description: Yup.string().nullable(),
    sortOrder: Yup.number().typeError('Sort order must be a number').nullable(),
});

export default govtServicesSchema;
