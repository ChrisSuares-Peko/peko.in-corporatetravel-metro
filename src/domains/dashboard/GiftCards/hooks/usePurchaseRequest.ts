import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import { makePreorder } from '../api/index';
import { PurchasePayload } from '../types/types';

export default function usePurchaseRequest() {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const navigate = useNavigate();

    const handlePreorderRequest = async (payload: PurchasePayload): Promise<void> => {
        const response = await makePreorder({
            ...payload,
            credentialId: id,
            userType: role,
        });

        if (response === true) {
            navigate(`/${paths.giftcards.index}/${paths.giftcards.checkout}`);
        } else {
            message.error('The gift card is unavailable at the moment');
            // Throw an error to be caught by the caller
            throw new Error('Gift card purchase failed');
        }
    };

    return { handlePreorderRequest };
}
