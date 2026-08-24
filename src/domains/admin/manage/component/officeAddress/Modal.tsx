import { Flex, Form } from 'antd';

import CustomFileUploadInput from '@components/atomic/inputs/CustomFileUploadInput';
import InputTextArea from '@components/atomic/inputs/InputTextArea';
import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';
import { formatNumberWithoutCommas } from '@utils/priceFormat';

import useUpdatePlan from '../../hooks/officeAdress_plans/useUpdatePlan';
import { plansSchema } from '../../schema/plans';
import { PlanBody } from '../../types/plans';
import { availabilityStatuses, billingCycles } from '../../utils/plans';

type DepartmentModalProps = {
    open: boolean;
    handleCancel: () => void;
    data?: PlanBody;
    handleRefresh: () => void;
};

const CreateUpdateModal = ({ open, handleCancel, data, handleRefresh }: DepartmentModalProps) => {
    const { isLoading, handlePlanCreation, updatePlanDetails } = useUpdatePlan();
    const available = data?.is_available === 1;

    return (
        <CustomModalWithForm
            modalTitle="Plan Management"
            open={open}
            isLoading={isLoading}
            handleCancel={handleCancel}
            handleFormSubmit={async values => {
                let result;
                if (values.id) {
                    const planAvailable = values.is_available === true ? 1 : 0;
                    result = await updatePlanDetails({ ...values, is_available: planAvailable });
                } else {
                    result = await handlePlanCreation(values);
                }
                if (result) {
                    handleCancel();
                    handleRefresh();
                }
            }}
            reinitialise
            validationSchema={plansSchema}
            initialValues={{
                id: data?.id || '',
                name: data?.name || '',
                price: formatNumberWithoutCommas(data?.price) || '',
                description: data?.description || '',
                highlights: data?.highlights || '',
                billingCycle: data?.billingCycle || '',
                is_available: available || false,
                logo: data?.logo || '',
            }}
        >
            <Flex vertical className="w-full ">
                <Form layout="vertical">
                    <TextInput
                        name="name"
                        label="Plan Name"
                        type="text"
                        placeholder="Enter Plan Name"
                        isRequired
                        classes=" rounded-sm"
                        maxLength={30}
                    />
                    <TextInput
                        name="price"
                        label="Plan Price"
                        type="text"
                        placeholder="Enter Plan Price"
                        isRequired
                        classes="rounded-sm"
                        maxLength={15}
                        allowDecimalsOnly
                    />

                    <InputTextArea
                        isRequired
                        name="description"
                        label="Description"
                        placeholder="Enter Description"
                    />
                    <InputTextArea
                        isRequired
                        name="highlights"
                        label="Highlights"
                        placeholder="Enter Highlights"
                    />
                    <SelectInput
                        isRequired
                        placeholder="Select Billing Cycle"
                        name="billingCycle"
                        label="Billing Cycle"
                        options={billingCycles}
                    />
                    <SelectInput
                        isRequired
                        name="is_available"
                        label="Availability Status"
                        placeholder="Select Status"
                        options={availabilityStatuses}
                    />
                    <CustomFileUploadInput
                        existingFileUrl={data?.logo}
                        showFileName
                        showNotification
                        label="Choose logo"
                        name="logo"
                        format="logoFormat"
                    />
                </Form>
            </Flex>
        </CustomModalWithForm>
    );
};

export default CreateUpdateModal;
