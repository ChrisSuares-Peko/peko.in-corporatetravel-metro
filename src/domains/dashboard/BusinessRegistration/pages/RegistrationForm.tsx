import { useEffect, useRef, useState } from 'react';

import { Button, Form as AntForm, Spin, Typography } from 'antd';
import { Formik, Form, FormikProps, FormikTouched } from 'formik';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { paths } from '@routes/paths';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import {
    ApplicationDocument,
    getApplications,
    saveDraftApplication,
    sendApplicationToVendor,
    startVendorPaymentPhase,
    submitApplication,
    syncApplicationDocuments,
    uploadApplicationDocument,
} from '../api';
import DigitalSignatureCard from '../components/DigitalSignatureCard';
import RelationshipManagerCard from '../components/RelationshipManagerCard';
import StepProgress from '../components/StepProgress';
import Contribution from '../components/steps/llp/Contribution';
import LlpAgreement from '../components/steps/llp/LlpAgreement';
import DirectorNomineeKYC from '../components/steps/opc/DirectorNomineeKYC';
import Shareholding from '../components/steps/opc/Shareholding';
import PartnershipDeed from '../components/steps/partnership/PartnershipDeed';
import PartnersKYC from '../components/steps/partnership/PartnersKYC';
import DirectorsKYC from '../components/steps/privateLimited/DirectorsKYC';
import BasicInformation from '../components/steps/proprietorship/BasicInformation';
import DocumentsStep from '../components/steps/proprietorship/DocumentsStep';
import ProprietorKYC from '../components/steps/proprietorship/ProprietorKYC';
import RegistrationFiling from '../components/steps/proprietorship/RegistrationFiling';
import { DocumentUploadContext, UploadDocFn } from '../context/documentUpload';
import { DraftSaveContext } from '../context/draftSave';
import { buildTouched, getStepSchemas, scrollToFirstError } from '../schema';
import { clearCurrentApplication, setSubmittedApplication, updateApplicationData } from '../slices/businessRegistrationSlice';
import { EntityType } from '../types';
import { HERO_SUBTITLE, HERO_TITLE, STEPS_BY_ENTITY } from '../utils/data';
import { isUploadedFile, stripFileContents } from '../utils/draft';
import { DEFAULT_LLP_DUTIES, DEFAULT_LLP_RIGHTS } from '../utils/llp';
import { EMPTY_PARTNER } from '../utils/partnership';
import { EMPTY_PERSON } from '../utils/person';
import { docNidForPath, getAllDocNames } from '../utils/proprietorDocuments';
import { friendlyVendorError } from '../utils/vendorErrors';

const { Title, Paragraph } = Typography;

const ENTITY_TYPES = new Set<string>(Object.values(EntityType));

// Entities filed with the vendor (IndiaFilings create-chain) for now.
const VENDOR_ENTITIES = new Set<EntityType>([EntityType.OPC, EntityType.PRIVATE_LIMITED]);


const getPath = (obj: unknown, path: string) =>
    path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], obj);

// personKey mirrors the backend chain identity (PAN or passport number
// uppercase, else role:index) so each document is uploaded against the right
// vendor person.
type IdPerson = { pan?: string; passportNumber?: string };
const personIdOf = (p?: IdPerson) => p?.pan || p?.passportNumber;

const resolvePersonKey = (values: Record<string, unknown>, fieldPath: string): string | null => {
    const arrayMatch = fieldPath.match(/^documents\.(directors|partners)\.(\d+)\./);
    if (arrayMatch) {
        const [, field, idx] = arrayMatch;
        const person = (values[field] as IdPerson[] | undefined)?.[Number(idx)];
        const id = personIdOf(person);
        return id ? String(id).toUpperCase() : `director:${idx}`;
    }
    if (fieldPath.includes('.director.')) {
        const id = personIdOf(values.director as IdPerson | undefined);
        return id ? String(id).toUpperCase() : 'director:0';
    }
    return null; // office/business-level documents
};

