import { Image, Typography } from 'antd';

import cashfreeLogo from '@assets/images/cashfreeLogo.png';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import pekoLogo from '../../payments/assets/svg/peko-logo.svg';
import { PaymentMode } from '../../payments/types/index';

const { Text } = Typography;

interface PaymentMethodSelectorProps {
    selected: PaymentMode;
    onSelect: (mode: PaymentMode) => void;
    walletBalance?: number;
    walletDisabled: boolean;
    showWallet: boolean;
    showGateway: boolean;
}

// Wallet / Cashfree method picker (central payments pattern, CI sibling markup
// adapted to the Business Registration card style).
const PaymentMethodSelector = ({
    selected,
    onSelect,
    walletBalance,
    walletDisabled,
    showWallet,
    showGateway,
}: PaymentMethodSelectorProps) => (
    <div className="border-[0.5px] border-[rgba(204,204,204,0.8)] rounded-[16px] p-5 flex flex-col gap-4">
        <Text className="!text-[16px] !font-semibold !text-[#1e293b]">Payment Method</Text>

        {showWallet && (
            <div
                role="button"
                tabIndex={walletDisabled ? -1 : 0}
                onClick={() => !walletDisabled && onSelect(PaymentMode.wallet)}
                onKeyDown={e => e.key === 'Enter' && !walletDisabled && onSelect(PaymentMode.wallet)}
                className={`bg-white border rounded-[10px] flex items-center justify-between px-4 py-3 min-h-[64px] transition-colors ${
                    selected === PaymentMode.wallet ? 'border-[#ff4f4f]' : 'border-[#e4e7ec]'
                } ${walletDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <div className="flex items-center gap-2">
                    <Text className="!text-[15px] !font-semibold !text-[#1e293b]">Wallet</Text>
                    {walletBalance !== undefined && (
                        <Text className="!text-[13px] !text-[#64748b]">
                            (₹{formatNumberWithLocalString(walletBalance)})
                        </Text>
                    )}
                </div>
                <Image src={pekoLogo} alt="Peko Wallet" preview={false} height={20} />
            </div>
        )}

        {showGateway && (
            <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(PaymentMode.PAYTM)}
                onKeyDown={e => e.key === 'Enter' && onSelect(PaymentMode.PAYTM)}
                className={`bg-white border rounded-[10px] flex items-center justify-between px-4 py-3 min-h-[64px] cursor-pointer transition-colors ${
                    selected === PaymentMode.PAYTM ? 'border-[#ff4f4f]' : 'border-[#e4e7ec]'
                }`}
            >
                <Text className="!text-[15px] !font-medium !text-[#1e293b]">
                    Debit/Credit/ATM Cards
                </Text>
                <Image src={cashfreeLogo} alt="Cashfree" preview={false} height={14} />
            </div>
        )}

        {showWallet && walletDisabled && (
            <Text className="!text-[13px] !text-[#b45309]">
                Insufficient wallet balance — add funds or pay by card.
            </Text>
        )}
    </div>
);

export default PaymentMethodSelector;
