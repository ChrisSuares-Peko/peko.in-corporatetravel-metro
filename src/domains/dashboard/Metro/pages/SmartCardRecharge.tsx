import { useEffect, useState } from 'react';

import { Button, Flex, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import AmountChipSelector from '../components/smartCard/AmountChipSelector';
import SmartCardSummary from '../components/smartCard/SmartCardSummary';
import useSmartCardRecharge from '../hooks/useSmartCardRecharge';
import { setSmartCardRecharge } from '../slices/metroSlice';

export default function SmartCardRecharge() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const smartCard = useAppSelector(state => state.reducer.metro.smartCard);
    const { recharge, isRecharging } = useSmartCardRecharge();
    const [amount, setAmount] = useState<number | null>(null);

    useEffect(() => {
        if (!smartCard) {
            navigate(
                `${paths.dashboard.corporateTravel}/${paths.metro.index}/${paths.metro.smartCard}`,
                { replace: true }
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!smartCard) return null;

    const handleRecharge = async () => {
        if (!amount) return;
        const result = await recharge({ cardNumber: smartCard.cardNumber, amount });
        dispatch(setSmartCardRecharge(result));
        navigate(
            `${paths.dashboard.corporateTravel}/${paths.metro.index}/${paths.metro.smartCard}/${paths.metro.smartCardConfirmation}`
        );
    };

    return (
        <Flex vertical gap={20} style={{ maxWidth: 420, margin: '0 auto' }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
                Recharge Smart Card
            </Typography.Title>

            <SmartCardSummary cardNumber={smartCard.cardNumber} label={smartCard.label} />

            <Flex vertical gap={8}>
                <Typography.Text style={{ fontSize: 14, fontWeight: 700 }}>Amount</Typography.Text>
                <AmountChipSelector value={amount} onChange={setAmount} />
            </Flex>

            <Button
                onClick={handleRecharge}
                disabled={!amount}
                loading={isRecharging}
                danger
                type="primary"
                size="large"
                style={{ height: 52, borderRadius: 12, fontWeight: 500 }}
            >
                Recharge Now
            </Button>
        </Flex>
    );
}
