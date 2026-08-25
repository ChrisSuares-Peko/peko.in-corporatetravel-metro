import React from 'react';

import { Flex, Typography } from 'antd';

// Visual style matches the +/- counter used in
// `Airline/components/PassengerSelectModal.tsx` (that component's `CounterButton`
// is local/unexported and multi-type adults/children/infants, so it isn't reused
// directly — this is a small single-count equivalent built to the same look).
const CounterButton: React.FC<{
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ disabled, onClick, children }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`w-9 h-9 rounded-full border flex items-center justify-center text-lg font-light transition-colors select-none
            ${disabled
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-500 hover:border-[#FF4F4F] hover:text-[#FF4F4F] cursor-pointer'
            }`}
    >
        {children}
    </button>
);

type PassengerCounterProps = {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
};

export default function PassengerCounter({
    value,
    onChange,
    min = 1,
    max = 6,
    label = 'Passengers',
}: PassengerCounterProps) {
    return (
        <Flex justify="space-between" align="center" gap={20}>
            <Typography.Text style={{ fontSize: 14, fontWeight: 700, color: 'rgba(0,0,0,0.85)' }}>
                {label}
            </Typography.Text>
            <Flex gap={12} align="center">
                <CounterButton disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
                    -
                </CounterButton>
                <Typography.Text className="text-base font-semibold w-6 text-center">
                    {value}
                </Typography.Text>
                <CounterButton disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
                    +
                </CounterButton>
            </Flex>
        </Flex>
    );
}
