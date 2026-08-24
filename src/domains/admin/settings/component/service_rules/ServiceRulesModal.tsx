import React from 'react';

import { Flex, Form } from 'antd';

import InputTextArea from '@components/atomic/inputs/InputTextArea';
import TextInput from '@components/atomic/inputs/TextInput';
import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';

import useUpdateServiceRule from '../../hooks/useUpdateServiceRule';
import seriveRuleSchema from '../../schema/ServiceRules';
import { refresh } from '../../types/partnerPermission';

type ServiceRulesModalProps = {
    open: boolean;
    handleCancel: () => void;
    data?: any;
};
const ServiceRulesModal = ({
    open,
    handleCancel,
    data,
    setRefresh,
}: ServiceRulesModalProps & refresh) => {
    const { createDoc, isLoading, updateDoc } = useUpdateServiceRule();

    return (
        <CustomModalWithForm
            isLoading={isLoading} // Use combined loading from hooks
            modalTitle="Service Rules Management"
            open={open}
            validationSchema={seriveRuleSchema}
            handleCancel={handleCancel}
            handleFormSubmit={async (values: any) => {
                let res;
                if (data) res = await updateDoc(values);
                else res = await createDoc(values);
                if (res) {
                    setRefresh(true);
                    handleCancel();
                }
            }}
            initialValues={{
                id: data?.id || '',
                rule: data?.rule || '',
                description: data?.description || '',
            }}
        >
            <Flex vertical className="w-full">
                <Form layout="vertical">
                    <TextInput
                        name="rule"
                        label="Rule"
                        type="text"
                        placeholder="Enter rule"
                        isRequired
                        maxLength={50}
                        classes="rounded-sm"
                    />
                    <InputTextArea
                        name="description"
                        label="Description"
                        placeholder="Enter description"
                        isRequired
                        maxLength={2000}
                        autoSize={{ minRows: 3 }}
                    />
                </Form>
            </Flex>
        </CustomModalWithForm>
    );
};

export default ServiceRulesModal;
