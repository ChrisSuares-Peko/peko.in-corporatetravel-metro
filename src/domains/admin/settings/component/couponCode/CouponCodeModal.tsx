import React from 'react';

import { Flex, Form } from 'antd';
import dayjs from 'dayjs';

import DatePickerInput from '@components/atomic/inputs/DatePickerInput';
import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';
import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import UseCreateCouponCodes from '../../hooks/useCreateCouponCode';
import couponCodeSchema from '../../schema/couponCodeSchema';
import { refresh } from '../../types/accessCode';
import { Coupon } from '../../types/couponCode';

type ModalProps = {
    open: boolean;
    handleCancel: () => void;
    data?: Coupon;
};
const CouponCodeModal = ({ open, handleCancel, setRefresh, data }: ModalProps & refresh) => {
    const { isLoading, createNewCouponCode, updateCurrenCouponCode } = UseCreateCouponCodes();
    const dispatch = useAppDispatch();
    const tomorrow = dayjs().add(0, 'day').startOf('day');

    return (
        <CustomModalWithForm
            isLoading={isLoading}
            modalTitle="Coupon Code Management"
            open={open}
            validationSchema={couponCodeSchema}
            handleCancel={handleCancel}
            handleFormSubmit={async value => {
                let res: boolean;
                if (data) {
                    res = await updateCurrenCouponCode({
                        ...value,
                        couponCode: value.couponCode.toUpperCase(),
                        id: data.id,
                        status: data.status,
                    });
                } else {
                    res = await createNewCouponCode({
                        ...value,
                        couponCode: value.couponCode.toUpperCase(),
                    });
                }

                if (res === true) {
                    setRefresh(true);
                    dispatch(
                        showToast({
                            description: data
                                ? `Coupon code updated successfully`
                                : `Coupon code added successfully`,
                            variant: 'success',
                        })
                    );
                    handleCancel();
                    // } else {
                    //     dispatch(
                    //         showToast({
                    //             description: `Something went wrong, please try again later`,
                    //             variant: 'error',
                    //         })
                    //     );
                }
            }}
            initialValues={{
                couponCode: data?.couponCode || '',
                discountType: data?.discountType || '',
                discount: data?.discount || '',
                validFrom: data?.validFrom || '',
                validTo: data?.validTo || '',
            }}
        >
            {({ values, setFieldValue }) => (
                <Flex vertical className="w-full">
                    <Form layout="vertical">
                        <TextInput
                            name="couponCode"
                            label="Coupon Code"
                            type="text"
                            placeholder="Enter coupon code"
                            isRequired
                            classes="rounded-sm"
                            maxLength={30}
                            allowAlphabetsAndNumbersOnly
                        />
                        <SelectInput
                            name="discountType"
                            isRequired
                            options={[
                                { value: 'PERCENTAGE', label: 'Percentage' },
                                { value: 'FLAT', label: 'Flat' },
                            ]}
                            placeholder="Please select a discount type"
                            label="Discount Type"
                        />
                        <TextInput
                            allowDecimalsOnly
                            name="discount"
                            label="Discount"
                            type="text"
                            maxLength={12}
                            placeholder="Please enter discount"
                            isRequired
                            classes="rounded-sm"
                        />
                        <DatePickerInput
                            name="validFrom"
                            label="Valid From"
                            placeholder="Enter date"
                            classes="w-full"
                            isRequired
                            needConfirm={false}
                            minDate={tomorrow}
                            handleChange={date => {
                                if (date >= values.validTo) setFieldValue('validTo', '');
                                setFieldValue('validFrom', date);
                            }}
                        />
                        <DatePickerInput
                            name="validTo"
                            label="Valid To"
                            placeholder="Enter date"
                            classes="w-full"
                            isRequired
                            needConfirm={false}
                            minDate={
                                values.validFrom ? dayjs(values.validFrom).add(0, 'day') : tomorrow
                            }
                        />
                    </Form>
                </Flex>
            )}
        </CustomModalWithForm>
    );
};

export default CouponCodeModal;
