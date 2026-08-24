// Document field definitions for the Documents step (Figma 1819:22349).
// Person KYC fields are driven by the vendor's per-ROLE kyc-status checklist
// (mandatory=1 only) — fetched once per role and stored here so the render,
// progress count and Yup validation all read the same list.

import { ChecklistDocument, ServiceDocument } from '../api';
import { EntityType } from '../types';

export interface DocField {
    name: string;
    label: string;
    required?: boolean;
}

// Known checklist (sandbox kyc-status 13-07) — used until the live fetch lands.
const DEFAULT_CHECKLIST: ChecklistDocument[] = [
    { document_type: 'PAN', mandatory: 1, document_Nid: 1 },
    { document_type: 'Passport', mandatory: 1, document_Nid: 3 },
    { document_type: 'Passport Photo', mandatory: 1, document_Nid: 7 },
];

const checklistByRole: Record<string, ChecklistDocument[]> = {};

export const setRoleChecklist = (role: string, documents: ChecklistDocument[]) => {
    if (documents.length) checklistByRole[role] = documents;
};

// Stable formik field key per vendor document type; unknown types get a slug so
// new vendor requirements render without a code change.
const DOC_FIELD_KEYS: Record<string, string> = {
    PAN: 'panCard',
    Passport: 'passport',
    'Passport Photo': 'photo',
};

const DOC_LABELS: Record<string, string> = { PAN: 'PAN Card' };

const fieldKeyFor = (type: string) =>
    DOC_FIELD_KEYS[type] ??
    type
        .replace(/[^a-zA-Z ]/g, '')
        .split(' ')
        .filter(Boolean)
        .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
        .join('');

// PAN and Passport are interchangeable identity proofs: Indian nationals give
// PAN, foreign nationals give Passport. Everything else applies to everyone.
const appliesTo = (type: string, nationality?: string) => {
    if (type === 'PAN') return nationality !== 'foreign';
    if (type === 'Passport') return nationality === 'foreign';
    return true;
};

const mandatoryDocs = (role = 'director') =>
    (checklistByRole[role] ?? DEFAULT_CHECKLIST).filter(d => d.mandatory === 1);

// Vendor rule (Summary of Changes): a director with a DIN doesn't need the bank
// statement. The vendor's checklist API doesn't drop it, so we filter here.
const isBankStatement = (type: string) => /bank\s*stat/i.test(type);

// Required keys/labels for one person — includes the photo (its widget renders
// separately, but validation and progress treat it like any other document).
export const personRequiredDocs = (nationality?: string, role = 'director', hasDin = false) =>
    mandatoryDocs(role)
        .filter(d => appliesTo(d.document_type, nationality))
        .filter(d => !(hasDin && isBankStatement(d.document_type)))
        .map(d => ({
            key: fieldKeyFor(d.document_type),
            label: DOC_LABELS[d.document_type] ?? d.document_type,
        }));

// Grid upload fields for one person (photo excluded — it has its own widget).
export const personDocFields = (base: string, nationality?: string, hasDin = false): DocField[] =>
    personRequiredDocs(nationality, 'director', hasDin)
        .filter(d => d.key !== 'photo')
        .map(d => ({ name: `${base}.${d.key}`, label: d.label, required: true }));

// Business-level (service) documents — dynamic per entity from the vendor's
// /v4/docs/Service list (smartservice=1 && status=1 only). Fields live under
// documents.service.*; each keeps its vendor Nid (ledgers_document_id) for the
// upload. Registered-office trio serves as fallback until the live list lands.
interface ServiceDocField {
    key: string;
    label: string;
    nid?: number;
}

const FALLBACK_SERVICE_DOCS: ServiceDocField[] = [
    { key: 'nocFromOwner', label: 'NOC from Owner' },
    { key: 'utilityBill', label: 'Utility Bill (Electricity/Water/Gas — ≤2 months old)' },
    { key: 'rentLeaseDeed', label: 'Rent Deed or Lease Deed' },
];

