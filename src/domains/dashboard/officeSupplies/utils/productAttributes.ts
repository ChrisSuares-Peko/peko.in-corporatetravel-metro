import {
    getBrand as getBrandFromTags,
    getCountryOfOrigin as getCountryFromTags,
    getHsn as getHsnFromTags,
    getNetQuantity as getNetQty,
    readTag,
} from '@utils/ondcProductAttributes';

import { OndcProduct, OndcTag } from '../types/products';

export type { OndcTag };

/** Look up a value inside the ONDC `tags` array by group code + item code. */
export { readTag };

export const getBrand = (product: OndcProduct): string => getBrandFromTags(product);

export const getCountryOfOrigin = (product: OndcProduct): string => getCountryFromTags(product);

export const getNetQuantity = (product: OndcProduct): string => getNetQty(product);

/** HSN code from ONDC tags when the seller provides it (common tag codes vary). */
export const getHsn = (product: OndcProduct): string => getHsnFromTags(product);

/**
 * Format an ONDC ISO-8601 duration (e.g. "P2D", "PT4H", "PT30M") as human text
 * ("2 days", "4 hours", "30 minutes"). Returns '' for anything unparseable.
 */
export const formatIsoDuration = (duration?: string | null): string => {
    if (!duration) return '';
    const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/i.exec(duration.trim());
    if (!match) return '';
    const [, days, hours, minutes] = match;
    const parts: string[] = [];
    const push = (count: string | undefined, unit: string) => {
        const n = parseInt(count || '', 10);
        if (n > 0) parts.push(`${n} ${unit}${n === 1 ? '' : 's'}`);
    };
    push(days, 'day');
    push(hours, 'hour');
    push(minutes, 'minute');
    return parts.join(' ');
};

/** Parse "@ondc/org/contact_details_consumer_care" ("name,email,phone"). */
export const parseConsumerCare = (
    raw?: string | null,
): { name: string; email: string; phone: string } | null => {
    if (!raw?.trim()) return null;
    const [name = '', email = '', phone = ''] = raw.split(',').map(s => s.trim());
    if (!name && !email && !phone) return null;
    return { name, email, phone };
};

/**
 * Purchasable quantity bounds from the seller's catalog entry:
 * min = quantity.minimum.count (default 1); max = the smaller of current stock
 * and quantity.maximum.count. `purchasable` is false when stock can't even
 * cover the minimum order quantity.
 */
export const getQtyBounds = (
    product: OndcProduct,
): { min: number; max: number; purchasable: boolean } => {
    const available = product.availableQuantity || 0;
    const min = Math.max(1, product.minQuantity || 1);
    const cap = product.maxQuantity ? Math.min(available, product.maxQuantity) : available;
    const max = Math.max(min, cap);
    return { min, max, purchasable: available >= min && available > 0 };
};

export type Attribute = { label: string; value: string };

/**
 * Build the list of product attributes we actually have data for. GST, HSN,
 * packaging, warranty and model/variant are intentionally omitted (no source).
 */
export const buildKeyAttributes = (product?: OndcProduct | null): Attribute[] => {
    if (!product) return [];
    const rows: Attribute[] = [
        { label: 'Brand', value: getBrand(product) },
        { label: 'Net quantity', value: getNetQuantity(product) },
        { label: 'Country of origin', value: getCountryOfOrigin(product) },
        { label: 'Category', value: product.localCategory || product.categoryId || '' },
    ];
    return rows.filter(r => r.value);
};
