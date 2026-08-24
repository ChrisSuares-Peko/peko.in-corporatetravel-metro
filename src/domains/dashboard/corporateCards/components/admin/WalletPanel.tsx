import { useState } from 'react';

import { Button, Skeleton, Typography } from 'antd';

import { useFundingAccountApi } from '../../hooks/admin/useFundingAccountApi';
import { utilisationPercent } from '../../utils/helpers';
import { WalletInfo } from '../../utils/types';
import { useDashboardNav } from '../common/dashboardNav';
import SectionCard, { ViewAllLink } from '../common/SectionCard';
import TopUpModal from '../wallet/TopUpModal';

const { Text } = Typography;

interface WalletPanelProps {
    wallet: WalletInfo;
    /** Wallet/summary data is still loading — show a placeholder instead of the (still-zero) values. */
    loading?: boolean;
}

/** Admin wallet summary: available balance, limit usage and funding account. */
const WalletPanel = ({ wallet, loading }: WalletPanelProps) => {
    const navigate = useDashboardNav();
    const [modalOpen, setModalOpen] = useState(false);
    const { fundingAccount, isLoading: fundingLoading } = useFundingAccountApi(modalOpen);
    const usedPercent = utilisationPercent(wallet.cardLimitsUsed, wallet.cardLimitsTotal);

    return (
        <SectionCard
            title="Wallet"
            action={<ViewAllLink label="View all" onClick={() => navigate('wallet')} />}
        >
            {loading ? (
                <Skeleton active paragraph={{ rows: 7 }} />
            ) : (
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <Text className="text-xs text-textBody">Available balance</Text>
                    <Text className="text-2xl font-semibold text-textHeadings xl:text-3xl">
                        {wallet.available}
                    </Text>
                </div>

                <Text className="text-xs leading-relaxed text-textGreyLight">{wallet.note}</Text>

                <div className="h-2 w-full overflow-hidden rounded-full bg-listBg">
                    <div
                        className="h-full rounded-full bg-textLightRed"
                        style={{ width: `${usedPercent}%` }}
                    />
                </div>

                {/* <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-textBody">
                        <span className="size-2 rounded-full bg-textLightRed" />
                        Card limits {wallet.cardLimitsLabel}
                    </span>
                    <span className="flex items-center gap-1.5 text-textGreyLight">
                        <span className="size-2 rounded-full bg-neutralGray500" />
                        Available
                    </span>
                </div> */}

                <div className="grid grid-cols-2 gap-4 border-t border-borderDivider pt-4">
                    <div className="flex flex-col gap-1">
                        <Text className="text-xs uppercase tracking-wide text-textGreyLight">
                            Card limits
                        </Text>
                        <Text className="text-sm font-medium text-textHeadings">
                            {wallet.cardLimitsLabel}
                        </Text>
                        <Text className="text-xs text-textGreyLight">
                            {wallet.cardLimitsCaption}
                        </Text>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Text className="text-xs uppercase tracking-wide text-textGreyLight">
                            Funding A/C
                        </Text>
                        <Text className="text-sm font-medium text-textHeadings">
                            •• {wallet.fundingAccountLast4}
                        </Text>
                        <Text className="text-xs text-textGreyLight">
                            {wallet.fundingAccountRef}
                        </Text>
                    </div>
                </div>

                <Button
                    type="primary"
                    block
                    className="font-medium"
                    onClick={() => setModalOpen(true)}
                >
                    Top up wallet
                </Button>
            </div>
            )}

            <TopUpModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                details={fundingAccount}
                loading={fundingLoading}
            />
        </SectionCard>
    );
};

export default WalletPanel;
