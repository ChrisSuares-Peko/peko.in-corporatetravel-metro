import React, { useEffect, useRef, useState } from 'react';

import { Flex, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import DeliveryDetails from './DeliveryDetails';
import OrderReview from './OrderReview';
import { useCartDetailsApi } from '../../hooks/useCartDetailsApi';
import { AddressField } from '../../types/address';
import OrderSummary from '../OrderSummary';

/**
 * Checkout page body (Figma 2342-24561): delivery-address form + read-only
 * order review on the left, sticky Order summary on the right. Redirects
 * back to the cart if it's reached directly with an empty cart.
 */
const CheckoutList: React.FC = () => {
    const navigate = useNavigate();
    const { getCartDetails, isLoading } = useCartDetailsApi();
    const [address, setAddress] = useState<AddressField>();
    const cartDetails = useAppSelector((state: { reducer: { cart: any } }) => state.reducer.cart);

    // Wired from Order summary's "Proceed to checkout" into DeliveryDetails' Formik.
    const formRef = useRef<any>(null);

    useEffect(() => {
        getCartDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isLoading && cartDetails.items.length === 0) {
            navigate(`${paths.dashboard.officeSupplies}/${paths.officeSupplies.cartPage}`, {
                replace: true,
            });
        }
    }, [isLoading, cartDetails.items.length, navigate]);

    if (isLoading) {
        return (
            <div className="mt-2 flex flex-col gap-6 xl:flex-row xl:items-start">
                <Skeleton
                    paragraph={{ rows: 10 }}
                    className="min-w-0 rounded-3xl border p-6 xl:flex-[2]"
                    active
                />
                <Skeleton paragraph={{ rows: 8 }} className="rounded-3xl border p-6 xl:flex-1" active />
            </div>
        );
    }

    // Redirect effect above is firing — render nothing while it navigates away.
    if (cartDetails.items.length === 0) return null;

    return (
        <div className="mt-2 flex flex-col gap-6 xl:flex-row xl:items-start">
            {/* Left: delivery details + order review */}
            <Flex vertical gap={24} className="min-w-0 xl:flex-[2]">
                <DeliveryDetails setAddress={setAddress} formRef={formRef} />
                <OrderReview items={cartDetails.items} />
            </Flex>

            {/* Right: sticky order summary */}
            <div className="mb-16 md:mb-0 xl:sticky xl:top-4 xl:flex-1">
                <OrderSummary mode="checkout" formRef={formRef} address={address} />
            </div>
        </div>
    );
};

export default CheckoutList;
