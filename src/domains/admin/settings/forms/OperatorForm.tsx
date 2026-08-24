import React from 'react';

import { Form, Flex } from 'antd';

import CustomFileUploadInput from '@components/atomic/inputs/CustomFileUploadInput';
import CustomSelectSearch from '@components/atomic/inputs/CustomSelectSearch';
import SelectInput from '@components/atomic/inputs/SelectInput';
import SwitchInput from '@components/atomic/inputs/SwitchInput';
import TextInput from '@components/atomic/inputs/TextInput';
import { commonSelectType } from '@customtypes/general';

interface OperatorFormProps {
    serviceCategories: commonSelectType[];
    commissionTypes: commonSelectType[];
    balanceMethods: { label: string; value: boolean }[];
    serviceTypes: commonSelectType[];
    vendors: commonSelectType[];
    dropdownsLoading: boolean;
}

const OperatorForm: React.FC<OperatorFormProps> = ({
    serviceCategories,
    commissionTypes,
    balanceMethods,
    serviceTypes,
    vendors,
    dropdownsLoading,
}) => (
    <Flex vertical className="w-full">
        <Form layout="vertical">
            <TextInput
                name="serviceProvider"
                label="Service Provider Name"
                type="text"
                placeholder="Enter service provider name"
                isRequired
                classes=" rounded-sm"
                maxLength={50}
            />
            <TextInput
                name="accessKey"
                label="Access Key"
                type="text"
                placeholder="Enter access key"
                isRequired
                classes="rounded-sm"
                maxLength={35}
            />
            <CustomSelectSearch
                name="serviceCategory"
                label="Service Category"
                options={serviceCategories}
                placeholder="Select service category"
                classes="rounded-sm"
                isRequired
            />
            <CustomSelectSearch
                name="commissionType"
                label="Commission Type"
                placeholder="Select commission type"
                classes="rounded-sm"
                options={commissionTypes}
                isRequired
            />
            <TextInput
                name="providerCommission"
                label="Provider Commission"
                placeholder="Enter provider commission"
                type="text"
                classes="rounded-sm"
            />
            <CustomSelectSearch
                isRequired
                loading={dropdownsLoading}
                name="vendorId"
                label="Vendor"
                placeholder="Select a vendor"
                options={vendors}
            />

            <SelectInput
                name="balanceMethod"
                label="Balance Method"
                placeholder="Select balance method"
                options={balanceMethods}
                classes="rounded-sm"
                isRequired
            />
            <CustomSelectSearch
                name="serviceType"
                label="Service Type"
                placeholder="Select service type"
                isRequired
                options={serviceTypes}
                classes="rounded-sm"
            />
            <CustomSelectSearch
                name="marginType"
                label="Margin Type"
                placeholder="Select margin type"
                classes="rounded-sm"
                options={commissionTypes}
                isRequired
            />
            <TextInput
                name="margin"
                label="Enter Margin"
                placeholder="Enter Margin"
                type="text"
                classes="rounded-sm"
                allowDecimalsOnly
            />
            <TextInput
                name="paymentclientid"
                label="Payment Client ID"
                type="text"
                placeholder="Enter payment client id"
                classes="rounded-sm"
            />
            <TextInput
                name="paymentclientsecret"
                label="Payment Client Secret"
                type="text"
                placeholder="Enter payment client secret"
                classes="rounded-sm"
            />
            <SwitchInput
                name="isDynamicUnitPricing"
                label="Dynamic unit pricing"
                showToolTip
                tooltipText="The dynamic unit price is used to calculate the unit price of subscription add-ons. If this is turned off, the add-on price is fixed. otherwise, it is calculated based on the remaining days of the subscription."
            />

            <CustomFileUploadInput
                name="serviceImage"
                label="Service Image"
                classes="rounded-sm"
                format="imageFormat"
                showFileName
                showNotification
            />
        </Form>
    </Flex>
);

export default OperatorForm;
