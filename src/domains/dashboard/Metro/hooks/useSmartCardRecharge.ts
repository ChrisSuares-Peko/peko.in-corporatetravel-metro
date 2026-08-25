import { useCallback, useState } from 'react';

import { addSmartCard, rechargeSmartCard } from '../api';
import { SmartCard, SmartCardRecharge } from '../types/metro';

export default function useSmartCardRecharge() {
    const [isSaving, setIsSaving] = useState(false);
    const [isRecharging, setIsRecharging] = useState(false);

    const saveCard = useCallback(async (payload: SmartCard): Promise<SmartCard> => {
        setIsSaving(true);
        try {
            return await addSmartCard(payload);
        } finally {
            setIsSaving(false);
        }
    }, []);

    const recharge = useCallback(
        async (payload: { cardNumber: string; amount: number }): Promise<SmartCardRecharge> => {
            setIsRecharging(true);
            try {
                return await rechargeSmartCard(payload);
            } finally {
                setIsRecharging(false);
            }
        },
        []
    );

    return { saveCard, isSaving, recharge, isRecharging };
}
