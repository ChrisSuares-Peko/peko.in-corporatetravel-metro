import { useEffect, useState } from 'react';

import { ArrowRightOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Flex, Image, Row, Skeleton, Steps, Table, Typography, Input } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';

import CancelOrderModal from '../components/CancelOrderModal';
import IssuePhotoPicker from '../components/IssuePhotoPicker';
import RaiseIssueModal from '../components/modals/RaiseIssueModal';
import OndcStatusTag from '../components/OrderHistory/OndcStatusTag';
import { useOndcOrderDetailApi } from '../hooks/useOndcOrderDetailApi';
import { OndcOrderDetailItem, OndcOrderFulfillment, OndcOrderTracking } from '../types/ondcOrderHistory';
import {
    FULFILLMENT_STATE_STEP_INDEX,
    formatFulfillmentStateLabel,
    getDeliveryFulfillment,
} from '../utils/fulfillmentStatus';
import { IssuePhoto } from '../utils/issuePhoto';
import { mapCategoryToDisplay } from '../utils/issueTaxonomy';
import { formatInr } from '../utils/priceInr';

const { Text } = Typography;
const { TextArea } = Input;

const ORDER_STATUS_STEPS = ['Order created', 'Order confirmed', 'In progress', 'Shipped', 'Delivered'];

const buildStatusSteps = (isCancelled: boolean, delivery: OndcOrderFulfillment | undefined) => {
    const stateCode = delivery?.state?.descriptor?.code;

    if (isCancelled) {
        const lastProgressIndex = stateCode && stateCode !== 'Cancelled'
            ? (FULFILLMENT_STATE_STEP_INDEX[stateCode] ?? 0)
            : 0;
        return {
            items: [
                ...ORDER_STATUS_STEPS.slice(0, lastProgressIndex + 1).map(title => ({
                    title,
                    status: 'finish' as const,
                })),
                { title: 'Order cancelled', status: 'error' as const },
            ],
        };
    }

    const currentIndex = stateCode ? (FULFILLMENT_STATE_STEP_INDEX[stateCode] ?? 0) : 0;

    return {
        items: ORDER_STATUS_STEPS.map((title, index) => ({
            title,
            status: (index <= currentIndex ? 'finish' : 'wait') as 'finish' | 'wait',
        })),
    };
};

const formatTimestamp = (iso: string) => dayjs(iso).format('MMMM D, YYYY [at] hh:mm A');

type TrackingTimelineEntry = { title: string; description: string; status: 'finish' | 'error' };

const buildTrackingTimeline = (
    isCancelled: boolean,
    delivery: OndcOrderFulfillment | undefined,
    tracking: OndcOrderTracking
): TrackingTimelineEntry[] => {
    const stateCode = delivery?.state?.descriptor?.code;
    const entries: TrackingTimelineEntry[] = [];

    if (delivery?.start?.time?.timestamp) {
        entries.push({
            title: 'Picked up from seller',
            description: formatTimestamp(delivery.start.time.timestamp),
            status: 'finish',
        });
    }

    const deliveredAt = stateCode === 'Order-delivered' ? delivery?.end?.time?.timestamp : undefined;
    if (deliveredAt) {
        entries.push({ title: 'Delivered', description: formatTimestamp(deliveredAt), status: 'finish' });
    } else if (stateCode && stateCode !== 'Cancelled') {
        entries.push({
            title: formatFulfillmentStateLabel(stateCode),
            description: tracking.updatedAt ? `Updated ${formatTimestamp(tracking.updatedAt)}` : 'Latest known status',
            status: 'finish',
        });
    }

    if (isCancelled) {
        entries.push({
            title: 'Order cancelled',
            description: 'No further shipment updates apply to this order.',
            status: 'error',
        });
    }

    return entries;
};

