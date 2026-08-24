import * as Yup from 'yup';

const paymentMethodsSchema = Yup.object().shape({
    partnerId: Yup.string().required('Please select the partner'),
    paymentMethod: Yup.string().required('Please select the payment method'),
    services: Yup.array()
        .of(Yup.string().required('Invalid service operator ID'))
        .min(1, 'Please select at least one service operator')
        .required('Please select at least one service operator'),
    limitPerTransaction: Yup.number().typeError('Limit per transaction must be a number'),
    limitPerDay: Yup.number().typeError('Limit per day must be a number'),
    limitPerMonth: Yup.number().typeError('Limit per month must be a number'),
});

export default paymentMethodsSchema;
