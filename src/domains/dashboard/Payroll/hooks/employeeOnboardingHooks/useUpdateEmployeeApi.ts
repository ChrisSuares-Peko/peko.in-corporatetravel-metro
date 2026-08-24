import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';
import {store} from '@store/store';

import {
    updatePersonalInfo,
    updateEmployeeInfo,
    updateSalaryInfo,
    updateDocumentInfo,
    updateBankInfo,
    createEmployeeInfo,
} from '../../api/employeeOnboarding/index';
import { setEmployeeId, setRefresh } from '../../slices/employeeSettings';
import { invalidateDashboardCache } from '../dashboardHooks/useDashboardApi';
import { invalidateEmployeeCountCache } from '../dashboardHooks/useGetEmployeeCount';

export default function useEmployeeInfoApi() {
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const {
        refresh,
        id: employeeId,
        profileImage: existingProfileImage,
    } = useAppSelector(state => state.reducer.employeeSettings);
    const profileImage = useAppSelector(state => state.reducer.employee.imageDetails);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    // Method to update personal information
    const updatePersonalInformation = async (personalInfoPayload: any) => {
        const payload = {
            profileImage: profileImage?.profileImage?.base64
                ? {
                      base64: profileImage.profileImage.base64,
                      format: profileImage.profileImage.format,
                  }
                : existingProfileImage,
            personalInformation: {
                ...personalInfoPayload,
            },
            userId,
            userType,
            employeeId,
        };

        const res = await updatePersonalInfo(payload);

        if (res) {
            dispatch(
                showToast({
                    description: 'Personal information updated successfully',
                    variant: 'success',
                })
            );
            console.log(res, 'response here');

            dispatch(setEmployeeId(res.id));
            dispatch(setRefresh(!refresh));
        }
    };

    // Method to update employee information
    const updateEmployeeInformation = async (employeeInfoPayload: any) => {
        const payload = {
            profileImage: profileImage?.profileImage?.base64
                ? {
                      base64: profileImage.profileImage.base64,
                      format: profileImage.profileImage.format,
                  }
                : existingProfileImage,
            employeeInformation: {
                ...employeeInfoPayload,
            },
            userId,
            userType,
            employeeId,
        };
        const res = await updateEmployeeInfo(payload);

        if (res) {
            dispatch(
                showToast({
                    description: 'Employee information updated successfully',
                    variant: 'success',
                })
            );
            dispatch(setRefresh(!refresh));
        }
    };

    // Method to update salary information
    const updateSalaryInformation = async (salaryInfoPayload: any) => {
        const payload = {
            profileImage: profileImage?.profileImage?.base64
                ? {
                      base64: profileImage.profileImage.base64,
                      format: profileImage.profileImage.format,
                  }
                : existingProfileImage,
            ...salaryInfoPayload,
            userId,
            userType,
            employeeId,
        };
        const res = await updateSalaryInfo(payload);

        if (res) {
            dispatch(
                showToast({
                    description: 'Salary information updated successfully',
                    variant: 'success',
                })
            );
            dispatch(setRefresh(!refresh));
        }
    };

    // Method to update document information
    const updateDocumentInformation = async (docInfoPayload: any[]) => {
        const payload = {
            profileImage: profileImage?.profileImage?.base64
                ? {
                      base64: profileImage.profileImage.base64,
                      format: profileImage.profileImage.format,
                  }
                : existingProfileImage,
            employeeDocuments: docInfoPayload, // Ensure this is an array of documents
            userId,
            userType,
            employeeId,
        };

        const res = await updateDocumentInfo(payload);

        if (res) {
            dispatch(
                showToast({
                    description: 'Document information updated successfully',
                    variant: 'success',
                })
            );
            dispatch(setRefresh(!refresh));
        }
    };

    // Method to update bank information
    const updateBankInformation = async (bankInfoPayload: any) => {
        const payload = {
            profileImage: profileImage?.profileImage?.base64
                ? {
                      base64: profileImage.profileImage.base64,
                      format: profileImage.profileImage.format,
                  }
                : existingProfileImage,
            bankDetails: {
                ...bankInfoPayload,
            },
            userId,
            userType,
            employeeId,
        };
        const res = await updateBankInfo(payload);

        if (res) {
            dispatch(
                showToast({
                    description: 'Bank information updated successfully',
                    variant: 'success',
                })
            );
            dispatch(setRefresh(!refresh));
            navigate(
                `/${paths.payroll.index}/${paths.payroll.employees}/${paths.payroll.employeeAdded}`
            );
        }
    };
    const createEmployee = async (employeeDetails: any) => {
        const payload = {
            ...employeeDetails,
            userId,
            userType,
            employeeId,
        };

        const res = await createEmployeeInfo(payload);

        if (res) {
            invalidateDashboardCache();
            invalidateEmployeeCountCache();
            store.dispatch(showToast({
                description: 'Employee added successfully',
                variant: 'success',
            }))
            navigate(
                `/${paths.payroll.index}/${paths.payroll.employees}`
            );
        }
    };

    return {
        updatePersonalInformation,
        updateEmployeeInformation,
        updateSalaryInformation,
        updateDocumentInformation,
        updateBankInformation,
        createEmployee,
    };
}
