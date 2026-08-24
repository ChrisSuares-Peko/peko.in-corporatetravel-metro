export type OndcIssueCategory = 'ITEM' | 'FULFILLMENT' | 'ORDER' | 'AGENT';

/** Internal issue-status vocabulary — the backend maps ONDC's raw IGM
 *  respondent/complainant actions onto these (see controllers/webhook/ondc.js
 *  mapRespondentAction), so the frontend only ever deals with this set. */
export type OndcIssueStatus =
    | 'OPEN'
    | 'ACKNOWLEDGED'
    | 'INFO_REQUESTED'
    | 'RESPONSE_RECEIVED'
    | 'RESOLVED'
    | 'REJECTED'
    | 'ESCALATED'
    | 'CLOSED';

/** One event in an issue's thread. Returned newest-first by the API. */
export interface OndcIssueEvent {
    eventType: OndcIssueStatus | string;
    actorType: 'COMPLAINANT' | 'RESPONDENT' | 'SYSTEM';
    actorName: string;
    message: string;
    /** public image URLs (Firebase) attached to this event — [] when none */
    images?: string[];
    occurredAt: string;
}

/** One issue raised on a confirmed order (Figma 2807-25222). */
export interface OndcIssue {
    id: number;
    /** Peko-minted display code, e.g. "ISS-1005" — not the real ONDC network issue id */
    displayId: string;
    category: OndcIssueCategory | string;
    subCategory: string;
    status: OndcIssueStatus | string;
    /** server-computed one-line summary off the newest event — never fabricated client-side */
    latestUpdateSummary: string;
    /** newest first */
    events: OndcIssueEvent[];
}
