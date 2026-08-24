import { paths } from '@routes/paths';

import clockImage from '../assets/clock.png';
import digitalImage from '../assets/digital.png';
import star1S from '../assets/heroDecorations/star1S.svg';
import stars2S from '../assets/heroDecorations/stars2S.svg';
import stars3L from '../assets/heroDecorations/stars3L.svg';
import stars3S from '../assets/heroDecorations/stars3S.svg';
import thunderIcon from '../assets/heroDecorations/thunder.svg';
import todoListImage from '../assets/todolist.png';
import { EntityType } from '../types';

// The registration form's URL is the source of truth for which entity is being
// registered: entityType is a PATH param (slug-safe), while applicationId and
// step ride as query params (applicationId contains '/', so it can't be a path
// segment). This keeps the form reload-safe without persisting anything.
export const buildRegisterPath = (
    entityType: EntityType | string,
    opts: { applicationId?: string; step?: number; status?: string } = {}
): string => {
    const qs = new URLSearchParams();
    if (opts.applicationId) qs.set('applicationId', opts.applicationId);
    if (opts.step != null) qs.set('step', String(opts.step));
    if (opts.status) qs.set('status', opts.status);
    const query = qs.toString();
    const path = `${paths.businessRegistration.index}/${paths.businessRegistration.register}/${entityType}`;
    return query ? `${path}?${query}` : path;
};

export const HERO_TITLE = 'Register Your Business';
export const HERO_SUBTITLE = 'Complete your business registration online, from start to finish';
export const HERO_DESCRIPTION =
    'Please provide your proposed business name, applicant details, identity and PAN proofs, DSC of the authorized signatory, business and address proofs, and a brief description of your business activity.';
export const HERO_CTA = 'Start your business registration';

export const REQUIRED_INFO_TITLE = 'WHAT YOU WILL NEED ?';
export const REQUIRED_INFO = [
    'Proposed business name(s) (avoid names similar to existing businesses)',
    'Details of all applicants (promoters, partners or directors)',
    'Identity & PAN proofs for all applicants (PAN, Aadhaar, Passport)',
    'Digital Signature Certificate (DSC) for the authorised signatory',
    'Business address with proof (rent agreement / utility bill)',
    'Recent address proofs (bank statement, phone or utility bill)',
    'A brief description of your business activity',
];

export const EXPERT_TITLE = 'Not sure which structure to choose?';
export const EXPERT_SUBTITLE =
    "Talk to a startup expert before you decide. Proprietorship, LLP or Private Limited — we'll help you pick what's right for your business.";
export const EXPERT_CTA = 'Consult a Startup Expert';

export const CHOOSE_STRUCTURE_TITLE = 'Choose your business structure';

// Static "what's included" / notes shown on the payment summary card. Pricing
// (incl. GST, carved out of the GST-inclusive price) comes from the server.
export const PVT_PAYMENT_INCLUDES = [
    'Unlimited MCA Name Approval',
    'Incorporation Application Preparation',
    'Incorporation Application Filing',
    'Incorporation Certificate',
    'PAN, TAN, ESI & PF Number',
];

export const PVT_PAYMENT_NOTES = [
    'Government fees are collected separately by your Relationship Manager during filing.',
    'Digital Signature Certificates (DSC) for Directors and Shareholders are charged on actuals based on your specific requirements.',
    'Virtual Office charges are additional.',
    'Other optional services are charged separately based on requirement.',
];

// The catalog `about` is a "* item\r\n* item" bullet block — parse it into the
// clean inclusion labels shown under "What's included" on the payment summary.
export const parseCatalogAbout = (about?: string | null): string[] =>
    String(about ?? '')
        .split(/\r?\n/)
        .map(line => line.replace(/^[\s*•\-–]+/, '').trim())
        .filter(Boolean);

// Short labels for the "Entity Type" banner inside the form.
export const ENTITY_SHORT_LABELS: Record<EntityType, string> = {
    [EntityType.PROPRIETORSHIP]: 'Proprietorship',
    [EntityType.PARTNERSHIP]: 'Partnership Firm',
    [EntityType.OPC]: 'One Person Company (OPC)',
    [EntityType.PRIVATE_LIMITED]: 'Private Limited Company',
    [EntityType.LLP]: 'LLP',
};

// Statutory suffix appended to the proposed company name — shown as static
// grey text in the name inputs; the backend appends it in the vendor payloads.
export const ENTITY_NAME_SUFFIX: Partial<Record<EntityType, string>> = {
    [EntityType.PRIVATE_LIMITED]: 'Private Limited',
    [EntityType.OPC]: '(OPC) Private Limited',
};

// The user's name + the statutory suffix (no double-append when already typed).
export const withEntitySuffix = (name: string | undefined, entityType?: EntityType): string => {
    const trimmed = String(name ?? '').trim();
    const suffix = entityType ? ENTITY_NAME_SUFFIX[entityType] : undefined;
    if (!trimmed || !suffix) return trimmed;
    return trimmed.toLowerCase().endsWith(suffix.toLowerCase()) ? trimmed : `${trimmed} ${suffix}`;
};

// OPC's 5-step company flow. Private Limited shares the same shape but labels
// step 2 "Promoters KYC" (it has no nominee). MOA & AOA is NOT
// collected on Peko — it's generated via the MCA portal / drafted by the RM and
// delivered on incorporation approval (finalised process doc).
const COMPANY_STEPS = [
    'Basic Information',
    'Director & Nominee KYC',
    'Shareholding',
    'Documents',
    'Incorporation',
];

