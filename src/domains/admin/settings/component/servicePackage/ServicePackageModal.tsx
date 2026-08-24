import { Flex, Form } from 'antd';
import { ErrorMessage } from 'formik';

import CustomFileUploadInput from '@components/atomic/inputs/CustomFileUploadInput';
import InputTextArea from '@components/atomic/inputs/InputTextArea';
import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';
import usePartnersForCorporate from '@src/domains/admin/users/hooks/usePartnersForCorporate';
import { packageAccessKeys } from '@utils/packageAccessKeys';
import { formatNumberWithoutCommas } from '@utils/priceFormat';

import useServicePackageUpdate from '../../hooks/useServicePackageUpdate';
import { servicePackageSchema } from '../../schema/servicePackage';
import { Packages } from '../../types/servicePackage';

type DepartmentModalProps = {
    open: boolean;
    handleCancel: () => void;
    data?: Packages;
    handleRefresh: () => void;
};

const CreateUpdateModal = ({ open, handleCancel, data, handleRefresh }: DepartmentModalProps) => {
    const { isLoading, handlePackageCreation, updatePackageDetails } = useServicePackageUpdate();
    const { categoryDatas } = usePartnersForCorporate('');
    return (
        <CustomModalWithForm
            modalTitle="Package Management"
            open={open}
            isLoading={isLoading}
            handleCancel={handleCancel}
            handleFormSubmit={async values => {
                let result;
                if (values.id) {
                    result = await updatePackageDetails(values);
                } else {
                    result = await handlePackageCreation(values);
                }
                if (result) {
                    handleCancel();
                    handleRefresh();
                }
            }}
            initialValues={{
                id: data?.id || '',
                packageName: data?.packageName || '',
                packagePrices: {
                    monthly: formatNumberWithoutCommas(data?.packagePrices?.monthly) || '',
                    annually: formatNumberWithoutCommas(data?.packagePrices?.annually) || '',
                },
                vendorPackagePrices: {
                    monthly: formatNumberWithoutCommas(data?.vendorPackagePrices?.monthly) || '',
                    annually: formatNumberWithoutCommas(data?.vendorPackagePrices?.annually) || '',
                },
                discount: {
                    monthly: formatNumberWithoutCommas(data?.discount?.monthly) || 0,
                    annually: formatNumberWithoutCommas(data?.discount?.annually) || 0,
                },
                description: data?.description || '',
                serviceList: data?.serviceList || '',
                packageType: data?.packageType || '',
                accessCode: data?.accessCode || '',
                partnerId: data?.partnerId || '',
                externalId: data?.externalId || '',
                packageLogo: data?.packageLogo || null,
                priorityLevel: data?.priorityLevel?.toString() || '',
            }}
            validationSchema={servicePackageSchema}
        >
            {({ values, setFieldValue }) => (
                <Flex vertical className="w-full ">
                    <Form layout="vertical">
                        <SelectInput
                            label="Select Partner"
                            name="partnerId"
                            placeholder="Select partner"
                            options={
                                categoryDatas
                                    ? categoryDatas.map(item => ({
                                          value: item.id.toString(),
                                          label: item.name,
                                      }))
                                    : []
                            }
                            tooltipText="Please select this option if you are adding a package for a partner. If not, you can leave this field empty."
                            showToolTip
                        />
                        <TextInput
                            name="packageName"
                            label="Package Name"
                            type="text"
                            placeholder="Enter package name"
                            isRequired
                            classes=" rounded-sm"
                            maxLength={30}
                        />
                        <TextInput
                            name="packagePrices.monthly"
                            label="Package Price (monthly)"
                            type="text"
                            placeholder="Enter monthly price"
                            isRequired
                            classes="rounded-sm"
                            maxLength={15}
                            allowDecimalsOnly
                        />
                        <ErrorMessage
                            name="packagePrices.monthly"
                            render={msg => (
                                <div className="-mt-6 text-red-500 error-message">{msg}</div>
                            )}
                        />
                        <TextInput
                            name="vendorPackagePrices.monthly"
                            label="Vendor Package Price (monthly)"
                            type="text"
                            placeholder="Enter vendor monthly price"
                            isRequired
                            classes="rounded-sm"
                            maxLength={15}
                            allowDecimalsOnly
                        />
                        <ErrorMessage
                            name="vendorPackagePrices.monthly"
                            render={msg => (
                                <div className="-mt-6 text-red-500 error-message">{msg}</div>
                            )}
                        />
                        <TextInput
                            name="packagePrices.annually"
                            label="Package Price (annually)"
                            type="text"
                            placeholder="Enter annual price"
                            isRequired
                            classes="rounded-sm"
                            maxLength={15}
                            allowDecimalsOnly
                        />
                        <ErrorMessage
                            name="packagePrices.annually"
                            render={msg => (
                                <div className="-mt-6 text-red-500 error-message">{msg}</div>
                            )}
                        />
                        <TextInput
                            name="vendorPackagePrices.annually"
                            label="Vendor Package Price (annually)"
                            type="text"
                            placeholder="Enter vendor annual price"
                            isRequired
                            classes="rounded-sm"
                            maxLength={15}
                            allowDecimalsOnly
                        />
                        <ErrorMessage
                            name="vendorPackagePrices.annually"
                            render={msg => (
                                <div className="-mt-6 text-red-500 error-message">{msg}</div>
                            )}
                        />
                        <TextInput
                            name="discount.monthly"
                            label="Discount (monthly)"
                            type="text"
                            placeholder="Enter monthly discount "
                            classes="rounded-sm"
                            maxLength={15}
                            allowDecimalsOnly
                            tooltipText="Discount amount is always flat amount."
                            showToolTip
                        />
                        <ErrorMessage
                            name="discount.monthly"
                            render={msg => (
                                <div className="-mt-6 text-red-500 error-message">{msg}</div>
                            )}
                        />
                        <TextInput
                            name="discount.annually"
                            label="Discount(annually)"
                            type="text"
                            placeholder="Enter annual discount"
                            classes="rounded-sm"
                            maxLength={15}
                            allowDecimalsOnly
                            tooltipText="Discount amount is always flat amount."
                            showToolTip
                        />
                        <ErrorMessage
                            name="discount.annually"
                            render={msg => (
                                <div className="-mt-6 text-red-500 error-message">{msg}</div>
                            )}
                        />
                        <SelectInput
                            label="Package Type"
                            isRequired
                            name="packageType"
                            placeholder="Select package type"
                            options={[
                                {
                                    value: 'INDIVIDUAL',
                                    label: 'Individual',
                                },
                                {
                                    value: 'GROUP',
                                    label: 'Group',
                                },
                            ]}
                            handleChange={e => setFieldValue('accessCode', '')}
                        />
                        {values.packageType === 'INDIVIDUAL' && (
                            <SelectInput
                                label="Access Code"
                                isRequired
                                name="accessCode"
                                placeholder="Select package type"
                                options={Object.entries(packageAccessKeys).map(
                                    ([label, value]) => ({
                                        label,
                                        value,
                                    })
                                )}
                            />
                        )}

                        <TextInput
                            name="priorityLevel"
                            label="Priority Level"
                            type="text"
                            placeholder="Enter priority level"
                            classes="rounded-sm"
                            maxLength={2}
                            allowNumbersOnly
                            showToolTip
                            isRequired
                            tooltipText="Lower values indicate lower priorities"
                        />

                        {values.packageType === 'GROUP' && (
                            <InputTextArea
                                name="serviceList"
                                label="Service List"
                                placeholder="Enter services"
                                autoSize={{ minRows: 4 }}
                                isRequired
                            />
                        )}
                        <TextInput
                            name="externalId"
                            label="External ID"
                            type="text"
                            placeholder="Enter external ID"
                            classes="rounded-sm"
                            maxLength={30}
                        />
                        <InputTextArea
                            name="description"
                            label="Description"
                            placeholder="Enter description"
                            autoSize={{ minRows: 4 }}
                        />
                        <CustomFileUploadInput
                            name="packageLogo"
                            label="Package Logo"
                            classes="rounded-sm"
                            format="imageFormat"
                            showFileName
                            showNotification
                            existingFileUrl={data?.packageLogo}
                        />
                    </Form>
                </Flex>
            )}
        </CustomModalWithForm>
    );
};

export default CreateUpdateModal;
