import { type FC } from 'react';

import { Checkbox, Flex, Switch, Typography } from 'antd';

import { useSellers } from '../../hooks/useSellers';
import { ProductFilters } from '../../types/products';

const { Text } = Typography;

// Design placeholders for groups with no backend data (rendered disabled).
const BRANDS = ['Cello', 'Unimax', 'Krish', 'Pilot', 'Dollar', 'Faber Castell'];
const SHIPPING = [
    'Ships in 1 - 2 days',
    'Ships in 2 - 3 days',
    'Ships in 3 - 4 days',
    'Ships in 4 - 5 days',
];

interface FiltersSidebarProps {
    city: string | undefined;
    value: ProductFilters;
    onChange: (filters: ProductFilters) => void;
}

const GroupHeading: FC<{ children: string }> = ({ children }) => (
    <Text className="text-[17px] font-medium uppercase text-[#1e293b]">{children}</Text>
);

const label = (t: string, disabled = false) => (
    <span className={disabled ? 'text-gray-300' : 'text-[#787878]'}>{t}</span>
);

/**
 * Office Supplies Filters sidebar (Figma-matched). Price / Discount / Seller are
 * wired to real backend filtering; Brand / Shipping time / Returnable render per
 * the design but are disabled (no backend data yet).
 */
const FiltersSidebar: FC<FiltersSidebarProps> = ({ city, value, onChange }) => {
    const { sellers } = useSellers(city);

    const toggleSeller = (name: string) => {
        const current = value.sellers || [];
        const next = current.includes(name)
            ? current.filter(s => s !== name)
            : [...current, name];
        onChange({ ...value, sellers: next.length ? next : undefined });
    };

    return (
        <Flex vertical gap={28} className="w-full rounded-3xl border border-[#e4e4e7] bg-white p-6">
            <Text className="text-2xl font-semibold text-[#1e293b]">Filters</Text>

            {/* Price */}
            <Flex vertical gap={12}>
                <GroupHeading>Price</GroupHeading>
                <Checkbox
                    checked={value.priceMax === 200}
                    onChange={e => onChange({ ...value, priceMax: e.target.checked ? 200 : undefined })}
                >
                    {label('Under ₹200')}
                </Checkbox>
            </Flex>

            {/* Discount */}
            <Flex vertical gap={12}>
                <GroupHeading>Discount</GroupHeading>
                <Checkbox
                    checked={value.minDiscount === 10}
                    onChange={e =>
                        onChange({ ...value, minDiscount: e.target.checked ? 10 : undefined })
                    }
                >
                    {label('10% off or more')}
                </Checkbox>
            </Flex>

            {/* Brand — no data yet */}
            <Flex vertical gap={12}>
                <GroupHeading>Brand</GroupHeading>
                {BRANDS.map(b => (
                    <Checkbox key={b} disabled>
                        {label(b, true)}
                    </Checkbox>
                ))}
                <Text className="text-xs text-gray-400">Coming soon</Text>
            </Flex>

            {/* Seller — wired */}
            <Flex vertical gap={12}>
                <GroupHeading>Seller</GroupHeading>
                {sellers.length ? (
                    <Flex vertical gap={10} className="max-h-52 overflow-auto pr-1">
                        {sellers.map(s => (
                            <Checkbox
                                key={s}
                                checked={(value.sellers || []).includes(s)}
                                onChange={() => toggleSeller(s)}
                            >
                                {label(s)}
                            </Checkbox>
                        ))}
                    </Flex>
                ) : (
                    <Text className="text-xs text-gray-400">No sellers for this location</Text>
                )}
            </Flex>

            {/* Shipping time — no data yet */}
            <Flex vertical gap={12}>
                <GroupHeading>Shipping time</GroupHeading>
                {SHIPPING.map(s => (
                    <Checkbox key={s} disabled>
                        {label(s, true)}
                    </Checkbox>
                ))}
                <Text className="text-xs text-gray-400">Coming soon</Text>
            </Flex>

            {/* Returnable — no data yet */}
            <Flex vertical gap={8}>
                <GroupHeading>Returnable</GroupHeading>
                <Flex align="center" justify="space-between">
                    {label('Returnable only', true)}
                    <Switch disabled defaultChecked className="!bg-bgOrange" />
                </Flex>
                <Text className="text-xs text-gray-400">Coming soon</Text>
            </Flex>
        </Flex>
    );
};

export default FiltersSidebar;
