import { useRef, useState } from 'react';

import { FormikProps } from 'formik';

import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';
// import { commonSelectType } from '@customtypes/general';

import useGiftCardsUpdate from '../../hooks/useGiftCardUpdate';
import { giftCardSchema } from '../../schema/giftCards';
import { GiftCardsBody, GiftCardsFormValues } from '../../types/giftCards';
import GiftCardForm from '../forms/GiftCardForm';

type DepartmentModalProps = {
    open: boolean;
    handleCancel: () => void;
    data?: GiftCardsBody;
    handleRefresh: () => void;
};

const CreateUpdateModal = ({ open, handleCancel, data, handleRefresh }: DepartmentModalProps) => {
    const [selectedDenominationType, setSelectedDenominationType] = useState(
        data?.is_open_denominnation ? 'OPEN' : 'FIXED'
    );
    const [selectedGVType, setSelectedGVType] = useState(data?.gv_type ? data.gv_type : null);

    const handleDenominationTypeChange = (isOpenOrFixed: any) => {
        setSelectedDenominationType(isOpenOrFixed);
    };
    const handleGVTypeChange = (GVType: any) => {
        setSelectedGVType(GVType);
    };
    const GiftCardsFormRef = useRef<FormikProps<GiftCardsFormValues>>(null);
    const { isLoading, handleGiftCardsCreation, updateGiftCardsDetails } = useGiftCardsUpdate();
    return (
        <CustomModalWithForm
            modalTitle="Gift Card Management"
            open={open}
            isLoading={isLoading}
            handleCancel={handleCancel}
            handleFormSubmit={async values => {
           
                let result;
                if (values.is_open_denominnation === 'OPEN') {
                    values.is_open_denominnation = true;
                } else {
                    values.is_open_denominnation = false;
                }
                if (values.imageBase && values.imageFormat) {
                    values.brand_logo = {
                        imageFormat: values.imageFormat,
                        imageBase: values.imageBase,
                    };
                    delete values.imageBase;
                    delete values.imageFormat;
                }
                if (values.id) {
                    result = await updateGiftCardsDetails(values);
                } else {
                    result = await handleGiftCardsCreation(values);
                }
                if (result) {
                    handleCancel();
                    handleRefresh();
                }
            }}
            initialValues={{
                id: data?.id || '',
                product_name: data?.product_name || '',
                product_id: data?.product_id || '',
                merchant_name: data?.merchant_name || '',
                merchant_id: data?.merchant_id || '',
                brand_name: data?.brand_name || '',
                brand_logo: data?.brand_logo || '',
                is_open_denominnation: data?.is_open_denominnation ? 'OPEN' : 'FIXED',
                gv_type: data?.gv_type || '',
                // mrp: data?.mrp || '',
                // selling_price: data?.selling_price || '',
                max_price: data?.max_price || '',
                min_price: data?.min_price || '',
                expiry: data?.expiry || '',
                denominations: data?.denominations,
            }}
            validationSchema={giftCardSchema}
            formRefName={GiftCardsFormRef}
            reinitialise
        >
            {({ setFieldValue }) => (
                <GiftCardForm
                    selectedDenominationType={selectedDenominationType}
                    selectedGVType={selectedGVType}
                    handleDenominationTypeChange={handleDenominationTypeChange}
                    handleGVTypeChange={handleGVTypeChange}
                    GiftCardsFormRef={GiftCardsFormRef}
                    setFieldValue={setFieldValue}
                />
            )}
        </CustomModalWithForm>
    );
};

export default CreateUpdateModal;
