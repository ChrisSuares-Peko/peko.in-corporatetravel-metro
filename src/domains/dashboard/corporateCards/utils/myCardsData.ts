import { MyCard, SelectOption } from './types';

export const MY_CARDS_COPY = {
    title: 'My cards',
    subtitle: 'Cards issued to you. Freeze instantly if anything looks off.',
    requestCard: 'Request a Card',
    issuedBy: 'Issued by',
    cardBalance: 'Card Balance',
    monthlySpend: 'Monthly Spend',
    amountSpent: 'Amount Spent',
    spendLimit: 'Spend Limit',
    requestPhysical: 'Request Physical Card',
    unfreeze: 'Unfreeze',
    // Hover copy for a disabled freeze/unfreeze button — a bare `disabled` gives no reason.
    terminationRequestedTooltip:
        'This card is being terminated. It stays frozen while we process the request and cannot be reactivated.',
    terminationCompletedTooltip:
        'This card has been permanently terminated and cannot be reactivated, frozen, or unfrozen.',
    unfreezeAlreadyRequestedTooltip:
        "You've already requested an unfreeze for this card. Your admin is reviewing it.",
} as const;

export const REQUEST_UNFREEZE_COPY = {
    title: 'Request unfreeze',
    subtitle:
        'Your admin froze this card. Tell them why you need it back and they will review the request.',
    frozenReasonLabel: 'Why it was frozen',
    reasonLabel: 'Reason (optional)',
    reasonPlaceholder: 'Enter',
    submit: 'Send request',
    cancel: 'Cancel',
    success: 'Unfreeze request submitted for approval.',
} as const;

export const MY_CARDS: MyCard[] = [
    {
        key: 'physical-1294',
        kind: 'Physical Card',
        status: 'Active',
        holder: 'John Doe',
        last4: '1294',
        validFrom: '12/25',
        validTo: '12/26',
        balance: '₹ 55,000',
        used: 5000,
        limit: 60000,
        perTxnLimit: 10000,
    },
    {
        key: 'virtual-5821',
        kind: 'Virtual Card',
        status: 'Active',
        holder: 'John Doe',
        last4: '5821',
        validFrom: '12/25',
        validTo: '12/26',
        balance: '₹ 32,400',
        used: 12480,
        limit: 40000,
        perTxnLimit: 8000,
    },
    {
        key: 'virtual-7430',
        kind: 'Virtual Card',
        status: 'Active',
        holder: 'John Doe',
        last4: '7430',
        validFrom: '12/25',
        validTo: '12/26',
        balance: '₹ 18,750',
        used: 2100,
        limit: 25000,
        perTxnLimit: 5000,
    },
];

/* ------------------------------------------------------------------ *
 * "Request Physical Card" modal (opened from a virtual card)
 * ------------------------------------------------------------------ */
export const REQUEST_PHYSICAL_CARD_COPY = {
    title: 'Request Physical Card',
    cardDetails: 'Card Details',
    nameOnCard: 'Name on Card',
    nameOnCardHint: 'This name will be printed on your physical card',
    deliveryAddress: 'Delivery Address',
    fullName: 'Full Name',
    mobileNumber: 'Mobile Number',
    addressLine1: 'Address Line 1',
    addressLine2: 'Address Line 2 (Optional)',
    city: 'City',
    state: 'State',
    pinCode: 'PIN Code',
    cancel: 'Cancel',
    continue: 'Continue',
    reviewTitle: 'Review & Confirm',
    reviewSubtitle: 'Please check the details below before we process your card request.',
    estimatedDelivery: 'Estimated Delivery',
    estimatedDeliveryValue: '5–7 Business Days',
    deliveryCharges: 'Delivery Charges',
    deliveryChargesValue: 'Free',
    dispatchNote:
        'Your physical card will be dispatched within 2 business days after confirmation.',
    confirmBtn: 'Confirm & Request Card',
    successTitle: 'Card Request Submitted!',
    successMessage: 'Your physical card request has been placed successfully.',
    trackingReference: 'Tracking Reference',
    trackRequest: 'Track Request',
    goToDashboard: 'Go to Dashboard',
} as const;

/** Indian states/UTs for the delivery-address State select. */
export const STATE_OPTIONS: SelectOption[] = [
    'Andhra Pradesh',
    'Assam',
    'Bihar',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Punjab',
    'Rajasthan',
    'Tamil Nadu',
    'Telangana',
    'Uttar Pradesh',
    'West Bengal',
].map(name => ({ label: name, value: name.toLowerCase().replace(/\s+/g, '-') }));

/* ------------------------------------------------------------------ *
 * "Request a new card" modal (opened from the My-cards header)
 * ------------------------------------------------------------------ */
export const REQUEST_NEW_CARD_COPY = {
    title: 'Request a new card',
    subtitle: 'Admin will review and issue the card.',
    cardType: 'Card type',
    period: 'Period',
    cardLimit: 'Card limit (INR)',
    reason: 'Reason',
    reasonPlaceholder: 'What will this card be used for?',
    cancel: 'Cancel',
    submit: 'Submit',
    done: 'Done',
    successTitle: 'Request submitted',
    successMessage: 'Your card request has been submitted. Admin will review and issue the card.',
    detailCardLimit: 'Requested limit',
    /** Cardholders may only request virtual cards; physical cards come via the request-physical flow. */
    defaultCardType: 'Virtual Card',
} as const;

/** Validity periods offered when requesting a new card. */
export const CARD_PERIOD_OPTIONS: SelectOption[] = [
    { label: 'Monthly', value: '1m' },
];

/* ------------------------------------------------------------------ *
 * "Request a card limit increase" modal (opened from a card)
 * ------------------------------------------------------------------ */
export const LIMIT_INCREASE_COPY = {
    title: 'Request a card limit increase',
    subtitle: 'Admin will review and fund your card',
    amount: 'Additional amount request (INR)',
    amountPlaceholder: 'Enter',
    reason: 'Reason',
    reasonPlaceholder: 'Why do you need more funds?',
    cancel: 'Cancel',
    submit: 'Submit',
} as const;
