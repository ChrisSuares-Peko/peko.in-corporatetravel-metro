// Constants for the LLP Contribution step (Figma 1854:39339).
export const CONTRIBUTION_UNDERSTANDING_NOTES = [
    'Initial Contribution: Total capital contributed by all partners to the LLP',
    'Contribution Amount: Each partner’s share of the total capital invested',
    '% Profit Share: Partner’s proportional entitlement to profits and losses',
    'Total shareholding must equal 100%',
];

// LLP Agreement step (Figma 1854:39775 / 1866:41520).
export const LLP_PARTNER_RIGHTS = [
    'Access books of account and records at any reasonable time',
    'Receive their share of profits as per the agreement',
    'Participate in meetings and vote on resolutions',
    'Be indemnified by the LLP for acts done in good faith',
    'Carry on separate business with prior information to LLP',
];

export const LLP_PARTNER_DUTIES = [
    'Account to the LLP for any benefit derived without consent',
    'Indemnify the LLP for any loss caused by fraud',
    'Render true accounts and full information affecting the LLP',
    'Act in the best interests of the LLP at all times',
    'Not engage in competing business without written consent',
    'Maintain strict confidentiality of LLP information',
];

// Checked by default per the design.
export const DEFAULT_LLP_RIGHTS = [LLP_PARTNER_RIGHTS[0], LLP_PARTNER_RIGHTS[1], LLP_PARTNER_RIGHTS[3]];
export const DEFAULT_LLP_DUTIES = [
    LLP_PARTNER_DUTIES[0],
    LLP_PARTNER_DUTIES[1],
    LLP_PARTNER_DUTIES[3],
    LLP_PARTNER_DUTIES[5],
];

export const MEETING_QUORUM_OPTIONS = [
    { label: '2 partners', value: '2' },
    { label: '3 partners', value: '3' },
    { label: 'All partners', value: 'all' },
];

export const VOTING_THRESHOLD_OPTIONS = [
    'Simple Majority (>50%)',
    'Super Majority (≥75%)',
    'Unanimous',
].map(v => ({ label: v, value: v }));

export const DISPUTE_METHOD_OPTIONS = ['Arbitration (Recommended)', 'Mediation', 'Court'].map(v => ({
    label: v,
    value: v,
}));

export const LLP_AGREEMENT_CONFIRM_TEXT =
    'I understand that this is a draft LLP Agreement. The final agreement will be reviewed and finalized by legal professionals before submission to the Ministry of Corporate Affairs (MCA).';
