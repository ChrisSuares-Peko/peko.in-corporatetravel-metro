import {
    formatNumberWithLocalString,
    formatNumberWithLocalStringWithoutDecimalPoint,
} from '@utils/priceFormat';

import { TabItem } from './types';

/** Utilisation percentage, guarded against a zero/invalid limit. Returns 0–100. */
export const utilisationPercent = (used: number, limit: number): number =>
    limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;

/** Rupee amount, Indian grouping, decimals omitted when integer (card panels). */
export const formatRupees = (value: number): string =>
    `₹${formatNumberWithLocalStringWithoutDecimalPoint(value)}`;

/** Rupee amount with 2 decimals (table cells), e.g. ₹15,000.00. */
export const formatRupeesDecimal = (value: number): string =>
    `₹${formatNumberWithLocalString(value)}`;

/** Resolve a tab (or dropdown child) key to its display label; falls back to the key. */
export const getTabLabel = (tabs: TabItem[], key: string): string => {
    const all = tabs.flatMap(tab => [{ key: tab.key, label: tab.label }, ...(tab.children ?? [])]);
    return all.find(item => item.key === key)?.label ?? key;
};

/** Remove emoji characters from a string (used to sanitise search inputs). */
export const stripEmojis = (value: string): string =>
    value.replace(/\p{Extended_Pictographic}/gu, '').replace(/️/g, '');

/** Up-to-two-letter uppercase initials from a person's name (e.g. "Anto Rebe" → "AR"). */
export const getInitials = (name: string): string =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('');
export const normalizeDocumentFormat = (typeExtension: string, fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? typeExtension;
    const map: Record<string, string> = {
        jpeg: 'jpg',
        jpg: 'jpg',
        png: 'png',
        pdf: 'pdf',
        doc: 'doc',
        docx: 'docx',
    };
    return map[ext] ?? map[typeExtension] ?? typeExtension;
};