import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import '@testing-library/jest-dom/vitest';
import GuestCard from '@src/domains/dashboard/Hotels/Components/BookingReview/GuestCard';

describe('GuestCard Component', () => {
    const mockPassenger = {
        FirstName: 'John Doe',
        Email: 'john.doe@example.com',
        Phoneno: '1234567890',
        DOB: '30-03-2025',
    };

    const renderComponent = (passenger = mockPassenger, index = 0) =>
        render(<GuestCard passenger={passenger} index={index} />);

    it('renders guest index correctly', () => {
        renderComponent();

        expect(screen.getByText('Guest 1')).toBeInTheDocument();
    });

    it('renders passenger details correctly', () => {
        renderComponent();

        expect(screen.getByText(/FullName/i)).toBeInTheDocument();
expect(screen.getByText(/John Doe/i)).toBeInTheDocument();

        expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    });

   it('handles missing passenger fields gracefully', () => {
    const incompletePassenger = {
        FirstName: 'Jane Doe',
        Email: '',
        Phoneno: '',
        DOB: '',
    };

    renderComponent(incompletePassenger);

    expect(screen.getByText('Guest 1')).toBeInTheDocument();

    expect(screen.getByText('FullName')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();

    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
});


    it('handles missing passenger fields gracefully', () => {
    const incompletePassenger = {
        FirstName: 'Jane Doe',
        Email: '',
        Phoneno: '',
        DOB: '',
    };

    renderComponent(incompletePassenger);

    expect(screen.getByText('Guest 1')).toBeInTheDocument();

    expect(screen.getByText('FullName')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();

    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
});

});
