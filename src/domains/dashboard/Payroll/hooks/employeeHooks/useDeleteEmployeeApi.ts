import { useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { deleteEmployee } from '../../api/employeeApi';

interface DeleteEmployeeProps {
    handleCancel?: () => void;
}
export function useDeleteEmployeeApi({ handleCancel }: DeleteEmployeeProps) {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const deleteUser = async (deleteId: string) => {
        setIsLoading(true);
        const success = await deleteEmployee({
            userId: id,
            userType: role,
            idToDelete: deleteId,
        });
        setIsLoading(false);
        if (success && handleCancel) {
            handleCancel();
            setIsDeleted(true);
        } else {
            // Handle failure (e.g., show an error message)
        }
    };

    return { deleteUser, isLoading, isDeleted };
}
