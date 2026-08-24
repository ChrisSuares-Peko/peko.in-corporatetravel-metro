import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, it, expect } from 'vitest';

import CheckoutTableMobile from '../../components/CheckoutTableMobile';

const mockStore = configureStore();
const defaultProduct = {
    product_image: 'https://example.com/sample-image.png',
    product_name: 'Amazon Gift Card',
};
const defaultFormData = {
    amount: 500,
    quantity: 2,
    product: 1000,
};

const renderComponent = (productDetails = defaultProduct, formDetails = defaultFormData) => {
    const store = mockStore({
        reducer: {
            giftcardCheckout: {
                productDetails,
                formDetails,
            },
        },
    });

    return render(
        <Provider store={store}>
            <CheckoutTableMobile />
        </Provider>
    );
};

describe('CheckoutTableMobile Component', () => {
    it('renders the component correctly', () => {
        renderComponent();
        expect(screen.getByText('Amazon Gift Card')).toBeInTheDocument();
    });

    // it('displays the product image with fallback if not provided', () => {
    //     renderComponent({ product_image: '', product_name: 'Amazon Gift Card' });
    //     const image = screen.getByRole('img');
    //     screen.debug()
    //     expect(image).toHaveAttribute('src','https://example.com/sample-image.png');
    // });

    it('renders price, quantity, and subtotal correctly', () => {
        renderComponent();
        expect(screen.getByText('Price')).toBeInTheDocument();
        expect(screen.getByText('₹ 500')).toBeInTheDocument();
        expect(screen.getByText('Quantity')).toBeInTheDocument();
        expect(screen.getByText('2 Gift Card')).toBeInTheDocument();
        expect(screen.getByText('Sub total')).toBeInTheDocument();
        expect(screen.getByText('₹ 1000')).toBeInTheDocument();
    });

    it('handles missing form data gracefully', () => {
        renderComponent(defaultProduct, {
            amount: 0,
            quantity: 0,
            product: 0,
        });
        expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    });

    it('handles missing product data gracefully', () => {
        renderComponent(
            {
                product_image: '',
                product_name: '',
            },
            defaultFormData
        );
        expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    });
});
