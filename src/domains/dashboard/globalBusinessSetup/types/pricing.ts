export type FixedPackage = {
    label: string;
    price: number;
    visas: number;
};

export type VisaTier = {
    min: number;
    max: number;
    price: number;
};

export type EstablishmentCardOption = {
    label: string;
    price: number;
};

export type Office = {
    label: string;
    price: number;
};

export type PricingAttribute = {
    label: string;
    value: string;
    _id?: string;
};

export type PricingType = {
    _id: string;
    name: string;
    description?: string;
    licence: string;
    currency?: string;
    freezone?: string;
    pricing_model: 'fixed' | 'table' | 'tiered';
    vat: number;
    is_active?: boolean;
    status?: 'active' | 'inactive';

    // Fixed model
    fixed_packages?: FixedPackage[];

    // Table model
    visa_table?: Record<string, number>;
    extra_visa_fee?: number;
    min_visas?: number;
    max_visas?: number;

    // Tiered model
    license?: number;
    visa_tiers?: VisaTier[];

    // Activities
    included_activities?: number;
    extra_activity_fee?: number;
    max_activities?: number;
    general_trading_fee?: number;

    // Shareholders
    included_shareholders?: number;
    extra_shareholder_fee?: number;
    max_shareholders?: number;

    // Establishment card
    establishment_card?: number;
    establishment_card_options?: EstablishmentCardOption[];

    // Offices
    offices?: Office[];
    office_mandatory?: boolean;

    // Display
    highlights?: string;
    order?: number;
    attributes?: PricingAttribute[];
};

export type QuoteConfig = {
    visa: number;
    activity: number;
    shareholder: number;
    selected_pkg?: number;
    office_idx: number | null;
    general_trading: boolean;
    est_card_idx?: number;
};
