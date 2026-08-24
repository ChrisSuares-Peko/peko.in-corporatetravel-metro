import { Flex, Form, Skeleton } from 'antd';

import MultiSelectInput from '@components/atomic/inputs/MultiSelectInput';
import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';
import useGetAllServiceOperators from '@src/domains/admin/settings/hooks/pekoCredits/useGetAllServiceOperators';
import { refresh } from '@src/domains/admin/settings/types/banners';
import usePartnersForCorporate from '@src/domains/admin/users/hooks/usePartnersForCorporate';

import useUpdateServiceBase from '../../hooks/paymentMethods/useUpdateServiceBase';
import paymentMethodsSchema from '../../schema/paymentMethodsSchema';
import { PaymentMethod } from '../../types/paymentMethods';

type PaymentMethodsProps = {
    open: boolean;
    handleCancel: () => void;
    data?: PaymentMethod;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

const PaymentMethodsModal = ({
    open,
    handleCancel,
    setRefresh,
    data,
}: PaymentMethodsProps & refresh) => {
    const { serviceData, serviceOperatorLoading } = useGetAllServiceOperators();
    const { partnerData, loading: partnerLoading } = usePartnersForCorporate('');
    const { createNewPgMethodsByService, updatePgMethodsByService, isLoading } =
        useUpdateServiceBase({
            handleCancel,
            setRefresh,
        });
    return (
        <CustomModalWithForm
            modalTitle="Payment Options Management"
            open={open}
            validationSchema={paymentMethodsSchema}
            handleCancel={handleCancel}
            isLoading={isLoading}
            handleFormSubmit={async values =>
                data
                    ? updatePgMethodsByService({
                          services: values.services,
                          rowIdToUpdate: data.id,
                          partnerId: values.partnerId,
                          paymentMethod: values.paymentMethod,
                          limits: {
                              limitPerTransaction: values.limitPerTransaction,
                              limitPerDay: values.limitPerDay,
                              limitPerMonth: values.limitPerMonth,
                          },
                      })
                    : createNewPgMethodsByService(values)
            }
            initialValues={{
                // eslint-disable-next-line no-nested-ternary
                partnerId: data ? (data?.partnerId === null ? 'default' : data?.partnerId) : '',
                paymentMethod: data?.paymentMethod || '',
                services: data?.serviceList.map(num => num.toString()) || [],
                limitPerTransaction: data?.limits?.limitPerTransaction || 0,
                limitPerDay: data?.limits?.limitPerDay || 0,
                limitPerMonth: data?.limits?.limitPerMonth || 0,
            }}
        >
            <Flex vertical className="w-full ">
                <Form layout="vertical">
                    {!partnerLoading ? (
                        <SelectInput
                            name="partnerId"
                            options={partnerData}
                            placeholder="Please select a partner"
                            label="Select Partner"
                        />
                    ) : (
                        <Skeleton.Input active block />
                    )}

                    <SelectInput
                        name="paymentMethod"
                        isRequired
                        options={[
                            { value: 'PAYMENT_GATEWAY', label: 'Payment Gateway' },
                            { value: 'WALLET', label: 'Wallet Payments' },
                        ]}
                        placeholder="Please select a payment method"
                        label="Payment Method"
                    />

                    {!serviceOperatorLoading ? (
                        <MultiSelectInput
                            name="services"
                            options={serviceData || []}
                            label="Select Service Operator"
                            placeholder="Please select a service operator"
                            isRequired
                            filterOption
                        />
                    ) : (
                        <Skeleton.Input block active />
                    )}
                    <TextInput
                        label="Limit (Per Transaction)"
                        type="text"
                        minLength={1}
                        maxLength={6}
                        name="limitPerTransaction"
                        placeholder="Enter Limit"
                    />
                    <TextInput
                        label="Limit (Per Day)"
                        type="text"
                        minLength={1}
                        maxLength={8}
                        name="limitPerDay"
                        placeholder="Enter Limit"
                    />
                    <TextInput
                        label="Limit (Per Month)"
                        type="text"
                        minLength={1}
                        maxLength={10}
                        name="limitPerMonth"
                        placeholder="Enter Limit"
                    />
                </Form>
            </Flex>
        </CustomModalWithForm>
    );
};

export default PaymentMethodsModal;
