import * as Yup from 'yup';

const seriveRuleSchema = Yup.object().shape({
    rule: Yup.string().required('Please enter the rule'),
    description: Yup.string().required('Please enter the description'),
});

export default seriveRuleSchema;
