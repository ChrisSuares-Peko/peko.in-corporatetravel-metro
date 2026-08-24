import { Form } from 'antd';

import CustomFileUploadInput from '@components/atomic/inputs/CustomFileUploadInput';
import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import CustomModalWithForm from '@components/molecular/modals/CustomModalWithForm';

import { OndcCategoryFormValues, OndcCategoryRow } from '../../../types/ondcCategory';

type CategoryFormModalProps = {
    open: boolean;
    handleCancel: () => void;
    /** present when editing an existing category/subcategory */
    data?: OndcCategoryRow;
    /** present when adding a subcategory under this parent */
    parentId?: number;
    createCategory: (values: OndcCategoryFormValues, parentId?: number) => Promise<boolean>;
    updateCategory: (id: number, values: OndcCategoryFormValues) => Promise<boolean>;
};

const CategoryFormModal = ({
    open,
    handleCancel,
    data,
    parentId,
    createCategory,
    updateCategory,
}: CategoryFormModalProps) => {
    let title = 'Add Category';
    if (data) title = data.parentId != null ? 'Edit Subcategory' : 'Edit Category';
    else if (parentId) title = 'Add Subcategory';

    const isSubcategory = !!parentId || (!!data && data.parentId != null);

    return (
        <CustomModalWithForm
            reinitialise
            modalTitle={title}
            open={open}
            handleCancel={handleCancel}
            initialValues={{
                name: data?.name || '',
                ondcDomain: data?.ondcDomain || '',
                keywords: data?.keywords || [],
                displayOrder: data?.displayOrder ?? 0,
                iconUrl: data?.iconUrl || '',
                iconFormat: null,
            }}
            handleFormSubmit={async values => {
                const ok = data
                    ? await updateCategory(data.id, values)
                    : await createCategory(values, parentId);
                if (ok) handleCancel();
            }}
        >
            {() => (
                <Form layout="vertical">
                    <TextInput
                        name="name"
                        label="Name"
                        type="text"
                        placeholder={isSubcategory ? 'e.g. Pens & Pencils' : 'e.g. Stationery'}
                        isRequired
                        maxLength={80}
                    />
                    {isSubcategory && (
                        <>
                            <TextInput
                                name="ondcDomain"
                                label="ONDC Domain"
                                type="text"
                                placeholder="e.g. RET16"
                                isRequired
                                maxLength={30}
                            />
                            <SelectInput
                                name="keywords"
                                label="Keywords"
                                placeholder="Type and press enter to add a searchable keyword"
                                mode="tags"
                                options={[]}
                                showSearch
                                allowClear
                                isRequired
                            />
                        </>
                    )}
                    {!isSubcategory && (
                        <CustomFileUploadInput
                            existingFileUrl={data?.iconUrl ?? undefined}
                            label="Category icon"
                            name="iconUrl"
                            format="iconFormat"
                            showNotification
                            showFileName
                            isRequired
                            maxFileSize={2048}
                        />
                    )}
                    <TextInput
                        allowNumbersOnly
                        name="displayOrder"
                        label="Display Order"
                        type="text"
                        placeholder="0"
                        maxLength={5}
                    />
                </Form>
            )}
        </CustomModalWithForm>
    );
};

export default CategoryFormModal;
