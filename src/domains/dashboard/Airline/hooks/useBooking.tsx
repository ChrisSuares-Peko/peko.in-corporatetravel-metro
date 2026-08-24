import { useState } from 'react';

import { useAppSelector, useAppDispatch } from '@src/hooks/store';

import { checkAgencyBalanceApi } from '../../payments/api';
import { postBooking } from '../api';
import { setBookingCompletedAt } from '../slices/airlineSlice';

export default function useBooking() {
    const dispatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const { payload: paymentdata } = useAppSelector(state => state.reducer.payment);
    const { paymentData } = useAppSelector(
        state => state.reducer.airline
    );
    const [isLoading, setIsLoading] = useState(false);
    const bookingHandler = async () => {
        setIsLoading(true);
        if (!paymentdata) {
            setIsLoading(false);
            return false;
        }

        const amount = paymentData?.payload?.outbount?.amount || 0;
        
        if (!paymentData || amount === 0) {
            setIsLoading(false);
            return false;
        }
        
        const transformedPassengers = paymentData?.payload?.outbount?.passengers?.map(
            (p: { SeatDynamic: any; Baggage: any; MealDynamic: any }) => ({
                seatAmount: (p.SeatDynamic || []).reduce(
                    (sum: any, s: { Price: any }) => sum + (s.Price || 0),
                    0
                ),
                baggageAmount: (p.Baggage || []).reduce(
                    (sum: any, b: { Price: any }) => sum + (b.Price || 0),
                    0
                ),
                mealAmount: (p.MealDynamic || []).reduce(
                    (sum: any, m: { Price: any }) => sum + (m.Price || 0),
                    0
                ),
            })
        ) || [];

        const isAgencyBalanceSufficient = await checkAgencyBalanceApi({
            userType: role,
            userId: id,
            amount,
            passengers: transformedPassengers,
            traceId: paymentData?.payload?.outbount?.TraceId || paymentData?.payload?.outbount?.traceId,
        });
        if (!isAgencyBalanceSufficient) {
            setIsLoading(false);
            return false;
        }

        const payload = {
            outbount: paymentdata.outbount,
            inbount: paymentdata.inbount,
        };

        const res = await postBooking({ payload, userType: role, userId: id });
        setIsLoading(false);
        if (
            res &&
            res.outbount.BookingId &&
            res.outbount.PNR &&
            (!paymentdata.inbount || (res.inbount.BookingId && res.inbount.PNR))
        ) {
            // Set booking completion timestamp for non-LCC payment timer
            dispatch(setBookingCompletedAt(new Date().toISOString()));
            return res;
        }
        return false;
    };

    return { bookingHandler, isLoading };
}
