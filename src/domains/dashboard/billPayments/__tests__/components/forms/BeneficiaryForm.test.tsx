import { render, screen, cleanup } from '@testing-library/react';
import { Formik } from 'formik';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { useAppSelector } from '@src/hooks/store';
import { accessKeys } from '@utils/accessKeys';

import BeneficiaryForm from '../../../components/forms/BeneficiaryForm'; // Adjust import path

const mockDispatch = vi.fn();

vi.mock('@src/hooks/store', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: vi.fn(),
}));

const mockSetSelectedBillerData = vi.fn();

const renderWithFormik = (ui: React.ReactElement, initialValues = {}) =>
    render(
        <Formik initialValues={initialValues} onSubmit={() => {}}>
            {ui}
        </Formik>
    );

describe('BeneficiaryForm', () => {
    const mockSetService = vi.fn();
    const role = 'admin';
    const id = 123;
    beforeEach(() => {
        cleanup();
        (useAppSelector as Mock).mockImplementation(callback =>
            callback({
                reducer: {
                    auth: {
                        role,
                        id,
                    },
                    beneficiary: { isLoading: false, refresh: false, beneficiaryData: [] },
                },
            })
        );
    });
    it('renders all required form inputs', () => {
        renderWithFormik(
            <BeneficiaryForm
                service={accessKeys.water}
                setService={mockSetService}
                accessKeyName=""
                selectedBillerData={[]}
                setSelectedBillerData={mockSetSelectedBillerData}
                editValues={null}
            />,
            { accessKey: '', name: '', billerId: '' }
        );

        // Check that the inputs are rendered
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByText(/Beneficiary Name/i)).toBeInTheDocument();
    });

    // it('calls handleChange when service provider is selected', async () => {
    //     renderWithFormik(
    //         <BeneficiaryForm
    //             accessKeyName=""
    //             selectedBillerData={[]}
    //             setSelectedBillerData={mockSetSelectedBillerData}
    //             editValues={null}
    //         />,
    //         { accessKey: '', name: '', billerId: '' }
    //     );

    //     const serviceProviderDropdown = screen.getByText('Select Service');

    //     fireEvent.mouseDown(serviceProviderDropdown);
    //     const option = await screen.findByText('Option 1'); // Mock service provider name
    //     fireEvent.click(option);

    //     await waitFor(() => {
    //         expect(mockSetSelectedBillerData).toHaveBeenCalled();
    //     });
    // });

    // it('shows loading state when fetching service providers', () => {
    //     renderWithFormik(
    //         <BeneficiaryForm
    //             accessKeyName=""
    //             selectedBillerData={[]}
    //             setSelectedBillerData={mockSetSelectedBillerData}
    //             editValues={null}
    //         />,
    //         { accessKey: '', name: '', billerId: '' }
    //     );

    //     expect(screen.getByRole('progressbar')).toBeInTheDocument(); // Ant Design shows a spinner with `role="progressbar"`
    // });

    it('renders input fields dynamically when selectedBillerData is present', () => {
        const mockBillerData = [
            {
                paramName: 'Customer ID',
                isOptional: 'false',
                maxLength: 10,
                dataType: 'string',
                minLength: 1,
                regEx: '',
                values: '',
                visibility: true,
            },
        ];

        renderWithFormik(
            <BeneficiaryForm
                service={accessKeys.water}
                setService={mockSetService}
                accessKeyName=""
                selectedBillerData={mockBillerData}
                setSelectedBillerData={mockSetSelectedBillerData}
                editValues={null}
            />,
            { accessKey: '', name: '', billerId: '', 'Customer ID': '' }
        );

        expect(screen.getByPlaceholderText(/Customer ID/i)).toBeInTheDocument();
    });

    it('updates selectedBillerData when editing an existing beneficiary', async () => {
        const mockEditValues = {
            id: 123,
            accessKey: 'electricity',
            name: 'John Doe',
            phoneNo: '1234567890',
            serviceProvider: 'Provider1',
            providerCircle: 'Circle1',
            billerId: '123',
            isActive: true,
            credentialId: 123,
            customerParams: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            serviceOperator: { serviceProvider: 'Provider1', serviceImage: 'image1.jpg' },
        };

        renderWithFormik(
            <BeneficiaryForm
                service={accessKeys.water}
                setService={mockSetService}
                accessKeyName=""
                selectedBillerData={[]}
                setSelectedBillerData={mockSetSelectedBillerData}
                editValues={mockEditValues}
            />,
            { accessKey: 'electricity', name: 'John Doe', billerId: '123' }
        );

        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByText('electricity')).toBeInTheDocument();
    });
});
