import { ReactNode } from 'react';

import { Typography } from 'antd';

const { Text } = Typography;

export interface ProgressRow {
    key: string;
    /** Left label, e.g. category name or member name. */
    label: string;
    /** Optional secondary label shown muted next to the main label. */
    subLabel?: string;
    /** Optional leading icon, shown in a circle tinted with `color` (e.g. spend-by-category icons). */
    icon?: ReactNode;
    /** Right-aligned value text, e.g. "₹10,835.20 · 56%". */
    valueText: string;
    /** 0–100 bar fill. */
    percent: number;
    color: string;
}

/**
 * Generic label + right-value + horizontal bar list. Reused by both
 * "Spend by Category" (corporate) and "Card Utilisation" (admin).
 */
const ProgressList = ({ rows }: { rows: ProgressRow[] }) => (
    <ul className="flex flex-col mt-3 divide-y divide-borderCard">
        {rows.map(row => (
            <li key={row.key} className="flex  flex-col gap-2 py-4 first:pt-0 last:pb-0">
                <div className="flex items-center mt-2 justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        {row.icon && (
                            <span
                                className="flex size-7 shrink-0 items-center justify-center rounded-full text-sm"
                                style={{ backgroundColor: `${row.color}1A`, color: row.color }}
                            >
                                {row.icon}
                            </span>
                        )}
                        <Text className="truncate text-sm font-medium text-textHeadings">
                            {row.label}
                            {row.subLabel && (
                                <span className="ml-1 font-normal text-textGreyLight">
                                    {row.subLabel}
                                </span>
                            )}
                        </Text>
                    </div>
                    <Text className="whitespace-nowrap text-sm text-textBody">{row.valueText}</Text>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-listBg">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{
                            // Show a small sliver for sub-1% rows so a genuinely non-zero amount stays
                            // visible — but a true 0 (nothing spent/utilised) must render fully empty,
                            // not a visible dot (ADO 29049).
                            width: row.percent <= 0 ? '0%' : `${Math.min(Math.max(row.percent, 2), 100)}%`,
                            backgroundColor: row.color,
                        }}
                    />
                </div>
            </li>
        ))}
    </ul>
);

export default ProgressList;
