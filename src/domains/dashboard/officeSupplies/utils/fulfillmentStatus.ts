import { OndcOrderFulfillment } from '../types/ondcOrderHistory';

/** The fulfillment that drives the status stepper and tracking card — the
 *  shipment ("Delivery") leg, not a Return/Cancel/RTO leg. Assumes one Delivery
 *  fulfillment per confirmed order row (true for today's single-seller-group
 *  checkout); a split multi-shipment order is a known follow-up, not solved
 *  here. */
export const getDeliveryFulfillment = (fulfillments: OndcOrderFulfillment[] | null | undefined) =>
    fulfillments?.find(f => f.type === 'Delivery');

/**
 * Maps the Delivery fulfillment's real ONDC state code
 * (fulfillment.state.descriptor.code) to the 0-based index of the Order
 * Details page's 5 fixed status steps it satisfies. `Cancelled` is handled
 * separately as a terminal state rather than slotted into the linear
 * progression. Unrecognized/future codes fall back to "no further progress
 * known" (index 0) instead of guessing.
 */
export const FULFILLMENT_STATE_STEP_INDEX: Record<string, number> = {
    Pending: 1,
    Packed: 2,
    'Agent-assigned': 2,
    'Out-for-pickup': 2,
    'Pickup-failed': 2,
    'Order-picked-up': 3,
    'In-transit': 3,
    'At-destination-hub': 3,
    'Out-for-delivery': 3,
    'Delivery-failed': 3,
    'Order-delivered': 4,
};

/** Friendly label for a fulfillment state code — shared by the Order Details
 *  page's tracking card and the Order History list's Status column. Unknown
 *  codes are humanized rather than hidden. */
const FULFILLMENT_STATE_LABELS: Record<string, string> = {
    Pending: 'Order confirmed',
    Packed: 'Packed by seller',
    'Agent-assigned': 'Delivery agent assigned',
    'Out-for-pickup': 'Out for pickup',
    'Pickup-failed': 'Pickup attempt failed',
    'Order-picked-up': 'Picked up',
    'In-transit': 'In transit',
    'At-destination-hub': 'Reached destination hub',
    'Out-for-delivery': 'Out for delivery',
    'Delivery-failed': 'Delivery attempt failed',
    'Order-delivered': 'Delivered',
    Cancelled: 'Cancelled',
};

export const formatFulfillmentStateLabel = (code?: string) =>
    code ? (FULFILLMENT_STATE_LABELS[code] ?? code.replace(/-/g, ' ')) : 'Not available yet';

/** Tag colors per status step, reusing the exact palette OndcStatusTag already
 *  uses for the order-level states so both tags read as one system. */
const FULFILLMENT_STATE_STEP_STYLE: Record<number, { bg: string; color: string }> = {
    0: { bg: '#f5f5f5', color: '#595959' },
    1: { bg: '#f5f6ff', color: '#3b48d5' },
    2: { bg: '#fffbeb', color: '#f59e0b' },
    3: { bg: '#f5f3ff', color: '#7c3aed' },
    4: { bg: '#ecfdf3', color: '#027a48' },
};

const CANCELLED_STYLE = { bg: '#fef2f2', color: '#ef4444' };

/** Tag color for a fulfillment state code, bucketed by its status step. */
export const getFulfillmentStatusStyle = (code?: string): { bg: string; color: string } => {
    if (code === 'Cancelled') return CANCELLED_STYLE;
    const step = code ? (FULFILLMENT_STATE_STEP_INDEX[code] ?? 0) : 0;
    return FULFILLMENT_STATE_STEP_STYLE[step];
};
