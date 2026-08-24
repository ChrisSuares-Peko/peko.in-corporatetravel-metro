import { useCallback, useEffect, useState } from 'react';

import { SuccessGenericResponse } from '@customtypes/general';
import { useAppSelector } from '@src/hooks/store';

import { createDocument, deleteDocument, getAllDocs, updateDocument } from '../api/index';

export default function useDocApi({
    searchText,
    category,
    sort,
    page,
    itemsPerPage,
    filter,
    from,
    to,
    sortField,
}: any) {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [doc, setDocs] = useState<any>([]);

    const [refresh, setRefresh] = useState<boolean>(false);
    const [count, setCount] = useState<number>(1);

    const getDocs = useCallback(async () => {
        setIsLoading(true);
        const data: any | false = await getAllDocs({
            userId: id,
            userType: role,
            from,
            to,
            searchText,

            page,
            itemsPerPage,
        });

        if (data) {
            setDocs(data.data);
            setCount(data.recordsTotal);
            setRefresh(true);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
        setRefresh(false);
    }, [id, role, from, to, searchText, page, itemsPerPage]);

    const createDoc = useCallback(
        async (payload: any) => {
            setIsLoading(true);
            const data: SuccessGenericResponse<any> | false = await createDocument({
                userId: id,
                userType: role,
                ...payload,
            });
            if (data) {
                setRefresh(true);
                return data;
            }
            setIsLoading(false);
            return false;
        },
        [id, role]
    );

     const updateDoc = useCallback(
        async (docId:any,payload: any) => {
            setIsLoading(true);
            const data: SuccessGenericResponse<any> | false = await updateDocument({
                userId: id,
                userType: role,
                ...payload,
                docId
            });
            if (data) {
                setRefresh(true);
                return data;
            }
            setIsLoading(false);
            return false;
        },
        [id, role]
    );


    const deteteDoc = useCallback(
        async (docId: number) => {
            setIsLoading(true);
            const data: SuccessGenericResponse<any> | false = await deleteDocument({
                userId: id,
                userType: role,
                docId,
            });
            if (data) {
                setRefresh(true);
                return true;
            }
            setIsLoading(false);
            return false;
        },
        [id, role]
    );

    useEffect(() => {
        getDocs();
    }, [getDocs, refresh]);

    return { isLoading, doc, count, setRefresh, createDoc, deteteDoc, updateDoc };
}