// Collect the KYC documents (with base64) to push one-per-request after submit.
const collectDocuments = (values: Record<string, unknown>): ApplicationDocument[] => {
    const docs = getAllDocNames(values).flatMap(fieldPath => {
        const file = getPath(values, fieldPath);
        if (!isUploadedFile(file)) return [];
        const documentNid = docNidForPath(fieldPath);
        return [
            {
                docType: fieldPath.replace(/^documents\./, '').replace(/\./g, '_'),
                personKey: resolvePersonKey(values, fieldPath),
                fileName: file.name,
                fileString: file.base64,
                ...(documentNid != null ? { documentNid } : {}),
            },
        ];
    });
    return docs;
};

// Payment is always the 2nd step: step 1 (Basic Information) → payment → the
// remaining steps resume here via the ?step= query param. Steps 2+ show the RM sidebar.
const RegistrationForm = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentApplication } = useAppSelector(state => state.reducer.businessRegistration);
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);

    // The URL is the source of truth: entityType from the path param (so a reload
    // can never fall back to the wrong entity), applicationId + step from query.
    const { entityType: entityTypeParam } = useParams<{ entityType?: string }>();
    const entityType = ENTITY_TYPES.has(entityTypeParam ?? '')
        ? (entityTypeParam as EntityType)
        : undefined;
    const steps = (entityType && STEPS_BY_ENTITY[entityType]) || [];

    // Post-payment the central payment hook redirects here with ?status=success.
    const paidReturn = searchParams.get('status') === 'success';
    const urlApplicationId = searchParams.get('applicationId') || undefined;

    // A stored draft belongs to THIS form only when it's the same entity (or the
    // application named in the URL). A leftover draft from a different entity
    // (e.g. a Private Limited draft) must NOT seed an OPC form — otherwise its
    // directors/capital/documents/applicationId leak across entity types.
    const draftMatchesRoute =
        !(currentApplication?.entityType as string | undefined) ||
        (currentApplication?.entityType as string | undefined) === entityType ||
        (currentApplication?.applicationId as string | undefined) === urlApplicationId;
    const routeApplication = draftMatchesRoute ? currentApplication : {};
    // NB: searchParams.get returns null when the param is absent, and
    // Number(null) === 0 — so only trust `step` when it's actually present,
    // otherwise a post-payment return (no step param) resolves to step 0 instead
    // of advancing to step 1.
    const stepRaw = searchParams.get('step');
    const stepParam = stepRaw !== null && stepRaw !== '' ? Number(stepRaw) : NaN;
    const fallbackStep = paidReturn ? 1 : 0;
    const startStep = Number.isInteger(stepParam) && stepParam >= 0 ? stepParam : fallbackStep;
    const [currentStep, setCurrentStep] = useState(startStep);
    const [hydrating, setHydrating] = useState(Boolean(urlApplicationId) && !currentApplication?.applicationId);
    const hydrateAttempted = useRef(false);
    const [submitting, setSubmitting] = useState(false);

    // No valid entity in the URL → nothing to render; send the user back to pick
    // a structure instead of silently defaulting to one.
    useEffect(() => {
        if (!entityType) {
            navigate(`${paths.businessRegistration.index}/${paths.businessRegistration.form}`, {
                replace: true,
            });
        }
    }, [entityType, navigate]);

    // Wipe a leftover draft from a different entity so its applicationId/data
    // can't leak into this entity's saves or merges (routeApplication guards the
    // initial render; this keeps the store itself clean).
    useEffect(() => {
        if (!draftMatchesRoute) dispatch(clearCurrentApplication());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftMatchesRoute]);

    // Reload recovery: the URL carries an applicationId but Redux was wiped —
    // rehydrate the draft (incl. entityType + saved data) from the server.
    useEffect(() => {
        if (hydrateAttempted.current) return;
        if (!urlApplicationId || currentApplication?.applicationId === urlApplicationId) {
            setHydrating(false);
            return;
        }
        hydrateAttempted.current = true;
        setHydrating(true);
        getApplications({ userId: Number(userId), userType: userType ?? '', limit: 50 }).then(res => {
            const row =
                res && Array.isArray(res.applications)
                    ? res.applications.find(r => r.applicationId === urlApplicationId)
                    : null;
            if (row) {
                dispatch(
                    updateApplicationData({
                        ...(row.applicationData ?? {}),
                        entityType: row.entityType as EntityType,
                        applicationId: row.applicationId,
                        paymentCompleted: row.paymentStatus === 'COMPLETED',
                    })
                );
            }
            setHydrating(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Set while jumping to the payment page. Creating the draft's applicationId
    // there dispatches an update that fires the URL-sync effect below; its
    // setSearchParams(replace) runs in the same tick as navigate('/payment') and
    // cancels it — so the FIRST proceed (new applicationId) appeared to do
    // nothing while the second (unchanged applicationId) worked. Guarding the
    // sync during that jump lets the navigate win.
    const leavingForPayment = useRef(false);
    // Keep the URL query in sync with the live applicationId + step so a reload
    // at any point resumes the same draft and step (replace: no history spam).
    useEffect(() => {
        if (leavingForPayment.current) return;
        const appId = currentApplication?.applicationId as string | undefined;
        const next = new URLSearchParams(searchParams);
        let changed = false;
        if (appId && next.get('applicationId') !== appId) {
            next.set('applicationId', appId);
            changed = true;
        }
        if (next.get('step') !== String(currentStep)) {
            next.set('step', String(currentStep));
            changed = true;
        }
        if (changed) setSearchParams(next, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentApplication?.applicationId, currentStep]);
    const isLast = currentStep === steps.length - 1;
    const hasSidebar = currentStep > 0;
    // The Documents step uploads its files on Next (not at final submit) so an
    // upload error blocks moving to the final page. -1 for entities without one.
    const documentsStepIndex = steps.indexOf('Documents');

    const formikRef = useRef<FormikProps<Record<string, unknown>>>(null);
    const validationSchemas = getStepSchemas(entityType);

    // Validate the current step's schema; on errors, reveal them and block Next.
    const validateCurrentStep = async () => {
        const formik = formikRef.current;
        if (!formik || !validationSchemas[currentStep]) return true;
        const errors = await formik.validateForm();
        if (!Object.keys(errors).length) return true;
        formik.setErrors(errors);
        formik.setTouched(
            buildTouched(formik.values, errors) as FormikTouched<Record<string, unknown>>,
            false
        );
        // Signals collapsed person cards with errors to expand (see
        // CollapsiblePersonCard) before the scroll below looks for them.
        formik.setStatus({
            ...(formik.status || {}),
            validationAttempt: ((formik.status?.validationAttempt as number) || 0) + 1,
        });
        scrollToFirstError();
        return false;
    };

    // Once paid, step 0 stays editable but can never lead back to payment.
    const paymentCompleted = Boolean(currentApplication?.paymentCompleted) || paidReturn;
    const paymentPhaseTriggered = useRef(false);
    useEffect(() => {
        if (!paidReturn) return;
        if (!currentApplication?.paymentCompleted) {
            dispatch(updateApplicationData({ paymentCompleted: true }));
        }
        // Payments go through Cashfree (a separate service that can't start the
        // vendor chain), so start the payment-phase steps here — once — the
        // moment we land back from the gateway. The backend runs it in the
        // background and is idempotent, so a repeat on reload is harmless.
        const appId = (currentApplication?.applicationId as string | undefined) || urlApplicationId;
        if (!paymentPhaseTriggered.current && appId && entityType && VENDOR_ENTITIES.has(entityType)) {
            paymentPhaseTriggered.current = true;
            startVendorPaymentPhase({ userId: Number(userId), userType: userType ?? '', applicationId: appId });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paidReturn, currentApplication?.applicationId]);

    const initialValues = {
        primaryContact: { fullName: '', email: '', mobile: '' },
        proposedNames: { first: '', second: '', third: '', fourth: '' },
        stateOfIncorporation: '',
        businessActivities: [],
        businessDescription: '',
        registeredOffice: '',
        registeredOfficeAddress: {
            line1: '',
            line2: '',
            pincode: '',
            area: '',
            city: '',
            district: '',
            state: '',
            latitude: '',
            longitude: '',
            landlordName: '',
            businessMobile: '',
            businessEmail: '',
        },
        numberOfDirectors: undefined,
        numberOfShareholders: undefined,
        director: { ...EMPTY_PERSON },
        directors: [{ ...EMPTY_PERSON }],
        nominee: { ...EMPTY_PERSON },
        authorizedCapital: undefined,
        paidUpCapital: undefined,
        faceValuePerShare: 10,
        shareholding: {},
        totalContribution: '',
        contribution: {},
        llpAgreement: {
            type: 'standard',
            rights: DEFAULT_LLP_RIGHTS,
            duties: DEFAULT_LLP_DUTIES,
            meetingQuorum: '',
            votingThreshold: '',
            disputeMethod: '',
            jurisdiction: '',
            document: '',
            confirmed: false,
        },
        partners: [{ ...EMPTY_PARTNER }],
        // routeApplication is currentApplication only when it belongs to this
        // route — a different-entity leftover is dropped so it can't prefill.
        ...routeApplication,
        // Route param is authoritative for the entity — never let a stale
        // Redux value override which form we're rendering.
        entityType,
    };

    // Submit sequence (one click): 1) persist the application (filenames only),
    // 2) upload each KYC document (base64, one per request — CI pattern),
    // 3) start the vendor create-chain for OPC / Private Limited, then track.
    const handleFinalSubmit = async (values: Record<string, unknown>) => {
        const merged: Record<string, unknown> = { ...currentApplication, ...values };
        delete merged.activitySearch; // transient NIC picker field
        const applicationData = stripFileContents(merged) as Record<string, unknown>;

        setSubmitting(true);
        const auth = { userId: Number(userId), userType: userType ?? '' };
        const result = await submitApplication({
            ...auth,
            applicationId: currentApplication?.applicationId as string | undefined,
            entityType: (entityType ?? '') as string,
            applicationData,
        });
        if (!result) {
            setSubmitting(false);
            dispatch(showToast({ description: 'Could not submit your application. Please try again.', variant: 'error' }));
            return;
        }

        const applicationId = (result as { applicationId?: string }).applicationId ?? '';
        // People, shareholdings and documents were already pushed to the vendor at
        // each step (and blocked there on failure). Final submit just files the
        // smart form: sendToVendor runs the idempotent chain, which now has only
        // Smart Form 2 left to do (the earlier steps are skipped as done).
        if (applicationId && entityType && VENDOR_ENTITIES.has(entityType)) {
            await sendApplicationToVendor({ ...auth, applicationId });
        }
        setSubmitting(false);

        dispatch(setSubmittedApplication(result));
        navigate(`${paths.businessRegistration.index}/${paths.businessRegistration.tracking}`, {
            state: result,
        });
    };

    // Step 0 → create/refresh the PENDING draft on the server (it computes the
    // authoritative pricing the payment debits against), then go to payment.
    const handleProceedToPayment = async (values: Record<string, unknown>) => {
        const merged: Record<string, unknown> = { ...currentApplication, ...values };
        delete merged.activitySearch;
        const applicationData = stripFileContents(merged) as Record<string, unknown>;

        setSubmitting(true);
        const draft = await saveDraftApplication({
            userId: Number(userId),
            userType: userType ?? '',
            applicationId: currentApplication?.applicationId as string | undefined,
            entityType: (entityType ?? '') as string,
            applicationData,
        });
        setSubmitting(false);
        if (!draft) {
            dispatch(showToast({ description: 'Could not save your application. Please try again.', variant: 'error' }));
            return;
        }
        // Set BEFORE the dispatch: the new applicationId fires the URL-sync
        // effect, which must be skipped now so its setSearchParams doesn't cancel
        // the navigate to /payment below.
        leavingForPayment.current = true;
        dispatch(updateApplicationData({ applicationId: draft.applicationId, draftPricing: draft }));
        navigate(`${paths.businessRegistration.index}/${paths.businessRegistration.payment}`);
    };

    // Persist progress server-side on every step (fire-and-forget, fail-soft).
    // vendorSync when leaving the KYC step pushes business + directors to the
    // vendor in the background (post-payment, OPC/PvtLtd only).
    const persistDraft = (values: Record<string, unknown>, vendorSync: boolean) => {
        const merged: Record<string, unknown> = { ...currentApplication, ...values };
        delete merged.activitySearch;
        saveDraftApplication({
            userId: Number(userId),
            userType: userType ?? '',
            applicationId: currentApplication?.applicationId as string | undefined,
            entityType: (entityType ?? '') as string,
            applicationData: stripFileContents(merged) as Record<string, unknown>,
            vendorSync: vendorSync && entityType ? VENDOR_ENTITIES.has(entityType) : false,
        });
    };

    // On-demand server save for the per-person "Save progress" buttons — awaits
    // the save and reports success/failure (unlike persistDraft, which is
    // fire-and-forget). No validation: a draft may be partially filled.
    const saveProgress = async (values: Record<string, unknown>): Promise<boolean> => {
        const merged: Record<string, unknown> = { ...currentApplication, ...values };
        delete merged.activitySearch;
        const draft = await saveDraftApplication({
            userId: Number(userId),
            userType: userType ?? '',
            applicationId: currentApplication?.applicationId as string | undefined,
            entityType: (entityType ?? '') as string,
            applicationData: stripFileContents(merged) as Record<string, unknown>,
        });
        if (!draft) {
            dispatch(showToast({ description: 'Could not save your progress. Please try again.', variant: 'error' }));
            return false;
        }
        // Capture a freshly-created draft id so later saves update the same row.
        if (draft.applicationId && draft.applicationId !== currentApplication?.applicationId) {
            dispatch(updateApplicationData({ applicationId: draft.applicationId }));
        }
        dispatch(showToast({ description: 'Your progress has been saved.', variant: 'success' }));
        return true;
    };

    // Upload every KYC/service document (base64, one request each) for the
    // application. uploadApplicationDocument resolves to `false` on failure, so
    // we count those and let the caller block navigation on any failure.
    const uploadDocuments = async (applicationId: string, source: Record<string, unknown>) => {
        const documents = collectDocuments(source);
        if (!documents.length) return { total: 0, failed: 0 };
        const auth = { userId: Number(userId), userType: userType ?? '' };
        const results = await Promise.all(
            documents.map(document => uploadApplicationDocument({ ...auth, applicationId, document }))
        );
        return { total: documents.length, failed: results.filter(r => r === false).length };
    };

    // Synchronous per-step vendor sync (KYC → directors, Shareholding →
    // shareholders). Persists the draft AND pushes to the vendor in one call;
    // returns false (with a toast) so the caller blocks the step. Idempotent
    // server-side, so back-nav / resume re-runs never duplicate.
    const syncStepPhase = async (
        applicationId: string,
        syncPhase: 'directors' | 'shareholders',
        source: Record<string, unknown>
    ) => {
        const merged: Record<string, unknown> = { ...source, activitySearch: undefined };
        const draft = await saveDraftApplication({
            userId: Number(userId),
            userType: userType ?? '',
            applicationId,
            entityType: (entityType ?? '') as string,
            applicationData: stripFileContents(merged) as Record<string, unknown>,
            syncPhase,
        });
        if (!draft) {
            dispatch(showToast({ description: 'Could not save your details. Please try again.', variant: 'error' }));
            return false;
        }
        if (draft.sync && draft.sync.ok === false) {
            // Map the raw vendor error to a friendly, actionable line so the user
            // knows which detail to fix — without leaking raw vendor codes.
            dispatch(showToast({
                description: friendlyVendorError(draft.sync.error),
                variant: 'error',
            }));
            return false;
        }
        return true;
    };

    // On-the-go single-document upload (Documents step): push a file to the
    // vendor the moment it's picked. Reuses the sync endpoint with a one-item
    // list — its documents phase is granular, so only this file is uploaded.
    const uploadDocOnTheGo: UploadDocFn = async (fieldPath, file) => {
        const appId = currentApplication?.applicationId as string | undefined;
        const isVendor = Boolean(entityType && VENDOR_ENTITIES.has(entityType));
        if (!appId || !isVendor) return { ok: false, skipped: true };
        const documentNid = docNidForPath(fieldPath);
        const doc: ApplicationDocument = {
            docType: fieldPath.replace(/^documents\./, '').replace(/\./g, '_'),
            personKey: resolvePersonKey(formikRef.current?.values ?? {}, fieldPath),
            fileName: file.name,
            fileString: file.base64,
            ...(documentNid != null ? { documentNid } : {}),
        };
        const result = await syncApplicationDocuments({
            userId: Number(userId),
            userType: userType ?? '',
            applicationId: appId,
            documents: [doc],
        });
        if (!result) return { ok: false, error: friendlyVendorError('document upload failed') };
        const err = (result as { error?: string }).error;
        return err ? { ok: false, error: friendlyVendorError(err) } : { ok: true };
    };

    // Documents step (vendor entities): batch-push any files not already sent
    // on the go; block on any failure. Already-uploaded files carry no base64
    // (dropped after their on-the-go / resume upload), so nothing is re-sent.
    const syncStepDocuments = async (applicationId: string, source: Record<string, unknown>) => {
        const documents = collectDocuments(source).filter(d => d.fileString);
        if (!documents.length) return true;
        const result = await syncApplicationDocuments({
            userId: Number(userId),
            userType: userType ?? '',
            applicationId,
            documents,
        });
        const errorMsg =
            !result
                ? 'document upload failed'
                : (result as { error?: string }).error;
        if (errorMsg) {
            dispatch(showToast({ description: friendlyVendorError(errorMsg), variant: 'error' }));
            return false;
        }
        return true;
    };

    const handlePrimary = async (values: Record<string, unknown>) => {
        if (!(await validateCurrentStep())) return;
        dispatch(updateApplicationData(values));
        if (currentStep === 0) {
            if (paymentCompleted) {
                // Already paid — edits are saved and the flow resumes; the paid
                // amount is frozen server-side, so no return to payment.
                persistDraft(values, false);
                setCurrentStep(1);
            } else {
                handleProceedToPayment(values);
            }
        } else if (!isLast) {
            const appId = currentApplication?.applicationId as string | undefined;
            const merged: Record<string, unknown> = { ...currentApplication, ...values };
            const isVendor = Boolean(entityType && VENDOR_ENTITIES.has(entityType));

            // Documents step — push the files now so an upload error blocks moving
            // on. Vendor entities upload straight to the vendor; others to our DB.
            if (currentStep === documentsStepIndex && appId) {
                setSubmitting(true);
                let ok = true;
                if (isVendor) {
                    ok = await syncStepDocuments(appId, merged);
                } else {
                    const { failed } = await uploadDocuments(appId, merged);
                    ok = failed === 0;
                    if (!ok) {
                        dispatch(showToast({
                            description: `${failed} document${failed > 1 ? 's' : ''} could not be uploaded. Please retry before continuing.`,
                            variant: 'error',
                        }));
                    }
                }
                setSubmitting(false);
                if (!ok) return;
                persistDraft(values, false);
                setCurrentStep(currentStep + 1);
                return;
            }

            // KYC (directors) / Shareholding steps — sync to the vendor and block
            // the step on failure (vendor entities only).
            let phase: 'directors' | 'shareholders' | null = null;
            if (isVendor && appId) {
                if (currentStep === 1) phase = 'directors';
                else if (steps[currentStep] === 'Shareholding') phase = 'shareholders';
            }
            if (phase && appId) {
                setSubmitting(true);
                const ok = await syncStepPhase(appId, phase, merged);
                setSubmitting(false);
                if (!ok) return;
                setCurrentStep(currentStep + 1);
                return;
            }

            // Any other step — just persist the draft and advance.
            persistDraft(values, false);
            setCurrentStep(currentStep + 1);
        } else {
            handleFinalSubmit(values);
        }
    };

    const handleBack = (values: Record<string, unknown>) => {
        if (currentStep === 0) {
            navigate(`${paths.businessRegistration.index}/${paths.businessRegistration.form}`);
        } else {
            dispatch(updateApplicationData(values));
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep = () => {
        if (currentStep === 0) return <BasicInformation />;
        // Proprietorship is the only entity with its post-payment steps built so far.
        if (entityType === EntityType.PROPRIETORSHIP) {
            if (currentStep === 1) return <ProprietorKYC />;
            if (currentStep === 2) return <DocumentsStep />;
            if (currentStep === 3) return <RegistrationFiling />;
        }
        if (entityType === EntityType.PARTNERSHIP) {
            if (currentStep === 1) return <PartnersKYC />;
            if (currentStep === 2) return <PartnershipDeed />;
            if (currentStep === 3) return <DocumentsStep />;
            if (currentStep === 4) return <RegistrationFiling />;
        }
        if (entityType === EntityType.OPC) {
            if (currentStep === 1) return <DirectorNomineeKYC />;
            if (currentStep === 2) return <Shareholding />;
            if (currentStep === 3) return <DocumentsStep />;
            if (currentStep === 4) return <RegistrationFiling />;
        }
        if (entityType === EntityType.LLP) {
            if (currentStep === 1) return <DirectorsKYC title="Designated Partners KYC" />;
            if (currentStep === 2) return <Contribution />;
            if (currentStep === 3) return <LlpAgreement />;
            if (currentStep === 4) return <RegistrationFiling />;
        }
        if (entityType === EntityType.PRIVATE_LIMITED) {
            if (currentStep === 1) return <DirectorsKYC />;
            if (currentStep === 2) return <Shareholding />;
            if (currentStep === 3) return <DocumentsStep />;
            if (currentStep === 4) return <RegistrationFiling />;
        }
        return (
            <div className="bg-white rounded-[30px] p-10 text-center shadow-[0px_1.5px_16.5px_0px_rgba(0,0,0,0.06)]">
                <Paragraph className="!mb-0 text-[#6a7282]">
                    {steps[currentStep]} — coming soon.
                </Paragraph>
            </div>
        );
    };

    let primaryLabel = 'Next';
    if (currentStep === 0) primaryLabel = paymentCompleted ? 'Save & Continue' : 'Proceed to payment';
    else if (isLast) primaryLabel = 'File Smart Form';

    // Steps with a confirmation checkbox keep the primary action disabled until
    // it's ticked (deed/agreement, and the final filing confirmation).
    const isPrimaryDisabled = (values: Record<string, unknown>) => {
        if (isLast) return !values.filingConfirmed;
        if (entityType === EntityType.PARTNERSHIP && currentStep === 2) {
            return !values.partnershipDeedConfirmed;
        }
        if (entityType === EntityType.LLP && currentStep === 3) {
            return !(values.llpAgreement as { confirmed?: boolean } | undefined)?.confirmed;
        }
        return false;
    };

    const renderFooter = (values: Record<string, unknown>) => (
        <div className="mt-8 flex items-center justify-between gap-4">
            <Button
                onClick={() => handleBack(values)}
                className="!h-[44px] !px-6 !text-[16px] !rounded-[8px] !border-[#ff4f4f] !text-[#ff4f4f] hover:!bg-[#fff5f5] transition-colors"
            >
                Back
            </Button>
            <Button
                type="primary"
                disabled={isPrimaryDisabled(values)}
                loading={submitting}
                onClick={() => handlePrimary(values)}
                className="!h-[44px] !px-6 !text-[16px] !font-medium !rounded-[8px] !bg-[#ff4f4f] hover:!bg-[#e64444] transition-colors"
            >
                {primaryLabel}
            </Button>
        </div>
    );

    // Redirecting (no entity) or restoring a draft after a reload — hold the
    // form until we have something real to render.
    if (!entityType || hydrating) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen p-3 sm:p-6">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                <div className="text-center">
                    <Title level={2} className="!text-[24px] sm:!text-[28px] !font-semibold !text-[#1e293b] !mb-1">
                        {HERO_TITLE}
                    </Title>
                    <Paragraph className="!mb-0 text-[15px] sm:text-[20px] text-[#6a7282]">
                        {HERO_SUBTITLE}
                    </Paragraph>
                </div>

                <StepProgress steps={steps} currentStep={currentStep} />

                <div className={hasSidebar ? 'w-full' : 'max-w-4xl mx-auto w-full'}>
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchemas[currentStep] ?? undefined}
                        enableReinitialize
                        onSubmit={() => undefined}
                    >
                        {({ values }) => (
                            <Form>
                              <DraftSaveContext.Provider value={saveProgress}>
                               <DocumentUploadContext.Provider value={uploadDocOnTheGo}>
                                {hasSidebar ? (
                                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                                        <div className="flex-1 min-w-0">
                                            <AntForm layout="vertical" component={false}>
                                                {renderStep()}
                                            </AntForm>
                                            {renderFooter(values)}
                                        </div>
                                        <aside className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
                                            <RelationshipManagerCard />
                                            <DigitalSignatureCard />
                                        </aside>
                                    </div>
                                ) : (
                                    <>
                                        <AntForm layout="vertical" component={false}>
                                            {renderStep()}
                                        </AntForm>
                                        {renderFooter(values)}
                                    </>
                                )}
                               </DocumentUploadContext.Provider>
                              </DraftSaveContext.Provider>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;
