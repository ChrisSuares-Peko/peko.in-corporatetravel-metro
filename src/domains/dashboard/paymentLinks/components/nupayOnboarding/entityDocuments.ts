// Per-entity onboarding fields for NuPay merchant onboarding.
// Mirrors the payment MS spec (services/nupayOnboarding.js). Values/order MUST stay in sync.
// `file` fields render as document uploads; `text` fields render as inputs.
export interface OnboardingField {
    name: string;
    label: string;
    type: 'file' | 'text';
    required: boolean;
    hint?: string;
}

const SIGNATORY: OnboardingField = {
    name: 'signatory_authority',
    label: 'Signatory Authority',
    type: 'file',
    required: true,
    hint: 'Aadhaar / Passport / Driving Licence / Voter ID',
};

// Bank fields (bank_account_number, ifsc_code) are collected in the dedicated Bank Details step, not here.
export const ENTITY_ONBOARDING_FIELDS: Record<string, OnboardingField[]> = {
    individual: [
        SIGNATORY,
        { name: 'pan_card', label: 'PAN Card', type: 'file', required: true },
        { name: 'address_proof', label: 'Address Proof', type: 'file', required: true },
        { name: 'board_resolution_or_poa', label: 'Board Resolution / POA', type: 'file', required: true },
    ],
    sole_proprietorship: [
        SIGNATORY,
        { name: 'proprietor_pan', label: 'Proprietor PAN', type: 'file', required: true },
        { name: 'proprietor_address', label: 'Proprietor Address Proof', type: 'file', required: true, hint: 'Aadhaar / Voter ID / Passport' },
        { name: 'business_proof_1', label: 'Business Proof 1', type: 'file', required: true, hint: 'Udyam/MSME, GST, Shop & Establishment, IEC, Utility Bill or ITR' },
        { name: 'business_proof_2', label: 'Business Proof 2', type: 'file', required: true, hint: 'A different proof from Business Proof 1' },
        { name: 'cancelled_cheque', label: 'Cancelled Cheque', type: 'file', required: true },
    ],
    partnership: [
        SIGNATORY,
        { name: 'partnership_deed', label: 'Partnership Deed', type: 'file', required: true },
        { name: 'partnership_registration_certificate', label: 'Partnership Registration Certificate', type: 'file', required: true },
        { name: 'partnership_firm_pan_card', label: 'Partnership Firm PAN Card', type: 'file', required: true },
        { name: 'list_of_all_partners', label: 'List of All Partners', type: 'file', required: true },
        { name: 'registered_office_address_proof', label: 'Registered Office Address Proof', type: 'file', required: true },
        { name: 'principal_business_address_proof', label: 'Principal Business Address Proof', type: 'file', required: true },
        { name: 'authorised_signatory_pan', label: 'Authorised Signatory PAN', type: 'file', required: true },
        { name: 'authorised_signatory_address_proof', label: 'Authorised Signatory Address Proof', type: 'file', required: true },
        { name: 'poa_or_authorisation_letter', label: 'POA / Authorisation Letter', type: 'file', required: true },
        { name: 'ubo_declaration', label: 'UBO Declaration', type: 'file', required: true },
        { name: 'ubo_pan', label: 'UBO PAN', type: 'file', required: true },
        { name: 'ubo_aadhar', label: 'UBO Aadhaar', type: 'file', required: true },
        { name: 'cancelled_cheque', label: 'Cancelled Cheque', type: 'file', required: true },
        { name: 'ownership_percentage_details', label: 'Ownership Percentage Details', type: 'text', required: true, hint: 'e.g. 50' },
    ],
    private_limited: [
        SIGNATORY,
        { name: 'certificate_of_incorporation', label: 'Certificate of Incorporation', type: 'file', required: true },
        { name: 'moa', label: 'MOA', type: 'file', required: true },
        { name: 'aoa', label: 'AOA', type: 'file', required: true },
        { name: 'company_pan', label: 'Company PAN', type: 'file', required: true },
        { name: 'board_resolution', label: 'Board Resolution', type: 'file', required: true },
        { name: 'registered_office', label: 'Registered Office Proof', type: 'file', required: true },
        { name: 'business_address', label: 'Business Address Proof', type: 'file', required: true },
        { name: 'authorised_signatory_pan', label: 'Authorised Signatory PAN', type: 'file', required: true },
        { name: 'authorised_signatory_address', label: 'Authorised Signatory Address Proof', type: 'file', required: true },
        { name: 'name_of_seniors_management_persons', label: 'Senior Management Persons', type: 'file', required: true },
        { name: 'ubo_declaration', label: 'UBO Declaration', type: 'file', required: true },
        { name: 'ubo_pan', label: 'UBO PAN', type: 'file', required: true },
        { name: 'ubo_aadhar', label: 'UBO Aadhaar', type: 'file', required: true },
        { name: 'shareholding', label: 'Shareholding', type: 'file', required: true },
        { name: 'cancelled_cheque', label: 'Cancelled Cheque', type: 'file', required: true },
        { name: 'cin', label: 'CIN', type: 'text', required: true, hint: 'e.g. U12345MH2024PTC123456' },
        { name: 'ownership_percentage_details', label: 'Ownership Percentage Details', type: 'text', required: true, hint: 'e.g. 50-50' },
    ],
};

export const getEntityOnboardingFields = (entityType?: string): OnboardingField[] =>
    ENTITY_ONBOARDING_FIELDS[entityType || ''] || [];
