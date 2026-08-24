import * as Yup from 'yup';

const couponCodeSchema = Yup.object().shape({
    couponCode: Yup.string().required('Please enter the coupon code'),
    discountType: Yup.string().required('Please select the discount type'),
    discount: Yup.number().required('Please enter the discount'),
    validFrom: Yup.string().required('Please select the start date'),
    validTo: Yup.string().required('Please select the end date'),
});

export default couponCodeSchema;
