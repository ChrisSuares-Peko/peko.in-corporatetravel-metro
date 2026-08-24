import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, beforeEach, it, expect } from 'vitest';

import { formatNumberWithLocalString } from '@utils/priceFormat';

import CheckoutTable from '../../components/CheckoutTable';

// vi.mock('@utils/priceFormat');

const mockStore = configureStore();

describe('CheckoutTable Component', () => {
    let store: any;

    beforeEach(() => {
        store = mockStore({
            reducer: {
                giftcardCheckout: {
                    productDetails: {
                        product_name: 'Amazon Gift Card',
                        product_image: 'https://example.com/image.png',
                    },
                    formDetails: {
                        amount: 500,
                        quantity: 2,
                        product: 1000,
                    },
                },
            },
        });
    });

    it('renders the table correctly', () => {
        render(
            <Provider store={store}>
                <CheckoutTable />
            </Provider>
        );

        expect(screen.getByText('Gift Card')).toBeInTheDocument();
        expect(screen.getByText('Quantity')).toBeInTheDocument();
        expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('displays the correct product name', () => {
        render(
            <Provider store={store}>
                <CheckoutTable />
            </Provider>
        );

        expect(screen.getByText('Amazon Gift Card')).toBeInTheDocument();
    });

    it('displays the product image with fallback', () => {
        render(
            <Provider store={store}>
                <CheckoutTable />
            </Provider>
        );

        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', 'https://example.com/image.png');
    });

    it('shows correct price format', () => {
        render(
            <Provider store={store}>
                <CheckoutTable />
            </Provider>
        );

        expect(screen.getByText(/₹\s*1,000\.00/)).toBeInTheDocument();
    });

    it('displays correct quantity', () => {
        render(
            <Provider store={store}>
                <CheckoutTable />
            </Provider>
        );

        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('displays correct total amount', () => {
        render(
            <Provider store={store}>
                <CheckoutTable />
            </Provider>
        );

        expect(screen.getByText(`₹ ${formatNumberWithLocalString(1000)}`)).toBeInTheDocument();
    });

    it('handles missing product details gracefully', () => {
        store = mockStore({
            reducer: {
                giftcardCheckout: {
                    productDetails: {},
                    formDetails: {},
                },
            },
        });

        render(
            <Provider store={store}>
                <CheckoutTable />
            </Provider>
        );

        expect(screen.getByText('Gift Card')).toBeInTheDocument();
        expect(screen.queryByText('Amazon Gift Card')).not.toBeInTheDocument();
        expect(screen.queryByText('INR')).not.toBeInTheDocument(); // No price displayed
    });
});
