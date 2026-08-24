import { useState } from 'react';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';

import useDeleteFleet from '../../hooks/deleteFleet';
import useAddDocApi from '../../hooks/useAddDocApi';
import useSubmitQuoteApi from '../../hooks/useSubmitQuoteApi';
import useUpdateServiceDates from '../../hooks/useUpdateServiceDates';
import { resetInputParams, resetRcResponse } from '../../slices/turboSlice';

const useVehicleActions = ({ inputParams, verifyRcResponse, id, setRefresh }: any) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { deleteApi } = useDeleteFleet();
    const { addDocApi, loading } = useAddDocApi();
    const { updateServiceDatesApi, loading: serviceDatesLoading } = useUpdateServiceDates();
    const { submitQuoteApi, loading: quoteLoading } = useSubmitQuoteApi();

    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [openServiceDatesModal, setOpenServiceDatesModal] = useState(false);
    const [openQuoteModal, setOpenQuoteModal] = useState(false);
    const [openQuoteSuccessModal, setOpenQuoteSuccessModal] = useState(false);
    const [quoteMessage, setQuoteMessage] = useState('');

    const handleDelete = () => {
        deleteApi({ id }).then((res: any) => {
            if (res) {
                setRefresh(true);
                dispatch(
                    showToast({
                        description: 'Vehicle deleted successfully',
                        variant: 'success',
                    })
                );
                dispatch(resetRcResponse());
                navigate(`${paths.dashboard.turbo}/${paths.turbo.addVehicle}`);
            }
            setOpenConfirmationModal(false);
        });
    };

    const handleSaveServiceDates = async (values: {
        lastServiceDate: string;
        nextServiceDue: string;
    }) => {
        const res = await updateServiceDatesApi({
            id,
            lastServiceDate: values.lastServiceDate,
            nextServiceDue: values.nextServiceDue,
        });
        if (res) {
            dispatch(
                showToast({
                    description: 'Service dates updated successfully',
                    variant: 'success',
                })
            );
            setOpenServiceDatesModal(false);
            if (setRefresh) setRefresh(true);
        } else {
            dispatch(
                showToast({
                    description: 'Failed to update service dates',
                    variant: 'error',
                })
            );
        }
    };

    const handleSubmitQuote = async (values: any) => {
        const res = await submitQuoteApi({
            fullName: values.fullName,
            mobileNumber: values.mobileNumber,
            email: values.email,
            insuranceType: values.insuranceType,
            vehicleNumber: verifyRcResponse?.vehicleNumber,
            vehicleId: id,
        });
        if (res) {
            setQuoteMessage(res.message || '');
            setOpenQuoteModal(false);
            setOpenQuoteSuccessModal(true);
        } else {
            dispatch(
                showToast({
                    description: 'Failed to submit quote request',
                    variant: 'error',
                })
            );
        }
    };

    const handleSubmit = async () => {
        const res = await addDocApi(inputParams);
        if (res) {
            dispatch(
                showToast({
                    description: 'Vehicle added successfully',
                    variant: 'success',
                })
            );
            dispatch(resetInputParams());
            dispatch(resetRcResponse());
            navigate(`${paths.dashboard.turbo}/${paths.turbo.manageFleet}`);
        }
    };

    return {
        loading,
        serviceDatesLoading,
        quoteLoading,
        openConfirmationModal,
        setOpenConfirmationModal,
        openServiceDatesModal,
        setOpenServiceDatesModal,
        openQuoteModal,
        setOpenQuoteModal,
        openQuoteSuccessModal,
        setOpenQuoteSuccessModal,
        quoteMessage,
        handleDelete,
        handleSaveServiceDates,
        handleSubmitQuote,
        handleSubmit,
    };
};

export default useVehicleActions;
