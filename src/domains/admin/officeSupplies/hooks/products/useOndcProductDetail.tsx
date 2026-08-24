import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getOndcProductByIdApi, setOndcProductVisibilityApi } from '../../api/ondcProducts';
import { AdminOndcProductDetail } from '../../types/ondcProduct';

/** Single ONDC product (admin catalog detail) + visibility toggle. */
const useOndcProductDetail = (id?: string) => {
    const { role, id: userId } = useAppSelector(state => state.reducer.auth);
    const [product, setProduct] = useState<AdminOndcProductDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const fetchProduct = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        const data = await getOndcProductByIdApi({ userId, userType: role, id });
        if (data) setProduct(data);
        else setNotFound(true);
        setIsLoading(false);
    }, [id, userId, role]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const toggleVisibility = async () => {
        if (!product) return;
        setIsToggling(true);
        const next = !product.visibleOnPeko;
        const ok = await setOndcProductVisibilityApi({ userId, userType: role, id: product.id, visible: next });
        if (ok) setProduct(p => (p ? { ...p, visibleOnPeko: next } : p));
        setIsToggling(false);
    };

    return { product, isLoading, notFound, isToggling, toggleVisibility };
};

export default useOndcProductDetail;
