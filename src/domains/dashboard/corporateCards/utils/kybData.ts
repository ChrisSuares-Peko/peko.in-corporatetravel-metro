import { KybDocument } from './types';

export const KYB_INTRO = {
    badge: 'Business Verification Required',
    title: 'Verify Your Business Identity',
    description:
        'Complete your KYB process to unlock exclusive corporate features. This secure, digital verification usually takes about 24 hours.',
    checklistTitle: 'Before you begin, keep the following ready:',
    ctaLabel: 'Initiate KYB',
    securityNote: 'Your data is encrypted and protected under RBI guidelines',
    consentText: 'By continuing, you agree and give consent for KYB through Pine Labs',
    consentLink: 'Terms & Conditions',
    infoNote:
        'Please note that all the documents must be signed by the authorised signatory along with the company seal.\nExcept for AoA and MOA only the first two pages and the last page need to be signed and stamped.',
};

export const KYB_DOCUMENTS: KybDocument[] = [
    { key: 'corporate-agreement', label: 'Corporate Agreement', uploadLabel: 'Upload Corporate Agreement' },
    { key: 'moa', label: 'MoA (Memorandum of Association)', uploadLabel: 'Upload Memorandum of Association' },
    { key: 'aoa', label: 'AoA (Articles of Association)', uploadLabel: 'Upload Articles of Association' },
    { key: 'gst', label: 'GST Certificate', uploadLabel: 'Upload GST Certificate' },
    { key: 'signing-pan', label: 'Signing Authority PAN Card', uploadLabel: 'Upload Signing Authority PAN Card' },
    { key: 'signing-aadhaar', label: 'Signing Authority Masked Aadhaar Card', uploadLabel: 'Signing Authority Masked Aadhaar Card' },
    { key: 'company-pan', label: 'Company PAN', uploadLabel: 'Upload Company PAN' },
    { key: 'coi', label: 'Certificate of Incorporation', uploadLabel: 'Upload Certificate of Incorporation' },
];

// KYB_DOCUMENTS key → backend documentName (see corporateCard controllers/corporate/corporateDocuments.js).
export const KYB_DOCUMENT_NAME_MAP: Record<string, string> = {
    'corporate-agreement': 'Corporate_Agreement',
    moa: 'MOA',
    aoa: 'AOA',
    gst: 'GST_Certificate',
    'signing-pan': 'Signing_Authority_Pan_Card',
    'signing-aadhaar': 'Signing_Authority_Aadhaar_Card',
    'company-pan': 'Company_Pan',
    coi: 'Certificate_Of_Incorporation',
};

export const KYB_UPLOAD = {
    title: 'Verify Your Business Identity',
    badge: 'Business Verification Required',
    description:
        'Complete your KYB process to unlock exclusive corporate features. This secure, digital verification usually takes about 24 hours.',
    sectionTitle: 'Upload Business Documents',
    sectionSubtitle: 'Please upload the required documents to verify your business identity.',
    infoNote:
        'Please note that all the documents must be signed by the authorised signatory along with the company seal.\nExcept for AoA and MOA only the first two pages and the last page need to be signed and stamped.',
    consentText: 'By continuing, you agree and give consent for KYB through Pine Labs',
    consentLink: 'Terms & Conditions',
    submitLabel: 'Submit Documents for Verification',
    backLabel: 'Go Back',
    securityNote: 'Your data is encrypted and protected under RBI guidelines',
};

export const KYB_SUBMITTED = {
    title: 'KYB Submitted Successfully',
    description:
        'Thank you for submitting your business documents. Our team is reviewing your submission. You will be notified via email and SMS once your KYB is approved.',
    statusLabel: 'Submitted',
    expectedCompletionPrefix: 'Expected completion:',
    expectedCompletion: 'Within 24 hours',
};

export const KYB_PENDING = {
    title: 'KYB Verification Pending',
    description:
        'Thank you for completing your KYB verification. Our team is reviewing your documents. You will be notified via email once your KYB is approved.',
    statusLabel: 'Under Review',
    expectedCompletionPrefix: 'Expected completion:',
    expectedCompletion: 'Within 24 hours',
};

export const KYB_VERIFIED = {
    title: 'KYB Verified Successfully',
    description:
        'Your business identity has been verified. You now have full access to all corporate card features.',
    ctaLabel: 'Go to Dashboard',
    verifiedWithPrefix: 'Verified with:',
    verifiedWithValue: 'Full Access Level',
};

export const KYB_REJECTED = {
    title: 'KYB Verification Failed',
    description:
        'Your KYB verification was unsuccessful. Please review the reason below and resubmit with the correct documents.',
    ctaLabel: 'Resubmit KYB',
    reasonPrefix: 'Reason:',
};
