// MIQ (Merchant Information Questionnaire) fields collected in onboarding and written to the
// NuPay MIQ Excel by the backend. Only fields NOT already captured elsewhere in the wizard
// (name, website, address, contact, bank, entity type, CIN) live here. Field `name` is the
// snake_case key sent to the backend and used directly as the MIQ column source.

// Canonical patterns reused from the rest of the app (CompanyIncorporation / Compliance schemas).
const NAME_PATTERN = /^(?=.*[A-Za-z])[A-Za-z0-9&.,'() /-]{2,100}$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
// Scheme optional — the backend prepends https:// when missing (matches the app's URL convention).
const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

export interface MiqField {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'date';
    required: boolean;
    hint?: string;
    email?: boolean;
    uppercase?: boolean;
    pattern?: RegExp;
    patternMessage?: string;
}

export interface MiqSection {
    title: string;
    fields: MiqField[];
}

export const MIQ_SECTIONS: MiqSection[] = [
    {
        title: 'Business Profile',
        fields: [
            { name: 'billing_name', label: 'Billing Name', type: 'text', required: true, pattern: NAME_PATTERN, patternMessage: 'Please enter a valid billing name' },
            { name: 'legal_business_name', label: 'Legal Business Name', type: 'text', required: true, pattern: NAME_PATTERN, patternMessage: 'Please enter a valid legal business name' },
            { name: 'business_pan', label: 'Business PAN', type: 'text', required: true, uppercase: true, pattern: PAN_PATTERN, patternMessage: 'Invalid PAN format (e.g. ABCDE1234F)' },
            { name: 'authorised_signatory_pan_number', label: 'Authorised Signatory PAN', type: 'text', required: true, uppercase: true, pattern: PAN_PATTERN, patternMessage: 'Invalid PAN format (e.g. ABCDE1234F)' },
            { name: 'pan_owner_name', label: 'PAN Owner Name', type: 'text', required: true, pattern: NAME_PATTERN, patternMessage: 'Please enter a valid PAN owner name' },
            { name: 'gstin', label: 'GSTIN', type: 'text', required: true, uppercase: true, pattern: GSTIN_PATTERN, patternMessage: 'Invalid GSTIN format' },
            { name: 'business_category', label: 'Business Category', type: 'text', required: true, hint: 'allowed values pending from NuPay', pattern: NAME_PATTERN, patternMessage: 'Please enter a valid business category' },
            { name: 'sub_category', label: 'Sub Category', type: 'text', required: false },
            { name: 'establishment_date', label: 'Business Establishment Date', type: 'date', required: true },
            { name: 'contact_person_name', label: 'Contact Person Name', type: 'text', required: true, pattern: NAME_PATTERN, patternMessage: 'Please enter a valid contact person name' },
            { name: 'transactions_report_email', label: 'Transactions Report Email', type: 'text', required: true, email: true },
            { name: 'business_address', label: 'Business Address', type: 'textarea', required: true },
            { name: 'business_description', label: 'Business Description', type: 'textarea', required: true },
        ],
    },
    {
        title: 'Website & Policy Links',
        fields: [
            { name: 'about_us_link', label: 'About Us Page Link', type: 'text', required: true, pattern: URL_PATTERN, patternMessage: 'Please enter a valid URL' },
            { name: 'terms_link', label: 'Website Terms & Conditions Link', type: 'text', required: true, pattern: URL_PATTERN, patternMessage: 'Please enter a valid URL' },
            { name: 'contact_us_link', label: 'Contact Us Page Link', type: 'text', required: true, pattern: URL_PATTERN, patternMessage: 'Please enter a valid URL' },
            { name: 'privacy_link', label: 'Website Privacy Policy Link', type: 'text', required: true, pattern: URL_PATTERN, patternMessage: 'Please enter a valid URL' },
            { name: 'pricing_link', label: 'Product Pricing Page Link', type: 'text', required: true, pattern: URL_PATTERN, patternMessage: 'Please enter a valid URL' },
            { name: 'refund_link', label: 'Refund Policy Link', type: 'text', required: false, pattern: URL_PATTERN, patternMessage: 'Please enter a valid URL' },
            { name: 'cancellation_link', label: 'Cancellation Policy Link', type: 'text', required: false, pattern: URL_PATTERN, patternMessage: 'Please enter a valid URL' },
            { name: 'shipping_link', label: 'Shipping & Delivery Policy Link', type: 'text', required: false, pattern: URL_PATTERN, patternMessage: 'Please enter a valid URL' },
        ],
    },
];
