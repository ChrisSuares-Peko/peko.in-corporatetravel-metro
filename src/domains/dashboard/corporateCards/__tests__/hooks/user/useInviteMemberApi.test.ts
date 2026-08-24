import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import {
    createSubCorporate,
    validateCreateSubCorporate,
} from '@src/domains/dashboard/settings/api/userManagement';
import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { useInviteMemberApi } from '../../../hooks/user/useInviteMemberApi';

vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(),
}));

vi.mock('@src/slices/apiSlice', () => ({
    showToast: vi.fn((opts: any) => ({ type: 'SHOW_TOAST', payload: opts })),
}));

vi.mock('@src/domains/dashboard/settings/api/userManagement', () => ({
    validateCreateSubCorporate: vi.fn(),
    createSubCorporate: vi.fn(),
}));

const mockDispatch = vi.fn();

const makeDetails = (overrides = {}) => ({
    firstName: 'Alice',
    lastName: 'Adams',
    mobileNo: '9876543210',
    email: 'alice@peko.one',
    department: 'Sales',
    role: 'Employee',
    ...overrides,
});

describe('useInviteMemberApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAppDispatch as unknown as Mock).mockReturnValue(mockDispatch);
    });

    it('starts with isLoading=false', () => {
        const { result } = renderHook(() => useInviteMemberApi());
        expect(result.current.isLoading).toBe(false);
    });

    describe('submitInvite', () => {
        it('sets isLoading=true during the request and false after', async () => {
            let resolve!: (v: any) => void;
            (validateCreateSubCorporate as Mock).mockImplementation(
                () =>
                    new Promise(r => {
                        resolve = r;
                    })
            );

            const { result } = renderHook(() => useInviteMemberApi());
            act(() => {
                result.current.submitInvite(makeDetails());
            });
            expect(result.current.isLoading).toBe(true);

            await act(async () => {
                resolve(false);
            });
            expect(result.current.isLoading).toBe(false);
        });

        it('validates with the combined name, email, mobileNo, role and username', async () => {
            (validateCreateSubCorporate as Mock).mockResolvedValue(false);
            const { result } = renderHook(() => useInviteMemberApi());
            const details = makeDetails({
                firstName: 'Bob',
                lastName: 'Baker',
                email: 'bob@peko.one',
                mobileNo: '1234567890',
                role: 'Admin',
            });

            await act(async () => {
                await result.current.submitInvite(details);
            });

            expect(validateCreateSubCorporate).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Bob Baker',
                    email: 'bob@peko.one',
                    mobileNo: '1234567890',
                    role: 'Admin',
                    username: 'bob@peko.one',
                })
            );
        });

        it('does not create and returns false when validation fails', async () => {
            (validateCreateSubCorporate as Mock).mockResolvedValue(false);
            const { result } = renderHook(() => useInviteMemberApi());

            let returned: any;
            await act(async () => {
                returned = await result.current.submitInvite(makeDetails());
            });

            expect(returned).toBe(false);
            expect(createSubCorporate).not.toHaveBeenCalled();
            expect(showToast).not.toHaveBeenCalled();
        });

        it('creates with Corporate Cards access after validation passes', async () => {
            (validateCreateSubCorporate as Mock).mockResolvedValue({ data: {} });
            (createSubCorporate as Mock).mockResolvedValue({ data: {} });
            const { result } = renderHook(() => useInviteMemberApi());

            await act(async () => {
                await result.current.submitInvite(makeDetails());
            });

            expect(createSubCorporate).toHaveBeenCalledWith(
                expect.objectContaining({
                    services: [{ label: 'Corporate Cards', hasAccess: true }],
                })
            );
        });

        it('dispatches a success toast and returns true when the member is created', async () => {
            (validateCreateSubCorporate as Mock).mockResolvedValue({ data: {} });
            (createSubCorporate as Mock).mockResolvedValue({ data: {} });
            const { result } = renderHook(() => useInviteMemberApi());

            let returned: any;
            await act(async () => {
                returned = await result.current.submitInvite(makeDetails());
            });

            expect(returned).toBe(true);
            expect(showToast).toHaveBeenCalledWith({
                variant: 'success',
                description: 'Invitation sent successfully.',
            });
        });

        it('does not toast and returns false when creation fails', async () => {
            (validateCreateSubCorporate as Mock).mockResolvedValue({ data: {} });
            (createSubCorporate as Mock).mockResolvedValue(false);
            const { result } = renderHook(() => useInviteMemberApi());

            let returned: any;
            await act(async () => {
                returned = await result.current.submitInvite(makeDetails());
            });

            expect(returned).toBe(false);
            expect(showToast).not.toHaveBeenCalled();
        });
    });
});
