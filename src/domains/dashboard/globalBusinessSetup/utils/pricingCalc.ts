import { PricingType, QuoteConfig } from '../types/pricing';

export function fmt(n: number) {
    return n.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export type ConfigRow = { label: string; value: string | number };

export type PackageCardRow = { label: string; value: string };

export function buildPackageCardRows(
    pricing: PricingType,
    jurisdictionAttrs: { label: string; value: string }[] = []
): PackageCardRow[] {
    const rows: PackageCardRow[] = [];

    if (pricing.pricing_model === 'fixed' && pricing.fixed_packages?.length) {
        const visas = pricing.fixed_packages[0]?.visas ?? 0;
        const n = pricing.fixed_packages.length;
        rows.push({
            label: 'Visa Pricing',
            value: `${n} bundle${n === 1 ? '' : 's'} • ${visas} visa${visas === 1 ? '' : 's'}`,
        });
    } else if (pricing.pricing_model === 'table' || pricing.pricing_model === 'tiered') {
        const min = pricing.min_visas ?? 0;
        const max = pricing.max_visas ?? min;
        rows.push({ label: 'Visa Pricing', value: `${min}-${max} visas` });
    }

    if (pricing.included_activities != null) {
        const extra = pricing.extra_activity_fee;
        const suffix = extra && extra > 0 ? `, +INR ${fmt(extra)} extra` : '';
        rows.push({
            label: 'Activities',
            value: `${pricing.included_activities} included${suffix}`,
        });
    }

    if (pricing.included_shareholders != null) {
        const extra = pricing.extra_shareholder_fee;
        const suffix = extra && extra > 0 ? `, +INR ${fmt(extra)} extra` : '';
        rows.push({
            label: 'Shareholders',
            value: `${pricing.included_shareholders} included${suffix}`,
        });
    }

    const findAttr = (key: string) =>
        jurisdictionAttrs.find(a => a.label?.toLowerCase().trim() === key);
    const govt = findAttr('government contracts');
    if (govt?.value) rows.push({ label: 'Government Contracts', value: govt.value });
    const ideal = findAttr('ideal for');
    if (ideal?.value) rows.push({ label: 'Ideal For', value: ideal.value });

    return rows;
}

export function buildConfigRows(pricing: PricingType, q: QuoteConfig): ConfigRow[] {
    const rows: ConfigRow[] = [];

    if (pricing.pricing_model === 'fixed' && pricing.fixed_packages) {
        const pkg = pricing.fixed_packages[q.selected_pkg ?? 0];
        if (pkg) {
            rows.push({ label: 'Package', value: pkg.label });
            rows.push({ label: 'Visas included', value: pkg.visas });
        }
    } else {
        rows.push({ label: 'Visas', value: q.visa });
    }

    if (pricing.included_activities != null && pricing.extra_activity_fee != null) {
        rows.push({
            label: 'Activities',
            value: `${q.activity} (${pricing.included_activities} included)`,
        });
        if (q.general_trading && pricing.general_trading_fee != null) {
            rows.push({ label: 'General Trading', value: 'Yes' });
        }
    }

    if (pricing.included_shareholders != null && pricing.extra_shareholder_fee != null) {
        rows.push({
            label: 'Shareholders',
            value: `${q.shareholder} (${pricing.included_shareholders} included)`,
        });
    }

    if (pricing.establishment_card_options?.length) {
        const ec = pricing.establishment_card_options[q.est_card_idx ?? 0];
        if (ec) rows.push({ label: 'Establishment Card', value: ec.label });
    } else if (pricing.establishment_card != null) {
        rows.push({ label: 'Establishment Card', value: 'Included' });
    }

    if (pricing.offices?.length) {
        const office = q.office_idx != null ? pricing.offices[q.office_idx] : null;
        rows.push({ label: 'Office', value: office ? office.label : 'None' });
    }

    return rows;
}

function calcTieredVisa(count: number, tiers: { min: number; max: number; price: number }[]) {
    if (!count || !tiers?.length) return 0;
    const tier = tiers.find(t => count >= t.min && count <= t.max);
    return tier ? tier.price * count : 0;
}

function calcTableVisa(
    count: number,
    table: Record<string, number>,
    extraFee?: number
): number | null {
    if (table[count] !== undefined) return table[count];
    const keys = Object.keys(table).map(Number);
    const maxKey = Math.max(...keys);
    if (count > maxKey && extraFee) return table[maxKey] + (count - maxKey) * extraFee;
    return null;
}

export function calcStartingFromPrice(pricing: PricingType): number | null {
    let base: number | null = null;
    if (pricing.pricing_model === 'fixed' && pricing.fixed_packages?.length) {
        base = Math.min(...pricing.fixed_packages.map(p => p.price));
    } else if (pricing.pricing_model === 'tiered') {
        const tieredCost = pricing.visa_tiers
            ? calcTieredVisa(pricing.min_visas ?? 0, pricing.visa_tiers)
            : 0;
        base = (pricing.license ?? 0) + tieredCost;
    } else if (pricing.pricing_model === 'table' && pricing.visa_table) {
        base = calcTableVisa(pricing.min_visas ?? 0, pricing.visa_table, pricing.extra_visa_fee);
    }
    if (base == null) return null;

    const officeAddOn =
        pricing.office_mandatory && pricing.offices?.length
            ? Math.min(...pricing.offices.map(o => o.price))
            : 0;

    const establishmentCardAddOn =
        (pricing.establishment_card ?? 0) +
        (pricing.establishment_card_options?.length
            ? Math.min(...pricing.establishment_card_options.map(o => o.price))
            : 0);

    const subtotal = base + officeAddOn + establishmentCardAddOn;
    const vatRate = pricing.vat ?? 0;
    return vatRate > 0 ? subtotal * (1 + vatRate) : subtotal;
}

type QuoteMetrics = Pick<QuoteConfig, 'visa' | 'activity' | 'shareholder'>;

export function normalizeQuoteConfig(
    pricing: PricingType | null | undefined,
    quoteConfig?: Partial<QuoteConfig> | null,
    metrics?: Partial<QuoteMetrics> | null
): QuoteConfig {
    const hasFixedPackages = Boolean(pricing?.fixed_packages?.length);
    const hasEstablishmentCardOptions = Boolean(pricing?.establishment_card_options?.length);
    const selectedPackageIndex = quoteConfig?.selected_pkg ?? (hasFixedPackages ? 0 : undefined);
    const defaultOfficeIdx = pricing?.office_mandatory && pricing.offices?.length ? 0 : null;
    const defaultVisaCount =
        quoteConfig?.visa ??
        metrics?.visa ??
        (selectedPackageIndex != null
            ? pricing?.fixed_packages?.[selectedPackageIndex]?.visas
            : undefined) ??
        pricing?.min_visas ??
        1;

    return {
        visa: defaultVisaCount,
        activity: quoteConfig?.activity ?? metrics?.activity ?? pricing?.included_activities ?? 1,
        shareholder:
            quoteConfig?.shareholder ?? metrics?.shareholder ?? pricing?.included_shareholders ?? 1,
        office_idx:
            quoteConfig?.office_idx !== undefined ? quoteConfig.office_idx : defaultOfficeIdx,
        general_trading: quoteConfig?.general_trading ?? false,
        ...(selectedPackageIndex != null ? { selected_pkg: selectedPackageIndex } : {}),
        ...(hasEstablishmentCardOptions ? { est_card_idx: quoteConfig?.est_card_idx ?? 0 } : {}),
    };
}

export function calcPricingBreakdown(
    pricing: PricingType,
    q: QuoteConfig
): { lines: { label: string; amount: number }[]; total: number } {
    const lines: { label: string; amount: number }[] = [];
    let subtotal = 0;

    const isFixed = pricing.pricing_model === 'fixed';
    const isTable = pricing.pricing_model === 'table';
    const isTiered = pricing.pricing_model === 'tiered';

    if (isFixed && pricing.fixed_packages) {
        const pkg = pricing.fixed_packages[q.selected_pkg ?? 0];
        if (pkg) {
            lines.push({ label: pkg.label, amount: pkg.price });
            subtotal += pkg.price;
        }
    }
    if (isTiered && pricing.license) {
        lines.push({ label: 'License fee', amount: pricing.license });
        subtotal += pricing.license;
    }
    if (isTable && pricing.visa_table) {
        const visaCost = calcTableVisa(q.visa, pricing.visa_table, pricing.extra_visa_fee);
        if (visaCost !== null) {
            lines.push({
                label: `Package (${q.visa} visa${q.visa !== 1 ? 's' : ''})`,
                amount: visaCost,
            });
            subtotal += visaCost;
        }
    }
    if (isTiered && pricing.visa_tiers && q.visa > 0) {
        const visaCost = calcTieredVisa(q.visa, pricing.visa_tiers);
        lines.push({ label: `Visas (${q.visa} x tiered)`, amount: visaCost });
        subtotal += visaCost;
    }
    if (pricing.included_activities != null && pricing.extra_activity_fee) {
        const extra = Math.max(0, q.activity - (pricing.included_activities ?? 0));
        if (extra > 0) {
            const amt = extra * pricing.extra_activity_fee;
            lines.push({
                label: `Extra activities (${extra} x INR ${fmt(pricing.extra_activity_fee)})`,
                amount: amt,
            });
            subtotal += amt;
        }
    }
    if (q.general_trading && pricing.general_trading_fee) {
        lines.push({ label: 'General Trading add-on', amount: pricing.general_trading_fee });
        subtotal += pricing.general_trading_fee;
    }
    if (pricing.included_shareholders != null && pricing.extra_shareholder_fee) {
        const extra = Math.max(0, q.shareholder - (pricing.included_shareholders ?? 0));
        if (extra > 0) {
            const amt = extra * pricing.extra_shareholder_fee;
            lines.push({
                label: `Extra shareholders (${extra} x INR ${fmt(pricing.extra_shareholder_fee)})`,
                amount: amt,
            });
            subtotal += amt;
        }
    }
    if (pricing.establishment_card) {
        lines.push({ label: 'Establishment Card', amount: pricing.establishment_card });
        subtotal += pricing.establishment_card;
    }
    if (pricing.establishment_card_options?.length) {
        const ec = pricing.establishment_card_options[q.est_card_idx ?? 0];
        if (ec) {
            lines.push({ label: `Establishment Card (${ec.label})`, amount: ec.price });
            subtotal += ec.price;
        }
    }
    if (q.office_idx != null && pricing.offices?.[q.office_idx]) {
        const off = pricing.offices[q.office_idx];
        lines.push({ label: `Office - ${off.label}`, amount: off.price });
        subtotal += off.price;
    }

    const vatAmt = subtotal * (pricing.vat ?? 0);
    if (vatAmt > 0) {
        lines.push({ label: `VAT (${((pricing.vat ?? 0) * 100).toFixed(0)}%)`, amount: vatAmt });
    }

    return { lines, total: subtotal + vatAmt };
}
