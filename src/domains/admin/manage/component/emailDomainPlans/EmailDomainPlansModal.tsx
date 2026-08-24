import React, { useState } from 'react';

import { Flex, Form } from 'antd';
import { useDispatch } from 'react-redux';

import CustomFileUploadInput from '@components/atomic/inputs/CustomFileUploadInput';
import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';
import { showToast } from '@src/slices/apiSlice';

import AddDescriptionDetails from './AddDescriptionDetails';
import AddFeatureDetails from './AddFeatureDetails';
import useCreateEmailDomainPlan from '../../hooks/emailDomainPlans/useCreateEmailDomainPlan';
import emailDomainPlansSchema from '../../schema/emailDomainPlansSchema';
import { descriptionDetails, featureDetails } from '../../types/emailDomainPlan';

interface modalProps {
    open: boolean;
    handleCancel: () => void;
    data?: any;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    mode: string;
}
const EmailDomainPlansModal = ({ handleCancel, open, data, setRefresh, mode }: modalProps) => {
    const { isLoading, createNewEmailDomainPlan, updateCurrentEmailDomainPlan, allProducts } =
        useCreateEmailDomainPlan();
    const [, setFile] = useState<any>('');
    const modalHeader = mode === 'edit' ? 'Edit Email/Domain Plan' : 'Add Email/Domain Plan';
    const dispatch = useDispatch();
    return (
        <CustomModalWithForm
            isLoading={isLoading}
            modalTitle={modalHeader}
            open={open}
            validationSchema={emailDomainPlansSchema}
            handleCancel={handleCancel}
            handleFormSubmit={async values => {
                let res: any;
                const formattedValues = {
                    ...values,
                    features: values.features.map((feature: featureDetails) => ({
                        label: feature.label,
                        value: feature.value,
                    })),
                    descriptions: values.descriptions.map((description: descriptionDetails) => ({
                        label: description.label,
                        value: description.value,
                    })),
                };

                if (formattedValues.id) {
                    res = await updateCurrentEmailDomainPlan(formattedValues);
                } else {
                    res = await createNewEmailDomainPlan(formattedValues);
                }
                if (res.status === true) {
                    dispatch(
                        showToast({
                            description: `${res.message} `,
                            variant: 'success',
                        })
                    );
                    setRefresh(true);
                    handleCancel();
                }
                if (res.status === false) {
                    dispatch(
                        showToast({
                            description: `${res.message}`,
                            variant: 'error',
                        })
                    );
                }
            }}
            initialValues={{
                id: data?.id || '',
                name: data?.name || '',
                softwaresSubscriptionId: data?.softwaresSubscriptionId || '',
                monthlyPrice: data?.monthlyPrice || '',
                yearlyPrice: data?.yearlyPrice || '',
                features:
                    data?.features && data?.features.length > 0
                        ? data?.features
                        : [
                              {
                                  id: '',
                                  label: '',
                                  value: '',
                              },
                          ],
                descriptions:
                    data?.descriptions && data?.descriptions.length > 0
                        ? data?.descriptions
                        : [
                              {
                                  id: '',
                                  label: '',
                                  value: '',
                              },
                          ],
                image: data?.image_url || '',
            }}
        >
            {({ handleSubmit, values }) => (
                <Flex vertical className="w-full ">
                    <Form layout="vertical">
                        <TextInput
                            name="name"
                            label="Plan Name"
                            type="text"
                            placeholder="Enter Plan Name"
                            isRequired
                            classes=" rounded-sm"
                        />
                        <SelectInput
                            isRequired
                            name="softwaresSubscriptionId"
                            options={allProducts}
                            placeholder="Please select a product"
                            label="Product"
                        />
                        <TextInput
                            name="monthlyPrice"
                            label="Monthly Price"
                            type="text"
                            placeholder="Enter Monthly Price"
                            isRequired
                            classes=" rounded-sm"
                            maxLength={15}
                            allowTwoDecimalsOnly
                        />
                        <TextInput
                            name="yearlyPrice"
                            label="Yearly Price"
                            type="text"
                            placeholder="Enter Yearly Price"
                            isRequired
                            classes=" rounded-sm"
                            maxLength={15}
                            allowTwoDecimalsOnly
                        />
                        <AddFeatureDetails values={values.features} />
                        <AddDescriptionDetails values={values.descriptions} />
                        <CustomFileUploadInput
                            isRequired
                            name="image"
                            label="Image"
                            classes="rounded-sm"
                            format="imageFormat"
                            existingFileUrl={data?.image_url}
                            showFileName
                            showNotification
                            setFile={setFile}
                        />
                    </Form>
                </Flex>
            )}
        </CustomModalWithForm>
    );
};

export default EmailDomainPlansModal;
