import React, { useEffect } from 'react';

import { Typography, Flex, Skeleton, Image } from 'antd';

import { useAppSelector } from '@src/hooks/store';

import CartSellerGroups from './CartSellerGroups';
import EmptyCartIMG from '../../assets/icons/emptyCart.png';
import { useCartDetailsApi } from '../../hooks/useCartDetailsApi';
import OrderSummary from '../OrderSummary';

/**
 * Shopping-cart page body (Figma 2304-27306): seller-grouped item cards on
 * the left, sticky Order summary on the right. The delivery-address form now
 * lives on the checkout page (Figma 2342-24561), reached via "Proceed to
 * checkout" below.
 */
const CartList: React.FC = () => {
    const { getCartDetails, isLoading } = useCartDetailsApi();
    const cartDetails = useAppSelector((state: { reducer: { cart: any } }) => state.reducer.cart);

    useEffect(() => {
        getCartDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isLoading && cartDetails.items.length === 0) {
        return (
            <Flex gap={20} vertical className="mt-16 h-96 w-full" justify="center" align="center">
                <Image src={EmptyCartIMG} preview={false} width={130} />
                <Typography.Text
                    data-testid="noItem"
                    className="ms-2 text-center text-base text-gray-300"
                >
                    No items found in the cart.
                </Typography.Text>
            </Flex>
        );
    }

    return (
        <div className="mt-2 flex flex-col gap-6 xl:flex-row xl:items-start">
            {/* Left: seller groups */}
            <Flex vertical gap={24} className="min-w-0 xl:flex-[2]">
                {isLoading ? (
                    <Skeleton paragraph={{ rows: 8 }} className="rounded-3xl border p-6" active />
                ) : (
                    <CartSellerGroups items={cartDetails.items} />
                )}
            </Flex>

            {/* Right: sticky order summary */}
            <div className="mb-16 md:mb-0 xl:sticky xl:top-4 xl:flex-1">
                {isLoading ? (
                    <Skeleton paragraph={{ rows: 8 }} className="rounded-3xl border p-6" active />
                ) : (
                    <OrderSummary mode="cart" />
                )}
            </div>
        </div>
    );
};

export default CartList;
