import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { describe, expect, it, vi } from 'vitest';

import AmountField from '../../components/AmountField';

vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(),
}));

describe('AmountField Component', () => {
    const mockSetFieldValue = vi.fn();

    const renderComponent = (props = {}) =>
        render(
            <Formik initialValues={{ amount: '' }} onSubmit={vi.fn()}>
                <AmountField
                    priceType="FLEXI"
                    min_price="100"
                    max_price="5000"
                    setFieldValue={mockSetFieldValue}
                    isSubmitting={false}
                    denominations={[100, 500, 1000, 2000]}
                    {...props}
                />
            </Formik>
        );

    it('renders input field when priceType is true', () => {
        renderComponent();
        expect(screen.getByPlaceholderText(/Enter Amount/i)).toBeInTheDocument();
    });

    it('renders price tags when priceType is false', () => {
        renderComponent({ priceType: false });

        const priceTags = screen.getAllByText(/₹ 100\.00/);
        expect(priceTags.length).toBeGreaterThan(0);
        expect(screen.getByText('₹ 500.00')).toBeInTheDocument();
        expect(screen.getByText('₹ 1000.00')).toBeInTheDocument();
        expect(screen.getByText('₹ 2000.00')).toBeInTheDocument();
    });

    it('validates input within min and max price range', async () => {
        renderComponent();
        const input = screen.getByPlaceholderText(/Enter Amount/i);

        fireEvent.change(input, { target: { value: '50' } });
        fireEvent.blur(input);

        await waitFor(() => {
            expect(
                screen.getByText(/Please enter a value between/i)
            ).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: '200' } });
        fireEvent.blur(input);

        await waitFor(() => {
            expect(
                screen.queryByText(/Value must be within the min and max prices/i)
            ).not.toBeInTheDocument();
        });
    });

    it('validates selected amount against fixed denominations', async () => {
        renderComponent({ priceType: false });

        fireEvent.click(screen.getByText('₹ 500.00'));

        expect(mockSetFieldValue).toHaveBeenCalledWith('amount', 500);
    });

    it('clears input and does not allow invalid values', async () => {
        renderComponent();
        const input = screen.getByPlaceholderText(/Enter Amount/i);

        fireEvent.change(input, { target: { value: 'abc' } });

        await waitFor(() => {
            expect(input).toHaveValue('');
        });
    });

    it('restricts non-numeric input using keydown event', async () => {
        renderComponent();
        const input = screen.getByPlaceholderText(/Enter Amount/i);

        fireEvent.keyDown(input, { key: 'a' });
        fireEvent.keyDown(input, { key: '!' });

        fireEvent.change(input, { target: { value: '1234' } });
        expect(input).toHaveValue('1234');
    });
});
