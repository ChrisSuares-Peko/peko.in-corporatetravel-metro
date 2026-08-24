import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { describe, it, expect, vi } from 'vitest';

import SubscriptionSettings from '../../../components/settings/SubscriptionSettings';

// Mock dependencies
vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn().mockReturnValue({
        user: { roleName: 'admin' },
    }),
}));
vi.mock('@src/hooks/useScreenSize', () => ({
    default: () => ({ md: true }),
}));
vi.mock('@src/hooks/useGetESignCount', () => ({
    default: () => ({
        count: 5,
        lastAdded: '2024-01-01',
        isLoading: false,
    }),
}));
vi.mock('@src/hooks/useSubscriptionAddons', () => ({
    default: () => ({
        addonData: { maxLimit: 50, unitPrice: 10 },
        purchaseData: {
            currentSubscription: {
                billingType: 'monthly',
                subscriptionAmountPaid: 500,
                maxLimit: 100,
                status: 'active',
                subscriptionStartDate: '2023-01-01',
                subscriptionEndDate: '2023-12-31',
                package: { packageName: 'Basic Plan' },
            },
            isGroupSubscription: false,
        },
        isLoading: false,
    }),
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async importOriginal => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockStore = configureStore();
const store = mockStore({});

describe('SubscriptionSettings Component', () => {
    it('renders the component correctly', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <SubscriptionSettings />
                </MemoryRouter>
            </Provider>
        );

        // Check if the subscription plan details are displayed
        expect(screen.getByText('Basic Plan - Monthly')).toBeInTheDocument();
        expect(screen.getByText(/₹ 500/i)).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Monthly')).toBeInTheDocument();
    });

    it('displays an error if upgrade is clicked without selecting signs', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <SubscriptionSettings />
                </MemoryRouter>
            </Provider>
        );

        const upgradeButton = screen.getByText('Upgrade');
        fireEvent.click(upgradeButton);

        expect(screen.getByText('Please select number of additional eSigns.')).toBeInTheDocument();
    });
});
