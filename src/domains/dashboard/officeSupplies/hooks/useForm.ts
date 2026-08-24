import { useCallback } from 'react';

import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { getSurcharge } from '@src/services/surcharge';
import { showToast } from '@src/slices/apiSlice';
import { accessKeys } from '@utils/accessKeys';
import { formatNumberWithLocalString, roundMoney } from '@utils/priceFormat';

import useBasicInfoApi from './useGetBasicInfo';
import useSurchargeDetails from './useSurchargeApi';
import { setPaymentData } from '../../payments/slices/payment';
import { initOrderApi } from '../api/cart';
import { setInitialization } from '../slices/cartSlice';
import { AddressField } from '../types/address';
import { InitializedSellerGroup } from '../types/cartTypes';

/** Comma-joined vendor names of the groups a seller call failed for. */
const failedNames = (groups: { status: string; vendorName: string; bppId: string | null }[]) =>
    groups
        .filter(group => group.status === 'failed')
        .map(group => group.vendorName || group.bppId || 'seller')
        .join(', ');

export default function useForm() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { data } = useBasicInfoApi();
    const { totalGst, cartId, itemsTotalAmount, shippingCharge, validation } = useAppSelector(
        state => state.reducer.cart
    );
    const { role, id } = useAppSelector(state => state.reducer.auth);

    const { surchargeData } = useSurchargeDetails();

    /**
     * Checkout submit. Runs the ONDC /init (final seller quote, ~30s) and then
     * hands the bill off to the SHARED payment screen at /payments — the same
     * way every other domain does it — with `successPath` pointing back at our
     * placing-order page so the ONDC /confirm can run once Cashfree has captured.
     *
     * The payable amount is the sellers' initialized total, and the platform fee
     * is fetched against that exact figure: the backend's validateAmount
     * recomputes pgAmount = amount + surcharge and rejects any drift, so both
     * numbers have to come from the same basis.
     */
    const handleSubmission = useCallback(
        async (values: AddressField) => {
            const pincode = String(values.pincode || '').trim();
            const name = `${values.firstName ?? ''} ${values.lastName ?? ''}`.trim();

            // ---- ONDC /init: billing + the sellers' final quote ----
            const initResult = await initOrderApi({
                userId: id,
                userType: role,
                pincode,
                name,
                phone: values.phoneNumber,
                addressLine: values.address,
                email: data?.email,
                // reuse the select validation's transaction ids so the BPP keeps
                // one session across search → select → init
                groups: validation?.groups
                    ?.filter(group => group.status === 'validated')
                    .map(group => ({
                        bppUri: group.bppUri,
                        providerId: group.providerId,
                        transactionId: group.transactionId,
                    })),
            });

            if (!initResult || !initResult.anyInitialized) {
                const failed = initResult ? failedNames(initResult.groups) : '';
                dispatch(
                    showToast({
                        description: failed
                            ? `Could not confirm your order with the seller(s): ${failed}. Please try again.`
                            : 'Could not confirm your order with the sellers. Please try again.',
                        variant: 'error',
                    })
                );
                return;
            }
            if (initResult.failedCount > 0) {
                notification.warning({
                    message: 'Some items could not be confirmed',
                    description: `Items from ${failedNames(initResult.groups)} could not be confirmed and are excluded from this order.`,
                });
            }
            dispatch(setInitialization(initResult));

            const initializedGroups: InitializedSellerGroup[] = initResult.groups.filter(
                group => group.status === 'initialized'
            );
            // Threaded into create-order paymentData: after Cashfree capture, PG
            // triggers purchase confirm-after-payment with these groups; Easy Split
            // runs on ONDC on_confirm (ondcSellers settlement + confirmed quotes).
            const ondcGroups = initializedGroups.map(group => ({
                bppId: group.bppId,
                bppUri: group.bppUri,
                providerId: group.providerId,
                transactionId: group.transactionId,
                vendorName: group.vendorName,
                amount: group.quote?.total ?? 0,
            }));
            const hasQuote = initializedGroups.length > 0;
            const amount = roundMoney(initResult.initializedTotal);

            // Re-price the platform fee against the amount we are about to charge —
            // the on-page figure was computed from the /select total, which /init
            // can move (finalized delivery charges, or a group dropping out).
            const surcharge = await getSurcharge({
                userId: id,
                userType: role,
                amount,
                accessKey: accessKeys.officeSupplies,
            });
            const platformFee = surcharge ? parseFloat(surcharge.surcharge) || 0 : 0;
            const total = roundMoney(amount + platformFee);

            const billSummary = [
                {
                    key: 'Service Name',
                    value: 'Office Supplies',
                },
                {
                    key: 'Company Name',
                    value: data?.name ?? ' ',
                },
                {
                    key: 'Amount',
                    value: `${amount.toFixed(2)}`,
                },
            ];

            // Exact mirror of the sellers' quote.breakup, in seller order —
            // item rows labeled with the product name + variant + qty, charge
            // rows (tax/delivery/packing/misc…) with the seller's own title
            // (zero-amount rows included). Tax rows are keyed to an item, so
            // they get the product name appended for clarity/uniqueness.
            const quoteRows = initializedGroups.flatMap(group => {
                const sellerSuffix =
                    initializedGroups.length > 1
                        ? ` — ${group.vendorName || group.bppId || 'seller'}`
                        : '';
                return (group.quote?.rows || []).map(row => {
                    const label =
                        row.titleType === 'item'
                            ? `${row.productName ?? row.title}${
                                  row.productName && row.title ? ` (${row.title})` : ''
                              }${row.quantity ? ` × ${row.quantity}` : ''}`
                            : `${row.title || row.titleType || 'Charge'}${
                                  row.productName ? ` — ${row.productName}` : ''
                              }`;
                    return {
                        key: `${label}${sellerSuffix}`,
                        value: `₹ ${row.amount.toFixed(2)}`,
                    };
                });
            });

            const paymentSummary = hasQuote
                ? [
                      ...quoteRows,
                      {
                          key: 'Platform fee (inclusive of GST)',
                          value: `${formatNumberWithLocalString(platformFee)}`,
                      },
                  ]
                : [
                      {
                          key: 'Sub Total',
                          value: `₹ ${(itemsTotalAmount - totalGst).toFixed(2)}`,
                      },
                      {
                          key: 'GST',
                          value: `₹ ${totalGst.toFixed(2)}`,
                      },
                      {
                          key: 'Shipping Fees',
                          value: `₹ ${formatNumberWithLocalString(shippingCharge ?? 0)}`,
                      },
                      {
                          key: 'Platform fee (inclusive of GST)',
                          value: `${formatNumberWithLocalString(platformFee)}`,
                      },
                  ];

            // Where the shared payment screen sends the buyer once Cashfree has
            // captured — PG triggers ONDC confirm; this page polls checkout-result.
            const placingOrderPath = `${paths.dashboard.officeSupplies}/${paths.officeSupplies.placingOrder}`;

            const requestBody = {
                cartId,
                amount,
                transactionId: new Date().valueOf(),
                userEmail: data?.email ?? ' ',
                address: values,
                accessKey: accessKeys.officeSupplies,
                // Office Supplies is ONDC now. create-order persists this body onto
                // paymentGatewayOrders.paymentData and the PG callback spreads it back
                // onto req.body, so this flag is what routes settlement to the
                // ONDC-aware handler instead of the legacy cart/products one.
                isOndc: true,
                // Sellers this capture pays for — used by PG to call purchase confirm.
                ondcGroups,
                // Echoed back by the settlement handler so the shared payment-pending
                // screen also returns here (it reads successUrl off the /complete
                // response, not the redux successPath).
                successUrl: placingOrderPath,
                currentUrl: window.location.href,
            };

            dispatch(
                setPaymentData({
                    billSummary,
                    paymentSummary,
                    totalAmount: total,
                    title: 'Bill Summary',
                    payload: requestBody,
                    // No wallet endpoint: Office Supplies collects via Cashfree only,
                    // and WALLET is disabled for this access key server-side.
                    url: null,
                    earningCashbackAmount:
                        Number(surchargeData && surchargeData?.corporateCashback) || 0,
                    successPath: placingOrderPath,
                    navigatePath: `${paths.dashboard.officeSupplies}/${paths.officeSupplies.checkout}`,
                })
            );

            navigate(paths.dashboard.payments);
        },
        [
            cartId,
            data?.name,
            data?.email,
            dispatch,
            id,
            itemsTotalAmount,
            navigate,
            role,
            shippingCharge,
            surchargeData,
            totalGst,
            validation,
        ]
    );

    return { handleSubmission, data };
}
