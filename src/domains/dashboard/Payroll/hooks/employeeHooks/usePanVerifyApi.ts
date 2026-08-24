import { useCallback, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { getPanVerify, sendAadharOtpEmployee, verifyOtp } from '../../api/employeeOnboarding';

export default function UsePanVerifyApi(employeeId: string) {
    const dispatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [employeeDetails, setEmployeeDetails] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [isAadharLoading, setIsAadharLoading] = useState(false);
    const [isPanVerified, setIsPanVerified] = useState(false);
    const [otpSending, setIsOtpSending] = useState(false);

    const getPan = useCallback(
        async (panNumber: string) => {
            try {
                setIsLoading(true);

                const data = await getPanVerify({
                    userId: id,
                    userType: role,
                    panNumber,
                    employeeId,
                });

                // SUCCESS CASE
                if (data?.valid === true) {
                    setIsPanVerified(true);
                    setEmployeeDetails(data);

                    dispatch(
                        showToast({
                            variant: 'success',
                            description: 'PAN verified successfully',
                        })
                    );
                }
                //  FAILURE CASE
                else {
                    setIsPanVerified(false);

                    dispatch(
                        showToast({
                            variant: 'error',
                            description: 'PAN not verified.Please provide a valid PAN',
                        })
                    );
                }
            } catch (error) {
                dispatch(
                    showToast({
                        variant: 'error',
                        description: 'PAN verification failed',
                    })
                );
            } finally {
                setIsLoading(false);
            }
        },
        [id, role, employeeId, dispatch]
    );

    const sendAadhaarOtp = useCallback(
        async (aadhaarNumber: string) => {
            try {
                setIsAadharLoading(true);

                const data = await sendAadharOtpEmployee({
                    userId: id,
                    userType: role,
                    aadhaarNumber,
                    employeeId,
                });
                

                // SUCCESS CASE
                if (data) {
                    dispatch(
                        showToast({
                            variant: 'success',
                            description: 'OTP sent to Aadhaar-linked email successfully',
                        })
                    );
                    return data.ref_id; // return ref_id for OTP modal
                }
                //  FAILURE CASE
                return null;
            } catch (error) {
                dispatch(
                    showToast({
                        variant: 'error',
                        description: 'Aadhaar verification failed',
                    })
                );
                return null;
            } finally {
                setIsAadharLoading(false);
            }
        },
        [id, role, employeeId, dispatch]
    );

    const verifyAadhaarOtp = useCallback(
        async (otp: string, ref_id: string,aadhaarNumber: string) => {
            try {
                setIsOtpSending(true);
                const data = await verifyOtp({
                    userId: id,
                    userType: role,
                    employeeId,
                    otp,
                    ref_id,
                    aadhaarNumber
                });

                console.log("Daaata", data)

                if (data?.status==='VALID') {
                    dispatch(
                        showToast({
                            variant: 'success',
                            description: 'Aadhaar verified successfully',
                        })
                    );
                    setIsOtpSending(false);
                    return true;
                }
                setIsOtpSending(false);
                return false;
            } catch (error) {
                dispatch(
                    showToast({ variant: 'error', description: 'Aadhaar verification failed' })
                );
                return false;
            } finally {
                setIsAadharLoading(false);
            }
        },
        [id, role, employeeId, dispatch]
    );
    return {
        data: employeeDetails,
        isLoading,
        getPan,
        isPanVerified,
        isAadharLoading,
        sendAadhaarOtp,
        verifyAadhaarOtp,
        otpSending,
    };
}
