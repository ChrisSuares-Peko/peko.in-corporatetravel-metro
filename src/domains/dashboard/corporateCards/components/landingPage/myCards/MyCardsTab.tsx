import { useEffect, useState } from 'react';

import { Empty } from 'antd';

import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import ConfirmFreezeModal from './ConfirmFreezeModal';
import LimitIncreaseModal from './LimitIncreaseModal';
import MyCardCard from './MyCardCard';
import MyCardsHeader from './MyCardsHeader';
import MyCardSkeleton from './MyCardSkeleton';
import RequestNewCardModal from './RequestNewCardModal';
import RequestPhysicalCardModal from './RequestPhysicalCardModal';
import RequestUnfreezeModal from './RequestUnfreezeModal';
import { useCardsApi } from '../../../hooks/user/useCardsApi';
import { useCardStatusApi } from '../../../hooks/user/useCardStatusApi';
import { MyCard } from '../../../utils/types';
import { useDashboardNav } from '../../common/dashboardNav';

interface MyCardsTabProps {
    onCardTransactions?: (last4: string) => void;
}

/** Cardholder "My cards" tab: header + a responsive grid of the cardholder's card panels. */
const MyCardsTab = ({ onCardTransactions }: MyCardsTabProps) => {
    const dispatch = useAppDispatch();
    const navigate = useDashboardNav();
    const { cards: apiCards, isLoading, refetch } = useCardsApi();
    const { submitCardStatus } = useCardStatusApi();
    const [cards, setCards] = useState<MyCard[]>([]);
    const [newCardOpen, setNewCardOpen] = useState(false);
    const [requestPhysicalCard, setRequestPhysicalCard] = useState<MyCard | null>(null);
    const [freezeCard, setFreezeCard] = useState<MyCard | null>(null);
    const [limitCard, setLimitCard] = useState<MyCard | null>(null);
    const [unfreezeRequestCard, setUnfreezeRequestCard] = useState<MyCard | null>(null);
    // Key of the card whose freeze/unfreeze action is in flight (drives the per-card button spinner).
    const [busyKey, setBusyKey] = useState<string | null>(null);

    useEffect(() => {
        setCards(apiCards);
    }, [apiCards]);

    const handleFreeze = async (card: MyCard) => {
        const res = await submitCardStatus(card.key, 'FROZEN');
        if (res) {
            // Refetch rather than patch locally — canSelfUnfreeze and unfreezeRequestStatus are policy the
            // server computes, and a patched row would render the admin-frozen affordance on a self-freeze.
            await refetch();
            dispatch(
                showToast({
                    variant: 'success',
                    description: `Card ••${card.last4} frozen successfully`,
                })
            );
        }
        setFreezeCard(null);
    };

    const handleUnfreeze = async (card: MyCard) => {
        if (card.terminationStatus) return;
        // A cardholder can only lift their OWN freeze — the backend 403s otherwise. Open the request flow
        // rather than firing a call that is guaranteed to fail.
        if (!card.canSelfUnfreeze) {
            setUnfreezeRequestCard(card);
            return;
        }

        setBusyKey(card.key);
        const res = await submitCardStatus(card.key, 'unfreeze');
        if (res) {
            await refetch();
            dispatch(
                showToast({
                    variant: 'success',
                    description: `Card ••${card.last4} unfrozen successfully`,
                })
            );
        }
        setBusyKey(null);
    };

    const handleViewDetails = (card: MyCard) => {
        if (card.cardViewLink) window.open(card.cardViewLink, '_blank', 'noopener,noreferrer');
    };

    const renderCards = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <MyCardSkeleton key={i} />
                    ))}
                </div>
            );
        }
        if (cards.length === 0) {
            return (
                <div className="flex h-64 items-center justify-center">
                    <Empty description="No cards yet. Request a card to get started." />
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {cards.map(card => (
                    <MyCardCard
                        key={card.key}
                        card={card}
                        onViewDetails={handleViewDetails}
                        onFreeze={setFreezeCard}
                        onUnfreeze={handleUnfreeze}
                        onLimitIncrease={setLimitCard}
                        onTransactions={c => {
                            onCardTransactions?.(c.last4);
                            navigate('transactions');
                        }}
                        onCardControls={handleViewDetails}
                        onRequestPhysical={setRequestPhysicalCard}
                        busy={busyKey === card.key}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="-mt-3 flex flex-col gap-6">
            <MyCardsHeader onRequestCard={() => setNewCardOpen(true)} />

            {renderCards()}

            <ConfirmFreezeModal
                card={freezeCard}
                onClose={() => setFreezeCard(null)}
                onConfirm={handleFreeze}
            />

            <LimitIncreaseModal
                card={limitCard}
                onClose={() => setLimitCard(null)}
                onSuccess={refetch}
            />

            <RequestPhysicalCardModal
                open={requestPhysicalCard !== null}
                card={requestPhysicalCard}
                onClose={() => setRequestPhysicalCard(null)}
                onSuccess={refetch}
            />

            <RequestUnfreezeModal
                card={unfreezeRequestCard}
                onClose={() => setUnfreezeRequestCard(null)}
                onSuccess={refetch}
            />

            <RequestNewCardModal
                open={newCardOpen}
                onClose={() => setNewCardOpen(false)}
                onSuccess={refetch}
            />
        </div>
    );
};

export default MyCardsTab;
