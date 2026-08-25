import { useEffect } from 'react';

import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import SuccessScreen from '@components/molecular/success/SuccessScreen';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import { clearSmartCard } from '../slices/metroSlice';
import maskCardNumber from '../utils/maskCardNumber';

export default function SmartCardConfirmation() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const smartCard = useAppSelector(state => state.reducer.metro.smartCard);
    const recharge = useAppSelector(state => state.reducer.metro.recharge);

    useEffect(() => {
        if (!smartCard || !recharge) {
            navigate(`${paths.dashboard.corporateTravel}/${paths.metro.index}`, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!smartCard || !recharge) return null;

    const handleDone = () => {
        dispatch(clearSmartCard());
        navigate(paths.dashboard.corporateTravel);
    };

    return (
        <SuccessScreen
            isOtherSuccess
            title="Recharge successful!"
            message={`₹ ${recharge.amount.toFixed(2)} added to card ${maskCardNumber(recharge.cardNumber)} on ${dayjs(recharge.rechargedAt).format('DD MMM YYYY, hh:mm A')}.`}
        >
            <button
                type="button"
                onClick={handleDone}
                className="h-11 px-8 rounded-lg border border-[#FF4F4F] text-[#FF4F4F] bg-white hover:bg-[#fff4f4]"
            >
                Done
            </button>
        </SuccessScreen>
    );
}
