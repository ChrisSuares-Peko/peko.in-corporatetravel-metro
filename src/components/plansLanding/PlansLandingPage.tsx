import React, { useState } from 'react';

import type {
    BillingCycle,
    ComparisonColumn,
    ComparisonFeature,
    IndividualServiceView,
    PlanCardVM,
} from '@utils/plansLandingData';

import BillingToggle from './BillingToggle';
import FeatureComparisonTable from './FeatureComparisonTable';
import IndividualServicesSection from './IndividualServicesSection';
import MainPlansSection from './MainPlansSection';
import PlanHeader from './PlanHeader';
import TrustBadges from './TrustBadges';

export interface PlansLandingPageProps {
    /** Main plan cards built from the live packages. */
    planCards: PlanCardVM[];
    /** Comparison table built from the live packages + planServicesMap. */
    comparison: { columns: ComparisonColumn[]; rows: ComparisonFeature[] };
    /** À-la-carte cards built from the live individualPlans. */
    individualServices: IndividualServiceView[];
    /** Live packages still loading — keeps the primary CTAs busy. */
    isResolvingPlans: boolean;
    /** Max annual discount % across plans — drives the "Up to X% off" tag on the Annual toggle. */
    annualDiscountPercent: number;
    /** Starts the purchase flow for a main plan with the currently-selected billing cycle. */
    onChoosePlan: (card: PlanCardVM, billing: BillingCycle) => void;
    onSubscribeIndividual: (service: IndividualServiceView) => void;
}

const PlansLandingPage: React.FC<PlansLandingPageProps> = ({
    planCards,
    comparison,
    individualServices,
    isResolvingPlans,
    annualDiscountPercent,
    onChoosePlan,
    onSubscribeIndividual,
}) => {
    const [billing, setBilling] = useState<BillingCycle>('monthly');

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
            <PlanHeader />
            <div className="flex flex-col gap-10 sm:gap-12">
                <div className="flex flex-col gap-6 sm:gap-8">
                    <BillingToggle
                        value={billing}
                        onChange={setBilling}
                        annualDiscountPercent={annualDiscountPercent}
                    />
                    <MainPlansSection
                        cards={planCards}
                        billing={billing}
                        loading={isResolvingPlans}
                        onChoose={packageId => onChoosePlan(packageId, billing)}
                    />
                </div>
                <IndividualServicesSection
                    services={individualServices}
                    onSubscribe={onSubscribeIndividual}
                />
                <FeatureComparisonTable columns={comparison.columns} rows={comparison.rows} />
                <TrustBadges />
            </div>
        </div>
    );
};

export default PlansLandingPage;
