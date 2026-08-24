import { useCallback, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { createGiftCards, putUpdateGiftCards } from '../api/giftCards';
import { GiftCardsBody, GiftCardsFormValues, GiftCardsWithoutID } from '../types/giftCards';

export default function useGiftCardsUpdate() {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [responseData, setResponseData] = useState<GiftCardsBody | {}>();
    const [isLoading, setIsLoading] = useState(false);

    const handleGiftCardsCreation = async (payload: GiftCardsWithoutID) => {
        setIsLoading(true);
        const bodyPayload = {
            product_id: payload.product_id,
            brand_logo: payload.brand_logo,
            brand_name: payload.brand_name,
            product_name: payload.product_name,
            merchant_id: payload.merchant_id,
            merchant_name: payload.merchant_name,
            // mrp: payload.mrp ? parseInt(payload.mrp as string, 10) : 0,
            // selling_price: payload.selling_price
            //     ? parseInt(payload.selling_price as string, 10)
            //     : 0,
            min_price: payload.min_price ? parseInt(payload.min_price as string, 10) : 0,
            max_price: payload.max_price ? parseInt(payload.max_price as string, 10) : 0,
            expiry: payload.expiry,
            is_open_denominnation: payload.is_open_denominnation ?? false,
            gv_type: payload.gv_type,
            denominations: payload.denominations,
            // terms_and_condition: payload.terms_and_condition,
            // how_to_redeem: payload.how_to_redeem,
        };
        const response: false | GiftCardsBody = await createGiftCards({
            bodyPayload,
            userDetails: {
                userId: id,
                userType: role,
            },
        });

        setResponseData(response);
        setIsLoading(false);
        return response;
    };

    const updateGiftCardsDetails = useCallback(
        async (updatedData: GiftCardsFormValues) => {
            setIsLoading(true);
            const response: {} | false = await putUpdateGiftCards({
                userId: id,
                userType: role,
                ...updatedData,
            });
            setResponseData(response);
            setIsLoading(false);
            return response;
        },
        [id, role]
    );

    return { handleGiftCardsCreation, responseData, isLoading, updateGiftCardsDetails };
}
