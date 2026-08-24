import React from 'react';

import type { BillingCycle, PlanCardVM } from '@utils/plansLandingData';

import MainPlanCard from './MainPlanCard';

interface Props {
    cards: PlanCardVM[];
    billing: BillingCycle;
    loading: boolean;
    onChoose: (card: PlanCardVM) => void;
}

const MainPlansSection: React.FC<Props> = ({ cards, billing, loading, onChoose }) => (
    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        {cards.map(card => (
            <MainPlanCard
                key={card.id}
                card={card}
                billing={billing}
                loading={loading}
                onChoose={onChoose}
            />
        ))}
    </div>
);

export default MainPlansSection;
