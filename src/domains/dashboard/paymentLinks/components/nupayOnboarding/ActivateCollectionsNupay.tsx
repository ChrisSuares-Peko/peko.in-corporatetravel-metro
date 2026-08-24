import { useState } from 'react';

import { Card, Flex, Typography } from 'antd';
import dayjs from 'dayjs';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { getEntityOnboardingFields } from './entityDocuments';
import NupayAddressStep from './NupayAddressStep';
import NupayBankStep from './NupayBankStep';
import NupayBasicInfoStep from './NupayBasicInfoStep';
import NupayBusinessDetailsStep from './NupayBusinessDetailsStep';
import NupayDocumentsStep from './NupayDocumentsStep';
import NupayOnboardingStepIndicator, { NupayOnboardingStep } from './NupayOnboardingStepIndicator';
import { submitNupayOnboarding } from '../../api';
import { ActivatePaymentCollectionsProps, NupayOnboardingFormState } from '../../types/activateCollectionsTypes';

// Text fields the backend expects in snake_case, mapped from wizard state.
const IDENTITY_FIELD_MAP: Record<string, keyof NupayOnboardingFormState> = {
    merchant_name: 'merchantName',
    contact_number: 'contactNumber',
    official_email: 'officialEmail',
    website_url: 'websiteUrl',
    city: 'city',
    state: 'state',
    pincode: 'pincode',
};

const ActivateCollectionsNupay = ({
    onCancel,
    onActivated,
    initialData,
    refresh,
    title = 'Payment Links',
}: ActivatePaymentCollectionsProps) => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const dispatch = useAppDispatch();
    const [step, setStep] = useState<NupayOnboardingStep>(1);
    // A resubmission after rejection starts fresh — same as a first-time submit. NuPay will
    // provide a dedicated update API later; until then every submit is a brand-new application.
    const [form, setForm] = useState<Partial<NupayOnboardingFormState>>({
        merchantName: initialData?.businessName || '',
        officialEmail: initialData?.email || '',
        contactNumber: initialData?.phone || '',
    });
    const [miqValues, setMiqValues] = useState<Record<string, any>>({});
    const [docFiles, setDocFiles] = useState<Record<string, File>>({});
    const [docText, setDocText] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const merge = (values: Partial<NupayOnboardingFormState>) => setForm(prev => ({ ...prev, ...values }));

    const handleFile = (name: string, file: File | null) =>
        setDocFiles(prev => {
            const next = { ...prev };
            if (file) next[name] = file;
            else delete next[name];
            return next;
        });

    const validateDocuments = () => {
        const fields = getEntityOnboardingFields(form.entityType);
        const missing = fields.filter(f => {
            if (!f.required) return false;
            return f.type === 'file' ? !docFiles[f.name] : !docText[f.name]?.trim();
        });
        if (missing.length) {
            dispatch(showToast({ variant: 'error', description: `Please provide: ${missing.map(f => f.label).join(', ')}` }));
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateDocuments()) return;
        setSubmitting(true);

        const fd = new FormData();
        fd.append('entityType', form.entityType || '');
        Object.entries(IDENTITY_FIELD_MAP).forEach(([apiKey, stateKey]) => {
            const value = form[stateKey];
            if (value) fd.append(apiKey, String(value));
        });
        if (form.bankAccountNumber) fd.append('bank_account_number', form.bankAccountNumber);
        if (form.ifscCode) fd.append('ifsc_code', form.ifscCode);
        if (form.accountHolderName) fd.append('accountHolderName', form.accountHolderName);
        Object.entries(miqValues).forEach(([k, v]) => {
            const val = dayjs.isDayjs(v) ? v.format('DD/MM/YYYY') : v;
            if (val != null && String(val).trim()) fd.append(k, String(val).trim());
        });
        Object.entries(docText).forEach(([k, v]) => v?.trim() && fd.append(k, v.trim()));
        Object.entries(docFiles).forEach(([k, file]) => fd.append(k, file));

        try {
            await submitNupayOnboarding({ userId: id, userType: role, formData: fd });
            dispatch(showToast({ variant: 'success', description: 'Onboarding submitted. Verification is in progress.' }));
            refresh();
            onActivated();
        } catch {
            // API/vendor errors are surfaced by the global response interceptor toast
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Flex align="center" justify="center" className="w-full px-3 py-4 sm:px-4 sm:py-6">
            <Card
                className="w-full max-w-[820px] rounded-[20px] border border-[#D7E2F0] shadow-none"
                styles={{ body: { padding: 'clamp(20px, 4vw, 32px) clamp(16px, 5vw, 36px)' } }}
            >
                <Flex vertical gap={20}>
                    <Flex vertical gap={2}>
                        <Typography.Title
                            level={3}
                            className="!mb-0 !text-[22px] !font-bold !leading-[1.3] !text-[#1F2A44]"
                        >
                            Activate {title === 'Payment Links' ? 'Payment Collections' : 'Payout'}
                        </Typography.Title>
                        <Typography.Text className="text-[13px] leading-[1.45] text-[#667085]">
                            Complete the steps below to start accepting payments
                        </Typography.Text>
                    </Flex>

                    <NupayOnboardingStepIndicator step={step} />

                    {step === 1 && (
                        <NupayBasicInfoStep
                            initialValues={form}
                            onCancel={onCancel}
                            onNext={values => {
                                merge(values);
                                setStep(2);
                            }}
                        />
                    )}

                    {step === 2 && (
                        <NupayBusinessDetailsStep
                            initialValues={miqValues}
                            onBack={() => setStep(1)}
                            onNext={values => {
                                setMiqValues(values);
                                setStep(3);
                            }}
                        />
                    )}

                    {step === 3 && (
                        <NupayAddressStep
                            initialValues={form}
                            onBack={() => setStep(2)}
                            onNext={values => {
                                merge(values);
                                setStep(4);
                            }}
                        />
                    )}

                    {step === 4 && (
                        <NupayBankStep
                            initialValues={form}
                            onBack={() => setStep(3)}
                            onNext={values => {
                                merge(values);
                                setStep(5);
                            }}
                        />
                    )}

                    {step === 5 && (
                        <NupayDocumentsStep
                            entityType={form.entityType || ''}
                            files={docFiles}
                            textValues={docText}
                            onFile={handleFile}
                            onText={(name, value) => setDocText(prev => ({ ...prev, [name]: value }))}
                            onBack={() => setStep(4)}
                            onSubmit={handleSubmit}
                            submitting={submitting}
                        />
                    )}
                </Flex>
            </Card>
        </Flex>
    );
};

export default ActivateCollectionsNupay;
