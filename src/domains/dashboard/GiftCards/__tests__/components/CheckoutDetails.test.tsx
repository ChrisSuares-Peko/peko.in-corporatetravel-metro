import { render, screen, fireEvent } from '@testing-library/react';
import ThemeProvider from 'antd/es/config-provider';
import { describe, it, expect } from 'vitest';

import CheckoutDetails from '../../components/CheckoutDetails';

describe('CheckoutDetails Component', () => {
    const totalData = 500;

    const renderComponent = () =>
        render(
            <ThemeProvider>
                <CheckoutDetails totalData={totalData} />
            </ThemeProvider>
        );

    it('renders the component correctly', () => {
        renderComponent();
        expect(screen.getByText(/Total Amount/i)).toBeInTheDocument();
    });

    it('displays the correct total amount', () => {
        renderComponent();

        expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
        expect(screen.getAllByText(/₹\s*500\.00/)[0]).toBeInTheDocument();

        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getAllByText(/₹\s*500\.00/)[1]).toBeInTheDocument();
    });

    it('displays the correct subtotal, discount, and VAT', () => {
        renderComponent();
        expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
        expect(screen.getByText(/Discount/i)).toBeInTheDocument();
        expect(screen.getByText(/VAT/i)).toBeInTheDocument();
        const zeroValues = screen.getAllByText(/₹\s*0\.00/);
        expect(zeroValues).toHaveLength(2);
    });

    it('renders and clicks the Buy Now button', () => {
        renderComponent();
        const button = screen.getByRole('button', { name: /buy now/i });
        expect(button).toBeInTheDocument();
        fireEvent.click(button);
    });

    it('applies the correct button styles', () => {
        renderComponent();
        const button = screen.getByRole('button', { name: /buy now/i });
        expect(button).toHaveStyle('color: white');
    });
});
