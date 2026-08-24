import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getSavedAddressApi } from '../api/address';
import { Address, AddressOptions, SavedAddressResponse } from '../types/address';

/** Delivery textarea — street lines only; pincode/city live in their own fields. */
const formatSavedDeliveryAddress = (address: Address) =>
    [address.addressLine1, address.addressLine2].filter(line => line?.trim()).join('\n');

export function useFetchAddressApi() {
    const { role, id } = useAppSelector(state => state.reducer.auth);

    const [addressOptions, setAddressOptions] = useState<AddressOptions[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getAddress = useCallback(async () => {
        const data: SavedAddressResponse | false = await getSavedAddressApi({
            userId: id,
            userType: role,
        });
        if (data) {
            const addressData = data as SavedAddressResponse;
            const arr: AddressOptions[] = (addressData?.addressDetails || []).map(address => ({
                label: address.name,
                value: JSON.stringify({
                    address: formatSavedDeliveryAddress(address),
                    email: address.email ?? '',
                    phoneNumber: address.phoneNumber ?? '',
                    zipCode: address.zipCode ?? '',
                    contactName: address.name ?? '',
                    businessName: address.nickname ?? '',
                }),
            }));
            setAddressOptions(arr);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, [id, role]);

    useEffect(() => {
        getAddress();
    }, [getAddress]);

    return { addressOptions, isLoading };
}
