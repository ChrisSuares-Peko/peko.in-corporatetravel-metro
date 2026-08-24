import { Form } from 'antd';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextAreaInput from '@components/atomic/inputs/TextAreaInput';
import TextInput from '@components/atomic/inputs/TextInput';
import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';
import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import useGovtServicesAltering from '../../hooks/useGovtServicesAltering';
import govtServicesSchema from '../../schema/govtServicesSchema';
import { GovtService, refreshState } from '../../types/govtServicesTypes';

const TAG_OPTIONS = [
    { label: 'Mandatory', value: 'Mandatory' },
    { label: 'Regulatory Dependent', value: 'Regulatory Dependent' },
    { label: 'Good-to-have', value: 'Good-to-have' },
];

const AUTHORITY_OPTIONS = [
    { label: 'Central', value: 'Central' },
    { label: 'State', value: 'State' },
];

const TAG_CATEGORY_OPTIONS: Record<string, { label: string; value: string }[]> = {
    Mandatory: [
        { label: 'Tax & Compliance', value: 'Tax & Compliance' },
        { label: 'Licenses & Permits', value: 'Licenses & Permits' },
    ],
    'Regulatory Dependent': [
        { label: 'Tax & Compliance', value: 'Tax & Compliance' },
        { label: 'Licenses & Permits', value: 'Licenses & Permits' },
        { label: 'Certifications', value: 'Certifications' },
        { label: 'Trade Enablement', value: 'Trade Enablement' },
        { label: 'Pharma & Drugs', value: 'Pharma & Drugs' },
        { label: 'Pesticides', value: 'Pesticides' },
        { label: 'Fertilizers', value: 'Fertilizers' },
        { label: 'Hospital & Healthcare', value: 'Hospital & Healthcare' },
        { label: 'Hotels & Hospitality', value: 'Hotels & Hospitality' },
        { label: 'Data Security', value: 'Data Security' },
        { label: 'Financial Services', value: 'Financial Services' },
        { label: 'Telecom & IT', value: 'Telecom & IT' },
        { label: 'Education', value: 'Education' },
        { label: 'Transport & Logistics', value: 'Transport & Logistics' },
    ],
    'Good-to-have': [
        { label: 'Business Recognition', value: 'Business Recognition' },
        { label: 'Certifications', value: 'Certifications' },
        { label: 'Trade Enablement', value: 'Trade Enablement' },
        { label: 'Intellectual Property', value: 'Intellectual Property' },
    ],
};

type Props = {
    open: boolean;
    handleCancel: () => void;
    data?: GovtService;
};

const GovtServicesModal = ({ open, handleCancel, data, setRefresh }: Props & refreshState) => {
    const { isLoading, createService, updateService } = useGovtServicesAltering();
    const dispatch = useAppDispatch();

    return (
        <CustomModalWithForm
            isLoading={isLoading}
            modalTitle={data ? 'Edit Government Service' : 'Add Government Service'}
            open={open}
            validationSchema={govtServicesSchema}
            handleCancel={handleCancel}
            handleFormSubmit={async values => {
                const res: any = data
                    ? await updateService({ ...values, id: data.id })
                    : await createService(values);

                if (res?.status === true) {
                    dispatch(showToast({ description: res.message, variant: 'success' }));
                    setRefresh(true);
                    handleCancel();
                } else if (res?.status === false) {
                    dispatch(showToast({ description: res.message, variant: 'error' }));
                }
            }}
            initialValues={{
                id: data?.id ?? '',
                name: data?.name ?? '',
                description: data?.description ?? '',
                tag: data?.tag ?? '',
                category: data?.category ?? '',
                authority: (data as any)?.authority ?? '',
                accessKey: data?.accessKey ?? '',
                processingTime: data?.processingTime ?? '',
                price: data?.price ?? '',
                govtFee: data?.govtFee ?? '',
                sortOrder: data?.sortOrder ?? 0,
            }}
        >
            {(formikBag) => {
                const selectedTag = formikBag.values.tag as string;
                const categoryOptions = TAG_CATEGORY_OPTIONS[selectedTag] ?? [];
                const isRegulatory = selectedTag === 'Regulatory Dependent';

                return (
                    <Form layout="vertical">
                        <TextInput
                            name="name"
                            label="Service Name"
                            type="text"
                            placeholder="Enter service name"
                            isRequired
                        />
                        <TextAreaInput
                            name="description"
                            label="Description"
                            placeholder="Enter description"
                        />
                        <SelectInput
                            name="tag"
                            label="Tag"
                            placeholder="Select tag"
                            options={TAG_OPTIONS}
                            isRequired
                            handleChange={() => {
                                formikBag.setFieldValue('category', '');
                                formikBag.setFieldValue('authority', '');
                            }}
                        />
                        {categoryOptions.length > 0 && (
                            <SelectInput
                                name="category"
                                label="Category"
                                placeholder="Select category"
                                options={categoryOptions}
                                isRequired
                            />
                        )}
                        {isRegulatory && (
                            <SelectInput
                                name="authority"
                                label="Authority"
                                placeholder="Select authority"
                                options={AUTHORITY_OPTIONS}
                            />
                        )}
                        <TextInput
                            name="accessKey"
                            label="Access Key"
                            type="text"
                            placeholder="e.g. govt_gst_registration"
                            isRequired
                        />
                        <TextInput
                            name="processingTime"
                            label="Processing Time"
                            type="text"
                            placeholder="e.g. 3-7 days"
                            isRequired
                        />
                        <TextInput
                            name="price"
                            label="Peko Service Fee (₹)"
                            type="text"
                            placeholder="Enter price"
                            isRequired
                            allowNumbersOnly
                        />
                        <TextInput
                            name="govtFee"
                            label="Government Fee (₹)"
                            type="text"
                            placeholder="Enter government fee (0 if free)"
                            allowNumbersOnly
                        />
                        <TextInput
                            name="sortOrder"
                            label="Sort Order"
                            type="text"
                            placeholder="Enter sort order"
                            allowNumbersOnly
                        />
                    </Form>
                );
            }}
        </CustomModalWithForm>
    );
};

export default GovtServicesModal;
