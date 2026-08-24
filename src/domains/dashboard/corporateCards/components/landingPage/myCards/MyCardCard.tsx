import { Button, Tooltip, Typography } from 'antd';

import cardIcon from '../../../assets/icons/card.svg';
import { cn } from '../../../utils/cn';
import { formatRupeesDecimal, utilisationPercent } from '../../../utils/helpers';
import { MY_CARDS_COPY } from '../../../utils/myCardsData';
import { MyCard } from '../../../utils/types';
import PekoCard from '../../common/PekoCard';

const { Text } = Typography;

interface MyCardCardProps {
    card: MyCard;
    onViewDetails?: (card: MyCard) => void;
    onFreeze?: (card: MyCard) => void;
    onUnfreeze?: (card: MyCard) => void;
    onLimitIncrease?: (card: MyCard) => void;
    onTransactions?: (card: MyCard) => void;
    onCardControls?: (card: MyCard) => void;
    onRequestPhysical?: (card: MyCard) => void;
    busy?: boolean;
}

const OUTLINE_BTN = '!border-textLightRed !text-textLightRed !bg-white hover:!bg-white';

/** A single cardholder card panel: kind/status pills, the card face, spend bar and per-card actions. */
const MyCardCard = ({
    card,
    onViewDetails,
    onFreeze,
    onUnfreeze,
    onLimitIncrease,
    onTransactions,
    onCardControls,
    onRequestPhysical,
    busy,
}: MyCardCardProps) => {
    const isFrozen = card.status === 'Frozen';
    const isTerminationLocked = !!card.terminationStatus;
    const isTerminationFrozen = isFrozen && card.terminationStatus === 'REQUESTED';

    // Why the freeze/unfreeze button is disabled, or null when it is actionable. A bare `disabled` leaves the
    // cardholder guessing, so the reason is surfaced on hover.
    const lockReason = (() => {
        if (card.terminationStatus === 'COMPLETED')
            return MY_CARDS_COPY.terminationCompletedTooltip;
        if (card.terminationStatus === 'REQUESTED')
            return MY_CARDS_COPY.terminationRequestedTooltip;
        if (isFrozen && !card.canSelfUnfreeze && card.unfreezeRequestStatus) {
            return MY_CARDS_COPY.unfreezeAlreadyRequestedTooltip;
        }
        return null;
    })();

    // antd disabled Buttons swallow mouse events, so a Tooltip has to wrap a plain span. 'click' is included
    // because hover is unreachable on a touch device.
    const withLockTooltip = (button: React.ReactNode) =>
        lockReason ? (
            <Tooltip title={lockReason} trigger={['hover', 'click']}>
                <span className="inline-block w-full">{button}</span>
            </Tooltip>
        ) : (
            button
        );

    return (
        <article className="flex flex-col gap-5 rounded-2xl border border-borderCard bg-white p-5 xl:p-6">
            <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-listBg px-3 py-1 text-xs font-medium text-textBody">
                    {card.kind}
                </span>
                <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        isFrozen
                            ? 'bg-bgLightBlue text-bgDodgerblue'
                            : 'bg-savingsTagLightBg text-savingsTagLightText'
                    }`}
                >
                    {isTerminationFrozen ? 'Frozen (Termination Requested)' : card.status}
                </span>
            </div>

            <PekoCard card={card} className="w-[90%] self-center" />

            <div className="flex flex-col items-center gap-1">
                <Text className="text-sm text-textBody">Card Limit</Text>
                <Text className="text-2xl font-semibold text-textHeadings xl:text-3xl">
                    {formatRupeesDecimal(card.limit)}
                </Text>
            </div>

            <div className="flex flex-col gap-2">
                <Text className="text-sm text-textBody">{MY_CARDS_COPY.monthlySpend}</Text>
                <div className="h-2 w-full overflow-hidden rounded-full bg-listBg">
                    <div
                        className="h-full rounded-full bg-savingsTagLightText"
                        style={{ width: `${utilisationPercent(card.used, card.limit)}%` }}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Text className="text-xs text-textBody">
                        {MY_CARDS_COPY.amountSpent}: {formatRupeesDecimal(card.used)}
                    </Text>
                    <Text className="text-xs text-textBody">
                        {MY_CARDS_COPY.spendLimit}: {formatRupeesDecimal(card.limit)}
                    </Text>
                </div>
            </div>

            {/* {renderFrozenBanner()} */}

            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2">
                    <Button block className={OUTLINE_BTN} onClick={() => onViewDetails?.(card)}>
                        View Details
                    </Button>
                    {isFrozen
                        ? withLockTooltip(
                              <Button
                                  block
                                  loading={busy}
                                  disabled={!!lockReason}
                                  className={cn(OUTLINE_BTN, lockReason && '!opacity-40 !cursor-not-allowed')}
                                  onClick={() => onUnfreeze?.(card)}
                              >
                                  {MY_CARDS_COPY.unfreeze}
                              </Button>
                          )
                        : withLockTooltip(
                              <Button
                                  block
                                  disabled={busy || isTerminationLocked}
                                  className={OUTLINE_BTN}
                                  onClick={() => onFreeze?.(card)}
                              >
                                  Freeze Card
                              </Button>
                          )}
                    <Button
                        type="primary"
                        danger
                        block
                        disabled={isFrozen}
                        onClick={() => onLimitIncrease?.(card)}
                    >
                        Limit Increase
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        block
                        className="!border-textLightRed !text-textLightRed !bg-white hover:!bg-white"
                        onClick={() => onTransactions?.(card)}
                    >
                        Transactions
                    </Button>
                    <Button
                        block
                        className="!border-textLightRed !text-textLightRed !bg-white hover:!bg-white"
                        onClick={() => onCardControls?.(card)}
                    >
                        Card Controls
                    </Button>
                </div>
                {card.kind !== 'Physical Card' && (
                    <Button
                        type="link"
                        danger
                        block
                        icon={<img src={cardIcon} alt="" className="inline h-4 w-4" />}
                        className="font-medium"
                        disabled={isFrozen}
                        onClick={() => onRequestPhysical?.(card)}
                    >
                        {MY_CARDS_COPY.requestPhysical}
                    </Button>
                )}
            </div>
        </article>
    );
};

export default MyCardCard;
