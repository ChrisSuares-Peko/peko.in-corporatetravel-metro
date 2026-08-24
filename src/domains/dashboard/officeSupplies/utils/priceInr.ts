/** "₹1,234.50" — en-IN grouping, always 2 decimals (Office Supplies is INR-only). */
export const formatInr = (value?: number | string | null): string =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
