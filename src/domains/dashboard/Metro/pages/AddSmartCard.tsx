import { Button, Flex, Form, Typography } from 'antd';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';

import TextInput from '@components/atomic/inputs/TextInput';
import { useAppDispatch } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import useSmartCardRecharge from '../hooks/useSmartCardRecharge';
import { smartCardSchema } from '../schema';
import { setSmartCard } from '../slices/metroSlice';

type FormValues = {
    cardNumber: string;
    label: string;
};

export default function AddSmartCard() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { saveCard, isSaving } = useSmartCardRecharge();

    const handleSubmit = async (values: FormValues) => {
        const card = await saveCard({ cardNumber: values.cardNumber, label: values.label || undefined });
        dispatch(setSmartCard(card));
        navigate(
            `${paths.dashboard.corporateTravel}/${paths.metro.index}/${paths.metro.smartCard}/${paths.metro.smartCardRecharge}`
        );
    };

    return (
        <Flex vertical gap={20} style={{ maxWidth: 420, margin: '0 auto' }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
                Add Smart Card
            </Typography.Title>

            <Formik
                initialValues={{ cardNumber: '', label: '' }}
                validationSchema={smartCardSchema}
                onSubmit={handleSubmit}
            >
                {({ handleSubmit: submitForm, isValid, dirty }) => (
                    <Form layout="vertical" onFinish={submitForm}>
                        <TextInput
                            name="cardNumber"
                            label="Smart Card Number"
                            type="text"
                            placeholder="Enter 6–12 digit card number"
                            allowNumbersOnly
                            maxLength={12}
                            isRequired
                        />
                        <TextInput
                            name="label"
                            label="Label (optional)"
                            type="text"
                            placeholder="e.g. My Metro Card"
                            maxLength={40}
                        />
                        <Button
                            htmlType="submit"
                            disabled={!(isValid && dirty)}
                            loading={isSaving}
                            danger
                            type="primary"
                            size="large"
                            style={{ width: '100%', height: 52, borderRadius: 12, fontWeight: 500 }}
                        >
                            Save and Recharge
                        </Button>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
}