let serviceDocs: ServiceDocField[] = FALLBACK_SERVICE_DOCS;

export const setServiceDocuments = (documents: ServiceDocument[]) => {
    if (documents.length) {
        serviceDocs = documents.map(d => ({
            key: fieldKeyFor(d.doc_name),
            label: d.doc_name,
            nid: d.ledgers_document_id,
        }));
    }
};

// MOA/AOA entries (e.g. "MOA Subscriber Sheet", Nid 54/37) are excluded from
// the rendered/required fields — the MOA & AOA step supplies those documents
// (generated draft or custom upload); their Nids stay available for the upload
// mapping via serviceDocNidByKeyword.
// OPTIONAL for now (21-07): the vendor's smartservice=1 list is their full
// engagement document master, incl. forms THEY generate during filing (INC
// 32/33/34, declarations, Incorporation Certificate) — a customer cannot
// upload those upfront. The customer-supplied subset is pending with the
// vendor; whatever the user does have can still be uploaded.
// The vendor's service-doc list carries NO mandatory flag (unlike the KYC
// checklist), so we enforce the registered-office address proof (the Utility
// Bill) ourselves — the others stay optional. Matched by name.
export const MANDATORY_SERVICE_DOC_RE = /utility bill/i;

export const serviceDocFields = (): DocField[] =>
    serviceDocs
        .filter(d => !/\b(moa|aoa)\b/i.test(d.label))
        .map(d => ({
            name: `documents.service.${d.key}`,
            label: d.label,
            required: MANDATORY_SERVICE_DOC_RE.test(d.label),
        }));

// Vendor Nid for a service-doc field path — undefined for person docs.
export const docNidForPath = (fieldPath: string): number | undefined =>
    serviceDocs.find(d => `documents.service.${d.key}` === fieldPath)?.nid;

// Vendor Nid by document-name keyword (e.g. 'moa', 'aoa') — for business docs
// collected outside documents.service.* like the custom MOA/AOA uploads.
export const serviceDocNidByKeyword = (keyword: string): number | undefined =>
    serviceDocs.find(d => d.label.toLowerCase().includes(keyword.toLowerCase()))?.nid;

export const DIRECTOR_PHOTO = 'documents.director.photo';

export interface DocPerson {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    pan?: string;
    nationality?: string;
    din?: string;
}

// Entities whose KYC people are a FieldArray collect documents per person under
// documents.<field>.<index>.* — everyone else keeps the single director block.
export const getDocPeopleGroup = (values: Record<string, unknown>) => {
    if (values.entityType === EntityType.PRIVATE_LIMITED) {
        return { field: 'directors', label: 'Promoter', people: (values.directors as DocPerson[]) || [] };
    }
    if (values.entityType === EntityType.PARTNERSHIP) {
        return { field: 'partners', label: 'Partner', people: (values.partners as DocPerson[]) || [] };
    }
    return null;
};

export const personDisplayName = (p: DocPerson | undefined) =>
    p?.fullName || `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim();

// Every document field for the current form values — drives the upload-progress
// count and the final submit's document collection.
export const getAllDocNames = (values: Record<string, unknown>): string[] => {
    const group = getDocPeopleGroup(values);
    if (!group) {
        const director = values.director as DocPerson | undefined;
        return [
            ...serviceDocFields().map(d => d.name),
            ...personRequiredDocs(director?.nationality, 'director', Boolean(director?.din)).map(
                d => `documents.director.${d.key}`
            ),
        ];
    }
    return [
        ...serviceDocFields().map(d => d.name),
        ...group.people.flatMap((p, i) =>
            personRequiredDocs(p?.nationality, 'director', Boolean(p?.din)).map(
                d => `documents.${group.field}.${i}.${d.key}`
            )
        ),
    ];
};

export const UPLOAD_ACCEPT = '.pdf,.jpg,.jpeg,.png';
