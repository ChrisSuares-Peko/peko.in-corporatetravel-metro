import React from 'react';

import { Flex, Form } from 'antd';
import { useDispatch } from 'react-redux';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';
import { showToast } from '@src/slices/apiSlice';

import useCreateDomainHostingPlan from '../../hooks/domainHostingPlans/useCreateDomainHostingPlan';
import domainHostingPlansSchema from '../../schema/domainHostingPlansSchema';
import { PLAN_TYPE_OPTIONS } from '../../types/domainHostingPlan';
import AddFeatureDetails from '../emailDomainPlans/AddFeatureDetails';


interface ModalProps {
    open: boolean;
    handleCancel: () => void;
    data?: any;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    mode: string;
}

const DomainHostingPlansModal = ({ handleCancel, open, data, setRefresh, mode }: ModalProps) => {
    const { isLoading, createPlan, updatePlan } = useCreateDomainHostingPlan();
    const dispatch = useDispatch();
    const modalHeader = mode === 'edit' ? 'Edit Domain & Hosting Plan' : 'Add Domain & Hosting Plan';

    const parseFeatures = (raw: any) => {
        if (!raw) return [{ label: '', value: '' }];
        if (Array.isArray(raw)) return raw.length > 0 ? raw : [{ label: '', value: '' }];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ label: '', value: '' }];
        } catch {
            return [{ label: '', value: '' }];
        }
    };

    return (
        <CustomModalWithForm
            isLoading={isLoading}
            modalTitle={modalHeader}
            open={open}
            validationSchema={domainHostingPlansSchema}
            handleCancel={handleCancel}
            handleFormSubmit={async values => {
                const payload: any = {
                    planType: values.planType,
                    planName: values.planName,
                    productId: values.productId,
                    planId: values.planId || null,

                    description: values.description || null,
                    features: (() => {
                        const filled = (values.features ?? [])
                            .filter((f: any) => f.label?.trim() || f.value?.trim())
                            .map((f: any) => ({ label: f.label, value: f.value }));
                        return filled.length > 0 ? filled : null;
                    })(),
                };
                if (values.id) payload.id = values.id;

                const res: any = values.id ? await updatePlan(payload) : await createPlan(payload);

                if (res && res.status === true) {
                    dispatch(showToast({ description: res.message, variant: 'success' }));
                    setRefresh(true);
                    handleCancel();
                } else if (res && res.status === false) {
                    dispatch(showToast({ description: res.message, variant: 'error' }));
                }
            }}
            initialValues={{
                id: data?.id || '',
                planType: data?.planType || '',
                planName: data?.planName || '',
                productId: data?.productId || '',
                planId: data?.planId || '',

                description: data?.description || '',
                features: parseFeatures(data?.features),
            }}
        >
            {({ values }) => (
                <Flex vertical className="w-full">
                    <Form layout="vertical">
                        <SelectInput
                            isRequired
                            name="planType"
                            options={PLAN_TYPE_OPTIONS}
                            placeholder="Select plan type"
                            label="Plan Type"
                        />
                        <TextInput
                            name="planName"
                            label="Plan Name"
                            type="text"
                            placeholder="Enter plan name"
                            isRequired
                            classes="rounded-sm"
                        />
                        <TextInput
                            name="productId"
                            label="Product ID (Vendor Classkey)"
                            type="text"
                            placeholder="e.g. titanmailindia, resellerwindowshostingin"
                            isRequired
                            classes="rounded-sm"
                        />
                        <TextInput
                            name="planId"
                            label="Plan ID (Vendor Plan Number)"
                            type="text"
                            isRequired
                            placeholder="e.g. 1761"
                            classes="rounded-sm"
                        />
                        <TextInput
                            name="description"
                            label="Description"
                            type="text"
                            placeholder="Enter description"
                            classes="rounded-sm"
                        />
                        <AddFeatureDetails values={values.features} isRequired={false} />
                    </Form>
                </Flex>
            )}
        </CustomModalWithForm>
    );
};

export default DomainHostingPlansModal;