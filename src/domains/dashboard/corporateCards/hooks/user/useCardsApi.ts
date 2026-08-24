import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getUserCards } from '../../api/user/cardsApi';
import { MyCard, MyCardKind } from '../../utils/types';

const mapStatus = (status: string): 'Active' | 'Frozen' => {
    if (status === 'BLOCKED' || status === 'FROZEN') return 'Frozen';
    return 'Active';
};

const extractLast4 = (maskedCardNumber: string) => maskedCardNumber.slice(-4);

export const useCardsApi = (enabled = true) => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [cards, setCards] = useState<MyCard[]>([]);
    const [isLoading, setIsLoading] = useState(enabled);

    const fetchCards = useCallback(async () => {
        if (!enabled) {
            setCards([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const res = await getUserCards(role, id);
        if (res && res.data?.rows?.length) {
            const mapped: MyCard[] = res.data.rows
                .filter(c => c.maskedCardNumber)
                .map(c => ({
                    // key must be the cardIssuance DB id — the backend resolves :cardIssuanceId (freeze/
                    // unfreeze/limits) by primary key, not the vendor orderId. Matches the admin mapper.
                    key: String(c.id),
                    holder: c.cardholder?.name ?? '',
                    nameOnCard: c.nameOnCard,
                    last4: extractLast4(c.maskedCardNumber),
                    validFrom: '',
                    validTo: c.validityPeriod ?? '',
                    balance: `₹${c.remaining.toLocaleString('en-IN')}`,
                    used: c.spent,
                    limit: c.cardLimit,
                    perTxnLimit: c.perTxnLimit,
                    kind: (c.type === 'Physical' ? 'Physical Card' : 'Virtual Card') as MyCardKind,
                    status: mapStatus(c.cardState),
                    terminationStatus: c.terminationStatus,
                    terminationRequested: c.terminationRequested,
                cardViewLink: c.cardViewLink,
                    maskedCardNumber: c.maskedCardNumber,
                    // Default FALSE, never true — a stale or partial payload must fall back to the safe
                    // "Request unfreeze" affordance rather than offering a direct unfreeze that would 403.
                    canSelfUnfreeze: c.canSelfUnfreeze ?? false,
                    frozenByRole: c.frozenByRole ?? null,
                    unfreezeRequestStatus: c.unfreezeRequestStatus ?? null,
                    freezeReasonLabel: c.freezeReasonLabel ?? null,
                    freezeReasonNote: c.freezeReasonNote ?? null,
                }));
            setCards(mapped);
        }
        setIsLoading(false);
    }, [role, id, enabled]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    return { cards, isLoading, refetch: fetchCards };
};
