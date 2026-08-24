import { Flex, Form } from 'antd';

import TextInput from '@components/atomic/inputs/TextInput';
import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';

import useUpdateBusinessRegistrationCatalog from '../../hooks/useUpdateBusinessRegistrationCatalog';
import { catalogSchema } from '../../schema/businessRegistrationCatalog';
import { CatalogRow } from '../../types/businessRegistrationCatalog';

type CatalogModalProps = {
    open: boolean;
    handleCancel: () => void;
    data?: CatalogRow;
    handleRefresh: () => void;
};

// Admin edits amount + display order here; active/inactive is toggled directly
// from the Status column tick in the table. Vendor fields stay read-only.
const CatalogModal = ({ open, handleCancel, data, handleRefresh }: CatalogModalProps) => {
    const { isLoading, updateCatalogDetails } = useUpdateBusinessRegistrationCatalog();

    return (
        <CustomModalWithForm
            modalTitle={`Edit — ${data?.serviceName ?? 'Catalog Item'}`}
            open={open}
            isLoading={isLoading}
            handleCancel={handleCancel}
            handleFormSubmit={async values => {
                const result = await updateCatalogDetails({
                    id: data!.id,
                    amount: values.amount === '' ? null : values.amount,
                    sortOrder: values.sortOrder,
                });
                if (result) {
                    handleCancel();
                    handleRefresh();
                }
            }}
            validationSchema={catalogSchema}
            initialValues={{
                amount: data?.amount ?? '',
                sortOrder: data?.sortOrder ?? 0,
            }}
        >
            <Flex vertical className="w-full">
                <Form layout="vertical">
                    <TextInput
                        name="amount"
                        label="Custom Amount (₹) — leave blank to show the market price"
                        type="text"
                        placeholder="Enter custom amount"
                        classes="rounded-sm"
                        maxLength={15}
                        allowDecimalsOnly
                    />
                    <TextInput
                        name="sortOrder"
                        label="Display Order"
                        type="text"
                        placeholder="Enter order (lower shows first)"
                        isRequired
                        classes="rounded-sm"
                        maxLength={4}
                        allowNumbersOnly
                    />
                </Form>
            </Flex>
        </CustomModalWithForm>
    );
};

export default CatalogModal;
