import { useCallback, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { getPackageDetails, getSubscriptionPricing } from '../api';
import { PackageDetailsResponse, SelectedType } from '../types';

type GetPackageDetailsProps = {
    packageId: number;
    selectedType: SelectedType;
    setTotalPackagePrice: React.Dispatch<React.SetStateAction<number>>;
};

// Combines two endpoints into the single shape components consumed before the refactor:
//   1. users   GET /subscription/package-details        → static package config
//   2. payGW   GET /payment-gateway/.../subscription-pricing → live discount + addon recurring price
// Pricing math lives only in paymentGateway, so the price shown on the review screen
// is exactly what validatePrice checks against on create-subscription-order.
export default function useGetPackageDetails({
    packageId,
    selectedType,
    setTotalPackagePrice,
}: GetPackageDetailsProps) {
    const [tableData, setTableData] = useState<PackageDetailsResponse>();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const dispatch = useAppDispatch();

    const getPackageDetail = useCallback(async () => {
        setIsLoading(true);
        setIsError(false);

        const [pkg, pricing] = await Promise.all([
            getPackageDetails(packageId),
            getSubscriptionPricing({
                userId: id,
                userType: role,
                packageId,
                billingType: selectedType === 'annually' ? 'ANNUALLY' : 'MONTHLY',
            }),
        ]);

        // The static package config is required to render the review card. If it fails, surface an
        // error + retry instead of leaving the card stuck on a skeleton forever.
        if (!pkg) {
            setIsError(true);
            setIsLoading(false);
            dispatch(
                showToast({
                    variant: 'error',
                    description: "Couldn't load this plan's details. Please try again.",
                })
            );
            return;
        }

        const pricingData = pricing || null;
        const merged: PackageDetailsResponse = {
            packageDetails: pkg.packageDetails,
            discount: pricingData
                ? pricingData.breakdown
                : { price: 0, breakdown: [] },
            annualAddonPrice: pricingData?.annualAddonPrice ?? 0,
            monthlyAddonPrice: pricingData?.monthlyAddonPrice ?? 0,
            expectedPaymentAmount: pricingData?.expectedPaymentAmount,
        };

        // Use the backend's expected amount when available — guarantees the UI total matches
        // what validatePrice will accept. Fall back to client-side math only if pricing failed.
        if (pricingData && typeof pricingData.expectedPaymentAmount === 'number') {
            setTotalPackagePrice(pricingData.expectedPaymentAmount);
        } else {
            const packagePrice = Number(pkg.packageDetails.packagePrices?.[selectedType]) || 0;
            const packageDiscount = Number(pkg.packageDetails.discount?.[selectedType]) || 0;
            const addonPrice =
                selectedType === 'monthly'
                    ? Number(merged.monthlyAddonPrice)
                    : Number(merged.annualAddonPrice);
            setTotalPackagePrice(packagePrice - packageDiscount + addonPrice);
        }

        setTableData(merged);
        setIsLoading(false);
    }, [packageId, selectedType, setTotalPackagePrice, id, role, dispatch]);

    useEffect(() => {
        getPackageDetail();
    }, [getPackageDetail]);

    return { data: tableData, isLoading, isError, refetch: getPackageDetail };
}
