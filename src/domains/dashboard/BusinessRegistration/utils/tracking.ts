// Tracking page data (Figma 1825:22936). All values derive from the live
// application status API — direct visits without an application redirect to
// My Applications instead of rendering placeholders.

import { ApplicationStatus } from '../api';

export type TrackingStatus = 'completed' | 'processing' | 'pending';

// The vendor's next_followup can lapse (a follow-up date that has already
// passed). Only surface it when it's today or later — a past "next update" is
// misleading. Accepts DD-MM-YYYY or YYYY-MM-DD.
export const futureFollowup = (value?: string | null): string | undefined => {
    if (!value) return undefined;
    const parts = String(value).split(/[-/]/);
    if (parts.length !== 3) return undefined;
    const [y, m, d] = parts[0].length === 4 ? parts : [parts[2], parts[1], parts[0]];
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (Number.isNaN(date.getTime())) return undefined;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today ? value : undefined;
};

export interface TrackingStep {
    title: string;
    description: string;
    date?: string;
    status: TrackingStatus;
    note?: string;
}

// Product copy (static by design — confirm with product if it should vary).
export const TRACKING_ESTIMATED = '7-10 business days';

export const formatTrackingDate = (value?: string) =>
    value
        ? new Date(value).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';

// Derive the timeline from the live status: our persistence + the vendor
// create-chain (vendorStatus/vendorStages) + the vendor engagement.
export const buildTrackingSteps = (status: ApplicationStatus): TrackingStep[] => {
    const submittedOn = formatTrackingDate(status.submittedAt ?? status.createdAt);
    const { vendorStatus, engagement, srn } = status;

    let filingStatus: TrackingStatus = 'pending';
    let filingNote: string | undefined;
    if (vendorStatus === 'SENT') filingStatus = 'completed';
    else if (vendorStatus === 'SENDING') {
        filingStatus = 'processing';
        filingNote = 'Sending your application to our filing partner…';
    } else if (vendorStatus === 'FAILED') {
        filingStatus = 'processing';
        filingNote = 'We hit a snag while filing — our team is on it.';
    }

    const engagementStarted = Boolean(engagement);

    return [
        {
            title: 'Application Submitted',
            description: 'Your application and documents were received.',
            date: submittedOn,
            status: 'completed',
        },
        {
            title: 'Filed with our filing partner',
            description: 'Application registered with IndiaFilings for processing.',
            status: filingStatus,
            note: filingNote,
        },
        {
            title: 'Processing started',
            description: (() => {
                // Prefer the RM's name; fall back to their role. 'Unassigned' means
                // the vendor hasn't allocated one yet.
                const rm = engagement?.rm && engagement.rm !== 'Unassigned' ? engagement.rm : engagement?.rm_role;
                const followup = futureFollowup(engagement?.next_followup);
                return rm
                    ? `Handled by ${rm}${followup ? ` • next update ${followup}` : ''}`
                    : 'A relationship manager takes your application through MCA filing.';
            })(),
            date: engagement?.date_started,
            // The engagement is created at PAYMENT time, before the final
            // submit — never show this step ahead of the filing step.
            status: (() => {
                if (!engagementStarted) return 'pending';
                return filingStatus === 'completed' ? 'completed' : 'processing';
            })(),
            note: (() => {
                const parts = [];
                if (engagement?.engagement_status) parts.push(`Status: ${engagement.engagement_status}`);
                if (engagement?.last_notes && engagement.last_notes !== 'Not Updated') {
                    parts.push(engagement.last_notes);
                }
                return parts.length ? parts.join(' • ') : undefined;
            })(),
        },
        {
            title: 'Certificate of Incorporation',
            description: 'COI, PAN and TAN issued.',
            status: srn ? 'completed' : 'pending',
        },
    ];
};
