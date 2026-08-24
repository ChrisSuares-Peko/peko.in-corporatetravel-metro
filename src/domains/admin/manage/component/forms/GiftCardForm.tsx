import React, { RefObject } from 'react';

import { Form, Flex } from 'antd';
import dayjs from 'dayjs';
import { FormikProps } from 'formik';

import CustomFileUploadInput from '@components/atomic/inputs/CustomFileUploadInput';
import CustomSelectSearch from '@components/atomic/inputs/CustomSelectSearch';
import DatePickerInput from '@components/atomic/inputs/DatePickerInput';
// import InputTextArea from '@components/atomic/inputs/InputTextArea';
// import SwitchInput from '@components/atomic/inputs/SwitchInput';
import MultiTextInput from '@components/atomic/inputs/MultiTextInput';
import TextInput from '@components/atomic/inputs/TextInput';
// import { commonSelectType } from '@customtypes/general';

import { GiftCardsFormValues } from '../../types/giftCards';
import { GVTypes, denominationTypes } from '../../utils/giftCards';

interface GiftCardFormProps {
    selectedGVType: any;
    selectedDenominationType: any;
    handleGVTypeChange: (GVType: any) => void;
    handleDenominationTypeChange: (isOpenOrFixed: any) => void;
    GiftCardsFormRef: RefObject<FormikProps<GiftCardsFormValues>>;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}

const currentTime = dayjs();
const minDate = currentTime.add(1, 'day');
const GiftCardForm: React.FC<GiftCardFormProps> = ({
    selectedGVType,
    selectedDenominationType,
    handleGVTypeChange,
    handleDenominationTypeChange,
    GiftCardsFormRef,
    setFieldValue,
}) => (
    <Flex vertical className="w-full ">
        <Form layout="vertical">
            <TextInput
                name="product_name"
                label="Gift Card Name"
                type="text"
                placeholder="Enter Gift Card Name"
                isRequired
                classes=" rounded-sm"
                maxLength={30}
            />
            <TextInput
                name="product_id"
                label="Product Id"
                type="text"
                placeholder="Enter Product Id"
                isRequired
                classes=" rounded-sm"
                maxLength={50}
            />
            <TextInput
                name="merchant_name"
                label="Merchant Name"
                type="text"
                placeholder="Enter Merchant Name"
                // isRequired
                classes=" rounded-sm"
                maxLength={30}
            />
            <TextInput
                name="merchant_id"
                label="Merchant Id"
                type="text"
                placeholder="Enter Merchant Id"
                // isRequired
                classes=" rounded-sm"
                maxLength={50}
            />
            <TextInput
                name="brand_name"
                label="Brand Name"
                type="text"
                placeholder="Enter Brand Name"
                isRequired
                classes=" rounded-sm"
                maxLength={30}
            />
            <CustomFileUploadInput
                label="Brand Logo"
                name="imageBase"
                format="imageFormat"
                isRequired
                showFileName
                showNotification
                fileOutputObject
            />

            <CustomSelectSearch
                name="is_open_denominnation"
                label="Denomination type"
                placeholder="Select Denomination Type"
                isRequired
                classes="rounded-sm"
                options={denominationTypes}
                onChange={(value, name) => {
                    setFieldValue('is_open_denominnation', value);
                }}
            />
            <CustomSelectSearch
                name="gv_type"
                label="GV type"
                placeholder="Select GV Type"
                isRequired
                classes="rounded-sm"
                options={GVTypes}
                onChange={handleGVTypeChange}
            />

            {GiftCardsFormRef.current?.values.is_open_denominnation === 'OPEN' ? (
                <>
                    <TextInput
                        name="min_price"
                        label="Min Denomination"
                        placeholder="Enter Min Denomination"
                        type="text"
                        isRequired
                        classes="rounded-sm"
                        maxLength={20}
                        allowDecimalsOnly
                    />
                    <TextInput
                        name="max_price"
                        label="Max Denomination"
                        type="text"
                        isRequired
                        placeholder="Enter Max Denomination"
                        classes="rounded-sm"
                        maxLength={20}
                        allowDecimalsOnly
                    />
                </>
            ) : (
                <MultiTextInput
                    name="denominations"
                    label="Denominations"
                    type="text"
                    isRequired
                    placeholder="Enter Denominations"
                    classes="rounded-sm"
                    maxLength={20}
                    allowDecimalsOnly
                />
                // <>
                //     <TextInput
                //         name="mrp"
                //         label="MRP"
                //         placeholder="Enter MRP"
                //         type="text"
                //         isRequired
                //         classes="rounded-sm"
                //         maxLength={20}
                //         allowDecimalsOnly
                //     />
                //     <TextInput
                //         name="selling_price"
                //         label="Selling Price"
                //         type="text"
                //         isRequired
                //         placeholder="Enter Selling Price"
                //         classes="rounded-sm"
                //         maxLength={20}
                //         allowDecimalsOnly
                //     />
                // </>
            )}
            <DatePickerInput
                name="expiry"
                label="Expiry Date"
                placeholder="Pick Expiry Date"
                isRequired
                minDate={minDate}
            />

            {/* <InputTextArea
                name="terms_and_condition"
                label="Terms And Condtions"
                placeholder="Enter Terms And Condtions"
                isRequired
                maxLength={300}
            />
            <InputTextArea
                name="how_to_redeem"
                label="Redemption instructions"
                placeholder="Enter Redemption instructions"
                isRequired
                maxLength={300}
            /> */}
        </Form>
    </Flex>
);

export default GiftCardForm;
