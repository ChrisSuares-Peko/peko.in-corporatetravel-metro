import { act, renderHook } from '@testing-library/react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import { makePreorder } from '../../api/index';
import usePurchaseRequest from '../../hooks/usePurchaseRequest';
import { PurchasePayload } from '../../types/types';

// 🛠️ Mock dependencies
vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(),
}));
vi.mock('antd', () => ({
    message: { error: vi.fn() },
}));
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));
vi.mock('../../api/index', () => ({
    makePreorder: vi.fn(),
}));

describe('usePurchaseRequest Hook', () => {
    const mockNavigate = vi.fn();
    const mockPayload: PurchasePayload = {
        total_selling_price: 100,
        items: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        (useAppSelector as Mock).mockReturnValue({ role: 'admin', id: '123' });
        (useNavigate as Mock).mockReturnValue(mockNavigate);
    });

    it('should navigate to checkout on successful preorder request', async () => {
        (makePreorder as Mock).mockResolvedValue(true);

        const { result } = renderHook(() => usePurchaseRequest());

        await act(async () => {
            await result.current.handlePreorderRequest(mockPayload);
        });

        expect(makePreorder).toHaveBeenCalledWith({
            ...mockPayload,
            credentialId: '123',
            userType: 'admin',
        });
        expect(mockNavigate).toHaveBeenCalledWith(
            `/${paths.giftcards.index}/${paths.giftcards.checkout}`
        );
        expect(message.error).not.toHaveBeenCalled();
    });

    it('should show an error message if the preorder request fails', async () => {
        (makePreorder as Mock).mockResolvedValue(false);

        const { result } = renderHook(() => usePurchaseRequest());

        await expect(
            act(async () => {
                await result.current.handlePreorderRequest(mockPayload);
            })
        ).rejects.toThrow('Gift card purchase failed');

        expect(makePreorder).toHaveBeenCalledWith({
            ...mockPayload,
            credentialId: '123',
            userType: 'admin',
        });
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(message.error).toHaveBeenCalledWith('The gift card is unavailable at the moment');
    });
});