// Per-entity step labels for the registration form.
export const STEPS_BY_ENTITY: Partial<Record<EntityType, string[]>> = {
    [EntityType.PROPRIETORSHIP]: [
        'Basic Information',
        'Proprietor KYC',
        'Documents',
        'Registration & Filing',
    ],
    [EntityType.PARTNERSHIP]: [
        'Basic Information',
        'Proprietor KYC',
        'Partnership Deed',
        'Documents',
        'Registration & Filing',
    ],
    [EntityType.OPC]: COMPANY_STEPS,
    [EntityType.PRIVATE_LIMITED]: [
        'Basic Information',
        'Promoters KYC',
        'Shareholding',
        'Documents',
        'Incorporation',
    ],
    [EntityType.LLP]: [
        'Basic Information',
        'Designated Partners KYC',
        'Contribution',
        'LLP Agreement',
        'Incorporation',
    ],
};

// Most-registered states pinned to the top of the State of Incorporation
// select (order per product, 23-07); the rest follow alphabetically.
const PRIORITY_STATES = [
    'Maharashtra',
    'Delhi',
    'Uttar Pradesh',
    'Karnataka',
    'Tamil Nadu',
    'Telangana',
    'Andhra Pradesh',
    'Gujarat',
];

// Exact state/UT names shared by the IndiaFilings vendor (states_list.json,
// 24-07) so the value we send matches their DB. Their non-state meta rows
// ("International", "Not Applicable", "Others") are excluded — a company is
// always incorporated in an Indian state/UT.
const VENDOR_STATES = [
    'Andaman and Nicobar Islands',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chandigarh',
    'Chhattisgarh',
    'Dadra and Nagar Haveli',
    'Daman and Diu',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Ladakh',
    'Lakshadweep',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Pondicherry',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
];

const OTHER_STATES = VENDOR_STATES.filter(s => !PRIORITY_STATES.includes(s));

// value = the exact vendor state string (not a slug) so it round-trips to the
// vendor unchanged and shows the clean name in admin/summary views.
export const INDIA_STATES = [...PRIORITY_STATES, ...OTHER_STATES].map(s => ({
    label: s,
    value: s,
}));

export interface BusinessStructure {
    type: EntityType;
    title: string;
    description: string;
    timeline: string;
    price: string;
    // Visually emphasised card (red border + filled CTA) per the design.
    highlighted?: boolean;
}

// Pricing/timelines hardcoded from the design for now — these are expected to
// move to admin config / API once the vendor is finalised.
export const BUSINESS_STRUCTURES: BusinessStructure[] = [
    {
        type: EntityType.PROPRIETORSHIP,
        title: 'Proprietorship Registration',
        description: 'Single-owner business with GST / MSME registration',
        timeline: '3–5 Business days',
        price: '₹2,999',
        highlighted: true,
    },
    {
        type: EntityType.PARTNERSHIP,
        title: 'Partnership Firm Registration',
        description: 'Registered partnership deed for two or more partners',
        timeline: '5–7 Business days',
        price: '₹5,999',
    },
    {
        type: EntityType.OPC,
        title: 'One Person Company (OPC)',
        description: 'Single promoter company with limited liability',
        timeline: '10–15 Business days',
        price: '₹9,999',
    },
    {
        type: EntityType.PRIVATE_LIMITED,
        title: 'Private Limited Company Registration',
        description: 'Most popular structure for startups and funded businesses',
        timeline: '10–15 Business days',
        price: '₹12,999',
    },
    {
        type: EntityType.LLP,
        title: 'Limited Liability Partnership (LLP)',
        description: 'Partnership with limited liability protection',
        timeline: '3–5 Business days',
        price: '₹2,999',
    },
];

interface StatDecoration {
    src: string;
    className: string;
}

export interface StatCard {
    title: string;
    subtitle: string;
    img: string;
    decorations: StatDecoration[];
}

// Decoration positions mirror the Company Incorporation hero (Figma 1760:21988).
// SVGs keep their natural sizes so they render at design scale regardless of card width.
export const STATS: StatCard[] = [
    {
        title: '15-25 min',
        subtitle: 'Time to complete',
        img: clockImage,
        decorations: [
            { src: stars2S, className: 'absolute top-[55%] right-[18%]' },
            { src: star1S, className: 'absolute top-[50%] left-[22%]' },
            { src: thunderIcon, className: 'absolute top-[74%] left-[20%]' },
        ],
    },
    {
        title: '7 steps',
        subtitle: 'Simple process',
        img: todoListImage,
        decorations: [
            { src: stars2S, className: 'absolute top-[58%] right-[10%]' },
            { src: stars3S, className: 'absolute top-[50%] left-[12%]' },
            { src: stars3S, className: 'absolute top-[74%] left-[20%]' },
        ],
    },
    {
        title: '100% Digital',
        subtitle: 'No paperwork',
        img: digitalImage,
        decorations: [
            { src: stars3S, className: 'absolute top-[58%] right-[10%]' },
            { src: stars3L, className: 'absolute top-[50%] left-[12%]' },
            { src: stars3S, className: 'absolute top-[74%] left-[20%]' },
        ],
    },
];
