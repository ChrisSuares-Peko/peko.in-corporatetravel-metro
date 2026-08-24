export interface SubCategoryOption {
    label: string;
    value: string;
}

export interface CategoryOption {
    label: string;
    value: string;
    subCategories: SubCategoryOption[];
}

export const ISSUE_TAXONOMY: CategoryOption[] = [
    {
        label: 'Payment issues',
        value: 'ORDER',
        subCategories: [
            { label: 'Extra amount deducted', value: 'Extra amount deducted' },
            { label: 'Order not confirmed', value: 'Order not confirmed' },
            { label: 'Cancellation request not accepted', value: 'Cancellation request not accepted' },
            { label: 'Other', value: 'Other' },
        ],
    },
    {
        label: 'Delayed Delivery',
        value: 'FULFILLMENT',
        subCategories: [
            { label: 'Delay in delivery', value: 'Delay in delivery' },
            { label: 'Delivery agent behaved rudely', value: 'Delivery agent behaved rudely' },
            { label: 'Item damaged in transit', value: 'Item damaged in transit' },
            { label: 'Other', value: 'Other' },
        ],
    },
    {
        label: 'Item issues',
        value: 'ITEM',
        subCategories: [
            { label: 'Incorrect item delivered', value: 'Incorrect item delivered' },
            { label: 'Defective item', value: 'Defective item' },
            { label: 'Shortage of items', value: 'Shortage of items' },
            { label: 'Other', value: 'Other' },
        ],
    },
    {
        label: 'Agent issues',
        value: 'AGENT',
        subCategories: [
            { label: 'Seller unresponsive', value: 'Seller unresponsive' },
            { label: 'Grievance officer details not found', value: 'Grievance officer details not found' },
            { label: 'Other', value: 'Other' },
        ],
    },
];

export const mapCategoryToDisplay = (cat: string): string => {
    const found = ISSUE_TAXONOMY.find(c => c.value === cat);
    return found ? found.label : cat;
};
