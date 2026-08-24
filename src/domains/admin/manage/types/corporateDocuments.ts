// Matches corporateCard controllers/corporate/corporateDocuments.js documentNames exactly.
export type CorporateDocumentKey =
    | 'Corporate_Agreement'
    | 'MOA'
    | 'AOA'
    | 'GST_Certificate'
    | 'Signing_Authority_Pan_Card'
    | 'Signing_Authority_Aadhaar_Card'
    | 'Company_Pan'
    | 'Certificate_Of_Incorporation';

export interface CorporateDocumentEntry {
    document: string | null;
    expiryDate: string | null;
    status: string | null;
}

export type CorporateDocumentsMap = Partial<Record<CorporateDocumentKey, CorporateDocumentEntry>>;
