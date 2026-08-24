import { Button, Empty, Flex, Skeleton, Typography } from 'antd';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import DynamicForm from '../components/DynamicForm/DynamicForm';
import { useCompanyApplicationSubmit } from '../hooks/useApplicationSubmit';
import { useFormSchema } from '../hooks/useFormData';
import { saveFormValues, setFormSchema } from '../slices/globalBusinessSetupSlice';

// import { createCompany, saveAsDraft } from '../api/company';

export default function NewSetup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const { countryData, values } = useAppSelector(state => state.reducer.globalBusinessSetup);

    const { form, Loading } = useFormSchema(countryData);
    const { saveDraft, savingDraft, submittingFinal } = useCompanyApplicationSubmit(form);

    const pageId = (location.state as { pageId?: string })?.pageId;
    const sectionId = (location.state as { sectionId?: string })?.sectionId;

    if (Loading) {
        return (
            <Flex justify="center" align="center" className="w-full h-full">
                <Skeleton active paragraph={{ rows: 10 }} />
            </Flex>
        );
    }
    if (form === null) {
        return (
            <Flex
                vertical
                align="center"
                justify="center"
                className="w-full h-full text-center px-4"
                style={{ paddingTop: '8vh' }}
                gap={24}
            >
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{ height: 140 }}
                    description={
                        <Flex vertical gap={8} style={{ maxWidth: 420 }}>
                            <Typography.Title level={4} className="!mb-0">
                                No application form available{' '}
                            </Typography.Title>
                            <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                                No application form is available for the selected country, company
                                type, and free zone. Please try different options or contact support
                                for assistance.
                            </Typography.Text>
                        </Flex>
                    }
                />

                <Button
                    type="primary"
                    danger
                    size="large"
                    onClick={() =>
                        navigate(`${paths.dashboard.globalBusinessSetup}/${paths.globalBusinessSetup.getStarted}`)
                    }
                >
                    Go Back
                </Button>
            </Flex>
        );
    }

    return (
        <DynamicForm
            formSchema={form}
            onSubmit={async (value: any, status: 'draft' | 'saved', silent?: boolean) => {
                try {
                    dispatch(setFormSchema(form));
                    dispatch(saveFormValues(value));
                    const res = await saveDraft(value, status, silent);
                    if (!res) return false;

                    if (status === 'saved' && res?.vendorApplicationId) {
                        navigate(`${paths.dashboard.globalBusinessSetup}/${paths.globalBusinessSetup.review}`);
                    }

                    return true;
                } catch (err) {
                    return false;
                }
            }}
            draftLoading={savingDraft}
            finalSubmitLoading={submittingFinal}
            initialPageId={pageId}
            initialSectionId={sectionId}
            values={values}
        />
    );
}