// Evidence thumbnails on a thread event (public URLs) — click to preview.
const EventThumbnails = ({ images }: { images?: string[] }) => {
    if (!images || images.length === 0) return null;
    return (
        <Flex gap={8} wrap="wrap" className="mt-2" align="center">
            {images.map((url, i) => {
                const isPdf = url.toLowerCase().split('?')[0].endsWith('.pdf');
                if (isPdf) {
                    return (
                        <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-[#e4e7ec] bg-[#f9fafb] px-3 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#f3f4f6] transition-colors"
                        >
                            <FilePdfOutlined className="text-red-500 text-[16px]" />
                            <span>View Document</span>
                        </a>
                    );
                }
                return (
                    <Image
                        key={i}
                        src={url}
                        width={64}
                        height={64}
                        className="!rounded-lg !object-cover"
                    />
                );
            })}
        </Flex>
    );
};

// Reply block for the seller's "Information requested" — matches Figma
// (node 2807-25222): a labelled "Your reply" textarea inside a gray panel, an
// optional "Photos" picker, and two actions — "I can't prove this" (a reply
// noting no evidence is available; does NOT close the issue) and "Send
// response" (a substantive reply, optionally with photos the backend hosts +
// forwards to the seller).
const IssueReplyBox = ({
    onSend,
}: {
    onSend: (text: string, cannotProvideProof: boolean, images: IssuePhoto[]) => Promise<void>;
}) => {
    const [replyText, setReplyText] = useState('');
    const [photos, setPhotos] = useState<IssuePhoto[]>([]);
    const [submitting, setSubmitting] = useState<'reply' | 'cant' | null>(null);

    const handleSend = async () => {
        if (!replyText.trim()) return;
        setSubmitting('reply');
        await onSend(replyText, false, photos);
        setReplyText('');
        setPhotos([]);
        setSubmitting(null);
    };

    const handleCantProve = async () => {
        setSubmitting('cant');
        await onSend('', true, []);
        setSubmitting(null);
    };

    return (
        <Flex vertical gap={12} className="w-full rounded-2xl bg-[#f7f7f7] p-4">
            <Flex vertical gap={8}>
                <Text className="text-[14px] font-medium text-black">Your reply</Text>
                <TextArea
                    rows={3}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply to seller"
                    disabled={submitting !== null}
                    className="!rounded-xl !bg-white"
                />
            </Flex>
            <IssuePhotoPicker value={photos} onChange={setPhotos} disabled={submitting !== null} />
            <Flex justify="end" gap={12}>
                <Button
                    type="text"
                    disabled={submitting !== null}
                    loading={submitting === 'cant'}
                    onClick={handleCantProve}
                    className="!h-10 !rounded-lg !px-4 !font-medium !text-lightRed"
                >
                    I can&apos;t prove this
                </Button>
                <Button
                    type="primary"
                    disabled={!replyText.trim() || submitting !== null}
                    loading={submitting === 'reply'}
                    onClick={handleSend}
                    danger
                >
                    Send response
                </Button>
            </Flex>
        </Flex>
    );
};

const OrderedProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {
        order,
        issues,
        isLoading,
        notFound,
        cancelOrder,
        raiseIssue,
        replyToIssue,
    } = useOndcOrderDetailApi(id!);

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [raiseModalOpen, setRaiseModalOpen] = useState(false);

    useEffect(() => {
        if (notFound) {
            navigate(`${paths.dashboard.officeSupplies}/${paths.officeSupplies.orderHistory}`, {
                replace: true,
            });
        }
    }, [notFound, navigate]);

    if (isLoading) {
        return (
            <Flex vertical gap={50}>
                <Skeleton avatar paragraph={{ rows: 4 }} />
                <Skeleton paragraph={{ rows: 10 }} />
            </Flex>
        );
    }
    if (!order) return null;

    const { quote } = order;
    const itemsTotal = quote
        ? quote.total - (quote.deliveryCharge || 0) - quote.otherCharges.reduce((s, c) => s + c.amount, 0)
        : order.totalAmount;

    const handleCancelOrder = () => {
        setCancelModalOpen(true);
    };

    const columns = [
        { title: 'Products', dataIndex: 'productName', key: 'productName' },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => formatInr(price),
        },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
        {
            title: 'Sub-Total',
            key: 'subTotal',
            render: (_: unknown, record: OndcOrderDetailItem) =>
                formatInr((record.price || 0) * (record.quantity || 1)),
        },
    ];

    const { billing } = order;
    const address = billing?.address;

    const deliveryFulfillment = getDeliveryFulfillment(order.fulfillments);
    const isCancelled = order.orderState === 'Cancelled' || deliveryFulfillment?.state?.descriptor?.code === 'Cancelled';
    const statusSteps = buildStatusSteps(isCancelled, deliveryFulfillment);
    const trackingTimeline = order.tracking ? buildTrackingTimeline(isCancelled, deliveryFulfillment, order.tracking) : [];

    const canCancel =
        order.orderState !== 'Cancelled' &&
        order.orderState !== 'Completed' &&
        order.items.length > 0 &&
        order.items.every(i => i.cancellable !== false);

    const cancelBlockedReason = () => {
        if (order.orderState === 'Cancelled') return 'This order has been cancelled.';
        if (order.orderState === 'Completed') return 'This order has already been delivered.';
        return "This order can't be cancelled per the seller's policy.";
    };

    const noTrackingMessage = isCancelled
        ? {
              title: 'This order was cancelled',
              description: 'No shipment tracking applies to this order.',
          }
        : {
              title: 'Tracking not available for this order yet',
              description:
                  "The seller hasn't shared live tracking for this shipment yet. Check back later — we'll show courier and shipment updates here as soon as they're available.",
          };

    return (
        <Flex vertical gap={32}>
            {/* Header */}
            <Flex vertical gap={8}>
                <Flex align="center" gap={12} wrap="wrap">
                    <Text className="text-[25px] font-medium text-black">
                        Order {order.orderId || order.transactionId}
                    </Text>
                    <OndcStatusTag
                        status={order.orderState || 'Created'}
                        deliveryStatusCode={deliveryFulfillment?.state?.descriptor?.code}
                    />
                </Flex>
                <Text className="text-[17px] text-[#868686]">
                    Sold by {order.vendorName} · Placed{' '}
                    {dayjs(order.createdAt).format('MMMM D, YYYY [at] hh:mm A')}
                </Text>
            </Flex>

            {/* Products Table */}
            <Card className="!rounded-3xl">
                <Table
                    dataSource={order.items.map((item, index) => ({ ...item, key: index }))}
                    columns={columns}
                    pagination={false}
                />
            </Card>

            {/* Address, Payment, Summary Card Block */}
            <Row gutter={24}>
                <Col xs={24} md={8}>
                    <Card className="h-full !rounded-3xl !border-t-4 !border-lightRed">
                        <Flex vertical gap={16}>
                            <Text className="text-[19px] font-semibold text-[#1e293b]">
                                Delivery address
                            </Text>
                            <Text className="text-[16px] text-[#6a6a6a]">
                                {billing?.name}
                                <br />
                                {[address?.building, address?.locality].filter(Boolean).join(', ')}
                                <br />
                                {[address?.city, address?.state, address?.area_code]
                                    .filter(Boolean)
                                    .join(', ')}
                                <br />
                                {billing?.phone}
                            </Text>
                            <Text className="text-[13px] italic text-[#868686] mt-auto pt-2">
                                Invoice will be sent to your registered email ID
                            </Text>
                        </Flex>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="h-full !rounded-3xl !border-t-4 !border-lightRed">
                        <Flex vertical gap={16}>
                            <Text className="text-[19px] font-semibold text-[#1e293b]">Payment</Text>
                            <Flex vertical gap={15}>
                                <Flex justify="space-between">
                                    <Text className="text-[#4a5565]">Amount paid</Text>
                                    <Text className="font-medium text-[#252430]">
                                        {formatInr(order.amountPaid)}
                                    </Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text className="text-[#4a5565]">Transaction ID</Text>
                                    <Text className="font-medium text-[#252430]">
                                        {order.paymentRef || order.transactionId}
                                    </Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text className="text-[#4a5565]">Payment mode</Text>
                                    <Text className="font-medium text-[#252430]">Payment Gateway</Text>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="h-full !rounded-3xl !border-t-4 !border-lightRed">
                        <Flex vertical gap={16}>
                            <Text className="text-[19px] font-semibold text-[#1e293b]">Summary</Text>
                            <Flex vertical gap={15}>
                                <Flex justify="space-between">
                                    <Text className="text-[#4a5565]">Items total</Text>
                                    <Text className="text-[#252430]">{formatInr(itemsTotal)}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text className="text-[#4a5565]">Delivery</Text>
                                    <Text className="text-[#1e293b]">
                                        {formatInr(quote?.deliveryCharge ?? 0)}
                                    </Text>
                                </Flex>
                                {order.platformFee > 0 && (
                                    <Flex justify="space-between">
                                        <Text className="text-[#4a5565]">
                                            Platform fee (inclusive of GST)
                                        </Text>
                                        <Text className="text-[#1e293b]">
                                            {formatInr(order.platformFee)}
                                        </Text>
                                    </Flex>
                                )}
                                <Divider className="!my-1" />
                                <Flex justify="space-between">
                                    <Text className="font-semibold text-[#101828]">Total</Text>
                                    <Text className="font-medium text-[#252430]">
                                        {formatInr(order.amountPaid)}
                                    </Text>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Card>
                </Col>
            </Row>

            {/* Action buttons under Summary block */}
            <Flex justify="end" align="center" wrap="wrap" gap={16} className="w-full">
                <Button
                    onClick={() => setRaiseModalOpen(true)}
                    className="!flex !h-10 !items-center !gap-2 !rounded-xl !border-lightRed !text-[15px] !font-medium !text-lightRed"
                >
                    Raise an issue
                </Button>
                {canCancel ? (
                    <Button
                        onClick={handleCancelOrder}
                        className="!flex !h-10 !items-center !gap-2 !rounded-xl !border-lightRed !text-[15px] !font-medium !text-lightRed"
                    >
                        Cancel order
                    </Button>
                ) : (
                    <Button
                        disabled
                        className="!flex !h-10 !items-center !gap-2 !rounded-xl !border-gray-300 !bg-gray-50 !text-[15px] !font-medium !text-gray-400"
                        title={cancelBlockedReason()}
                    >
                        Cancel order
                    </Button>
                )}
            </Flex>

            {/* Progress Status Stepper */}
            <Card className="!rounded-3xl !bg-[#f9fafb]">
                <Steps items={statusSteps.items} />
            </Card>

            {/* Issues on this order Section */}
            {issues.length > 0 && (
                <Flex vertical gap={16}>
                    <Text className="text-[22px] font-medium text-[#101828]">
                        Issues on this order
                    </Text>
                    <Flex vertical gap={16}>
                        {issues.map(issue => {
                            const isResolved = issue.status === 'CLOSED' || issue.status === 'RESOLVED';
                            return (
                                <Card
                                    key={issue.id}
                                    className="!rounded-3xl border border-[#E4E7EC] shadow-sm"
                                    styles={{ body: { padding: 24 } }}
                                >
                                    <Flex vertical gap={16}>
                                        {/* Issue Header */}
                                        <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
                                            <Flex align="center" gap={8} wrap="wrap" className="text-sm text-[#475156]">
                                                <span className="font-semibold text-[#101828]">
                                                    {issue.displayId}
                                                </span>
                                                <span className="text-gray-300">|</span>
                                                <span>Category: {mapCategoryToDisplay(issue.category)}</span>
                                                <span className="text-gray-300">|</span>
                                                <span>Sub-category: {issue.subCategory}</span>
                                            </Flex>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    isResolved
                                                        ? 'bg-[#E7FFEC] text-[#008000]'
                                                        : 'bg-[#FFEBC9] text-[#D97706]'
                                                }`}
                                            >
                                                {isResolved ? 'Resolved' : 'In-Progress'}
                                            </span>
                                        </Flex>

                                        <Divider className="!my-0" />

                                        {/* Events Timeline */}
                                        <Flex vertical gap={12}>
                                            {[...issue.events].reverse().map((event, idx) => {
                                                const isFirst = idx === 0;
                                                if (event.actorType === 'RESPONDENT') {
                                                    return (
                                                        <div key={idx} className="rounded-xl bg-[#F7F7F7] p-4 border border-[#E4E7EC]">
                                                            <Text className="text-[15px] font-medium text-black">
                                                                Seller response:
                                                            </Text>{' '}
                                                            <Text className="text-[15px] text-[#475156]">
                                                                {event.message}
                                                            </Text>
                                                            <div className="text-[12px] text-[#868686] mt-1">
                                                                {dayjs(event.occurredAt).format('MMMM D, YYYY [at] hh:mm A')}
                                                            </div>
                                                            <EventThumbnails images={event.images} />
                                                        </div>
                                                    );
                                                }
                                                if (event.actorType === 'COMPLAINANT') {
                                                    if (isFirst) {
                                                        return (
                                                            <div key={idx}>
                                                                <Text className="text-[16px] text-[#101828]">
                                                                    {event.message}
                                                                </Text>
                                                                <div className="text-[12px] text-[#868686] mt-1">
                                                                    {dayjs(event.occurredAt).format('MMMM D, YYYY [at] hh:mm A')}
                                                                </div>
                                                                <EventThumbnails images={event.images} />
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <div key={idx} className="rounded-xl bg-[#FFF7F8] p-4 border border-[#FEE2E2]">
                                                            <Text className="text-[15px] font-medium text-[#E01A1A]">
                                                                Your reply:
                                                            </Text>{' '}
                                                            <Text className="text-[15px] text-[#475156]">
                                                                {event.message}
                                                            </Text>
                                                            <div className="text-[12px] text-[#868686] mt-1">
                                                                {dayjs(event.occurredAt).format('MMMM D, YYYY [at] hh:mm A')}
                                                            </div>
                                                            <EventThumbnails images={event.images} />
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div key={idx} className="flex justify-center my-1">
                                                        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                                                            {event.message} ({dayjs(event.occurredAt).format('hh:mm A')})
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </Flex>

                                        {/* Reply box — seller has asked for a response (matches Figma) */}
                                        {!isResolved && (
                                            <IssueReplyBox
                                                onSend={async (replyText, cannotProvideProof, images) => {
                                                    const ok = await replyToIssue(
                                                        issue.id,
                                                        replyText,
                                                        cannotProvideProof,
                                                        images
                                                    );
                                                    if (ok) {
                                                        dispatch(
                                                            showToast({
                                                                description:
                                                                    'Your response has been sent to the seller.',
                                                                variant: 'success',
                                                            })
                                                        );
                                                    } else {
                                                        dispatch(
                                                            showToast({
                                                                description:
                                                                    'Failed to send your response. Please try again.',
                                                                variant: 'error',
                                                            })
                                                        );
                                                    }
                                                }}
                                            />
                                        )}
                                    </Flex>
                                </Card>
                            );
                        })}
                    </Flex>
                </Flex>
            )}

            {/* Track your shipment */}
            <Flex vertical gap={16}>
                <Text className="text-[22px] font-medium text-[#141414]">Track your shipment</Text>
                <Card className="!rounded-3xl">
                    <Flex vertical gap={24}>
                        {order.expectedDeliveryDate && !isCancelled && (
                            <Text className="text-[16px]">
                                <Text className="text-[#6a6a6a]">Expected delivery: </Text>
                                <Text className="font-semibold text-[#1e293b]">
                                    {dayjs(order.expectedDeliveryDate).format('MMMM D, YYYY')}
                                </Text>
                            </Text>
                        )}
                        {order.tracking ? (
                            <>
                                <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
                                    <Flex gap={24} wrap="wrap">
                                        {order.tracking.courierName && (
                                            <Text>
                                                <Text className="text-[#6a6a6a]">Courier: </Text>
                                                <Text className="font-medium text-[#1e293b]">
                                                    {order.tracking.courierName}
                                                </Text>
                                            </Text>
                                        )}
                                        {order.tracking.courierPhone && (
                                            <Text>
                                                <Text className="text-[#6a6a6a]">Courier phone: </Text>
                                                <Text className="font-medium text-[#1e293b]">
                                                    {order.tracking.courierPhone}
                                                </Text>
                                            </Text>
                                        )}
                                    </Flex>
                                    {order.tracking.url && (
                                        <Typography.Link
                                            href={order.tracking.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="!text-lightRed"
                                        >
                                            Visit site <ArrowRightOutlined />
                                        </Typography.Link>
                                    )}
                                </Flex>
                                <Divider className="!my-0" />
                                {trackingTimeline.length > 0 ? (
                                    <Steps
                                        direction="vertical"
                                        items={trackingTimeline.map(event => ({
                                            title: event.title,
                                            description: event.description,
                                            status: event.status,
                                        }))}
                                    />
                                ) : (
                                    <Text className="text-[#6a6a6a]">No shipment activity recorded yet.</Text>
                                )}
                            </>
                        ) : (
                            <Flex vertical gap={4}>
                                <Text className="text-[16px] font-medium text-[#1e293b]">
                                    {noTrackingMessage.title}
                                </Text>
                                <Text className="text-[14px] text-[#6a6a6a]">{noTrackingMessage.description}</Text>
                            </Flex>
                        )}
                    </Flex>
                </Card>
            </Flex>

            {/* Modals */}
            <CancelOrderModal
                open={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                orderId={order.orderId || order.transactionId}
                refundAmount={order.totalAmount}
                isPrepaid={order.paymentStatus === 'PAID'}
                onSubmit={async (reason, description) => {
                    const succeeded = await cancelOrder(reason, description);
                    if (succeeded) {
                        setCancelModalOpen(false);
                        dispatch(
                            showToast({
                                description: 'Your order has been cancelled.',
                                variant: 'success',
                            })
                        );
                    } else {
                        dispatch(
                            showToast({
                                description:
                                    "We couldn't cancel this order right now — please try again or contact support.",
                                variant: 'error',
                            })
                        );
                    }
                    return succeeded;
                }}
            />

            <RaiseIssueModal
                open={raiseModalOpen}
                onClose={() => setRaiseModalOpen(false)}
                onSubmit={async (category, subCategory, description, images) => {
                    const succeeded = await raiseIssue(category, subCategory, description, images);
                    if (succeeded) {
                        dispatch(
                            showToast({
                                description: 'Your issue has been raised with the seller.',
                                variant: 'success',
                            })
                        );
                    } else {
                        dispatch(
                            showToast({
                                description: 'Failed to raise issue. Please try again.',
                                variant: 'error',
                            })
                        );
                    }
                    return succeeded;
                }}
            />
        </Flex>
    );
};

export default OrderedProductDetailsPage;
