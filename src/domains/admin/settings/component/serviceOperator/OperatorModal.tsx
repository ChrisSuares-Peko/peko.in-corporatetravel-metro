import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';
import { formatNumberWithoutCommas } from '@utils/priceFormat';

import OperatorForm from '../../forms/OperatorForm';
import { useOperatorDropdowns } from '../../hooks/useOperatorDropdowns';
import useServiceOperatorUpdate from '../../hooks/useServiceOperatorUpdate';
import { serviceOperatorSchema } from '../../schema/serviceOperator';
import { OperatorWithoutID, serviceOperator } from '../../types/serviceOperator';
import { balanceMethods, commissionTypes, serviceTypes } from '../../utils/serviceOperator';

/** Omit payment credentials from the API body when empty so we don't send "" */
function omitEmptyPaymentCredentials(values: Record<string, unknown>): Record<string, unknown> {
    const payload = { ...values };
    if (!String(payload.paymentclientid ?? '').trim()) {
        delete payload.paymentclientid;
    }
    if (!String(payload.paymentclientsecret ?? '').trim()) {
        delete payload.paymentclientsecret;
    }
    return payload;
}

type DepartmentModalProps = {
    open: boolean;
    handleCancel: () => void;
    data?: serviceOperator;
    handleRefresh: () => void;
};

const OperatorModal = ({ open, handleCancel, data, handleRefresh }: DepartmentModalProps) => {
    const { isLoading, updateServiceOperator, handleServiceOperatorCreation } =
        useServiceOperatorUpdate();
    const { vendors, isLoading: dropdownsLoading, serviceCategories } = useOperatorDropdowns('');

    return (
        <CustomModalWithForm
            modalTitle="Service Operator Management"
            open={open}
            isLoading={isLoading}
            handleCancel={handleCancel}
            handleFormSubmit={async values => {
                const payload = omitEmptyPaymentCredentials(values as Record<string, unknown>);
                let result;
                if (values.id) {
                    result = await updateServiceOperator(payload as serviceOperator);
                } else {
                    result = await handleServiceOperatorCreation(payload as OperatorWithoutID);
                }
                if (result) {
                    handleCancel();
                    handleRefresh();
                }
            }}
            validationSchema={serviceOperatorSchema}
            initialValues={{
                id: data?.id || '',
                serviceProvider: data?.serviceProvider || '',
                accessKey: data?.accessKey || '',
                paymentclientid: data?.paymentclientid || '',
                paymentclientsecret: data?.paymentclientsecret || '',
                serviceCategory: data?.serviceCategory || '',
                // serviceRuleId: data?.serviceRuleId?.toString() || '',
                commissionType: data?.commissionType || '',
                providerCommission: formatNumberWithoutCommas(data?.providerCommission) || '0',
                vendorId: data?.vendorId || '',
                balanceMethod: data?.balanceMethod ?? '',
                serviceType: data?.serviceType || '',
                serviceImage: data?.serviceImage || '',
                margin: formatNumberWithoutCommas(data?.margin) || '0',
                marginType: data?.marginType || '',
                isDynamicUnitPricing: data?.isDynamicUnitPricing || false,
            }}
            reinitialise
        >
            <OperatorForm
                serviceTypes={serviceTypes}
                vendors={vendors}
                balanceMethods={balanceMethods}
                commissionTypes={commissionTypes}
                dropdownsLoading={dropdownsLoading}
                serviceCategories={serviceCategories}
            />
        </CustomModalWithForm>
    );
};

export default OperatorModal;
