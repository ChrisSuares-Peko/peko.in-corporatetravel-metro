import { useState } from 'react';

import { Flex, Input, Tag } from 'antd';

// Preset-amount chip pattern adapted from GiftCards' `PriceTag.tsx` + `AmountField.tsx`
// (the codebase's actual precedent for "pick a preset amount or enter a custom one" —
// PekoWallet/Telecom don't have this pattern). Copied/adapted here rather than
// cross-imported from the GiftCards domain, since domains in this codebase don't
// import each other's feature components — sharing only happens via components/atomic
// or components/molecular.
const PRESET_AMOUNTS = [100, 200, 500];

type AmountChipSelectorProps = {
    value: number | null;
    onChange: (value: number | null) => void;
};

export default function AmountChipSelector({ value, onChange }: AmountChipSelectorProps) {
    const [customAmount, setCustomAmount] = useState('');
    const isCustomSelected = value !== null && !PRESET_AMOUNTS.includes(value);

    const handlePresetClick = (amount: number) => {
        setCustomAmount('');
        onChange(amount);
    };

    const handleCustomChange = (raw: string) => {
        const digitsOnly = raw.replace(/[^\d]/g, '').slice(0, 6);
        setCustomAmount(digitsOnly);
        onChange(digitsOnly ? Number(digitsOnly) : null);
    };

    return (
        <Flex gap={8} wrap="wrap" align="center">
            {PRESET_AMOUNTS.map(amount => (
                <Tag
                    key={amount}
                    onClick={() => handlePresetClick(amount)}
                    style={{ borderRadius: '0.4rem', backgroundColor: 'white' }}
                    className={`text-center p-2 text-sm h-10 items-center cursor-pointer ${
                        value === amount ? 'border border-[#FF4F4F] bg-[#FFF4F4] text-[#FF4F4F]' : 'text-zinc-400'
                    }`}
                >
                    {`₹ ${amount}`}
                </Tag>
            ))}
            <Input
                placeholder="Custom amount"
                value={customAmount}
                onChange={e => handleCustomChange(e.target.value)}
                className={`w-36 h-10 rounded-md ${isCustomSelected ? 'border-[#FF4F4F]' : ''}`}
                prefix="₹"
                inputMode="numeric"
            />
        </Flex>
    );
}
