import { useEffect, useState } from 'react';

import { EditOutlined } from '@ant-design/icons';
import { Button, Flex, Skeleton } from 'antd';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { paths } from '@src/routes/paths';

import DynamicForm from '../components/DynamicForm/DynamicForm';
import UpdateQuoteModal from '../components/getStarted/UpdateQuoteModal';
import { useCompanyApplicationSubmit } from '../hooks/useApplicationSubmit';
import { useFormSchemaById } from '../hooks/useFormById';
import useSingleApplication from '../hooks/useSingleApplication';
import {
    resetApplication,
    saveFormValues,
    setCountryData,
    setMetrics,
    setQuoteConfig,
    setProvider,
    setFormSchema,
    setApplicationId,
    setPricingData,
} from '../slices/globalBusinessSetupSlice';
import { QuoteConfig } from '../types/pricing';
import { normalizeQuoteConfig } from '../utils/pricingCalc';

// import { createCompany, saveAsDraft } from '../api/company';

export default function EditSetup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const { id } = useParams<{ id?: string }>();

    const { tableData, isLoading } = useSingleApplication(id!);
    const formId = tableData?.form_data?.form;
    const { form, loading } = useFormSchemaById(formId);

    const { saveDraft, savingDraft, submittingFinal } = useCompanyApplicationSubmit(form);

    const [quoteModalOpen, setQuoteModalOpen] = useState(false);
    const [livePricingId, setLivePricingId] = useState<string | null>(null);
    const [liveQuoteConfig, setLiveQuoteConfig] = useState<QuoteConfig | null>(null);

    useEffect(() => {
        dispatch(resetApplication());

        if (tableData) {
            dispatch(setApplicationId(id!));
            const metricsData = tableData.quote_config ?? tableData.metrics;
            dispatch(
                setMetrics({
                    visa: metricsData?.visa ?? 1,
                    activity: metricsData?.activity ?? 1,
                    shareholder: metricsData?.shareholder ?? 1,
                })
            );
            dispatch(setProvider(tableData.provider));
            if (tableData.pricing) {
                dispatch(setPricingData(tableData.pricing));
                dispatch(
                    setQuoteConfig(
                        normalizeQuoteConfig(
                            tableData.pricing,
                            tableData.quote_config,
                            tableData.metrics
                        )
                    )
                );
            }
            dispatch(
                setCountryData({
                    country: tableData.country._id,
                    type: tableData.type,
                    freezone: tableData.freezone,
                })
            );
        }
    }, [dispatch, id, tableData]);

    if (loading || isLoading || !tableData) {
        return (
            <Flex justify="center" align="center" className="w-full h-full">
                <Skeleton active paragraph={{ rows: 10 }} />
            </Flex>
        );
    }

    const pageIdFromLocation = (location.state as { pageId?: string } | null)?.pageId;
    const sectionIdFromLocation = (location.state as { sectionId?: string } | null)?.sectionId;

    // Always restart drafts from page 1 (unless the user explicitly came in via
    // a "Change" link from the Review page, which carries `pageIdFromLocation`).
    // Validations on earlier pages may have changed since the draft was saved —
    // walking the user from the start ensures everything re-validates and avoids
    // a confusing block on the final submit.
    const initialPageId = pageIdFromLocation || form?.pages?.[0]?._id;
    const values = tableData?.form_data;

    if (loading || isLoading || !tableData || !form) {
        return (
            <Flex justify="center" align="center" className="w-full h-full">
                <Skeleton active paragraph={{ rows: 10 }} />
            </Flex>
        );
    }

    const canEditQuote = tableData?.is_paid === false;
    const currentPricingId = livePricingId ?? tableData?.pricing?._id ?? '';
    const currentQuoteConfig =
        liveQuoteConfig ?? (tableData?.quote_config as QuoteConfig | null | undefined) ?? null;

    return (
        <>
            {canEditQuote && (
                <Flex justify="flex-end" className="mb-3">
                    <Button
                        type="default"
                        danger
                        icon={<EditOutlined />}
                        onClick={() => setQuoteModalOpen(true)}
                    >
                        Edit Quote
                    </Button>
                </Flex>
            )}

            <DynamicForm
                key={form?._id || formId || 'loading'}
                isEdit
                formSchema={form}
                onSubmit={async (value: any, status: 'draft' | 'saved', silent?: boolean) => {
                    try {
                        dispatch(setFormSchema(form));
                        dispatch(saveFormValues(value));
                        const res = await saveDraft(value, status, silent);
                        if (!res) return false;
                        if (status === 'saved' && res?.vendorApplicationId) {
                            navigate(
                                `${paths.dashboard.globalBusinessSetup}/${paths.globalBusinessSetup.review}`,
                                {
                                    state: {
                                        from: 'pendingApplications',
                                        returnPath: `${paths.dashboard.globalBusinessSetup}/${paths.globalBusinessSetup.getStarted}/${paths.globalBusinessSetup.pendingApplications}/${paths.globalBusinessSetup.edit}/${id}`,
                                    },
                                }
                            );
                        }
                        return true;
                    } catch (e) {
                        console.error('🔥 onSubmit crashed:', e);
                        return false;
                    }
                }}
                draftLoading={savingDraft}
                finalSubmitLoading={submittingFinal}
                initialPageId={initialPageId}
                initialSectionId={sectionIdFromLocation}
                values={values}
            />

            {canEditQuote && (
                <UpdateQuoteModal
                    open={quoteModalOpen}
                    onClose={() => setQuoteModalOpen(false)}
                    country={tableData.country._id}
                    companyType={tableData.type}
                    freezone={tableData.freezone || ''}
                    currentPricingId={currentPricingId}
                    currentQuoteConfig={currentQuoteConfig}
                    onSave={(pricing, quoteConfig) => {
                        dispatch(setPricingData(pricing));
                        dispatch(setQuoteConfig(quoteConfig));
                        dispatch(
                            setMetrics({
                                visa: quoteConfig.visa,
                                activity: quoteConfig.activity,
                                shareholder: quoteConfig.shareholder,
                            })
                        );
                        setLivePricingId(pricing._id);
                        setLiveQuoteConfig(quoteConfig);
                    }}
                />
            )}
        </>
    );
}
