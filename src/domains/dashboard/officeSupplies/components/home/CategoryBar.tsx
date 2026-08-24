import { useState, type FC } from 'react';

import { Button, Flex, Image, Popover, Skeleton, Typography } from 'antd';

import { OfficeCategory, SubItem } from '../../utils/officeSupplyCategories';

interface CategoryBarProps {
    categories: OfficeCategory[];
    isLoading?: boolean;
    /** currently selected category key */
    selected: string;
    /** currently selected subcategory key, if any — kept highlighted in the mega-menu */
    selectedSubcategoryKey?: string | null;
    onSelect: (category: OfficeCategory) => void;
    onSelectSubcategory?: (category: OfficeCategory, item: SubItem) => void;
}

/** Subcategories split into 2 balanced columns (Figma 2099-23297), regardless
 *  of how many a category has — from 4 (Printers & Toner) up to 14 (Stationery). */
const splitIntoColumns = (items: SubItem[]): [SubItem[], SubItem[]] => {
    const mid = Math.ceil(items.length / 2);
    return [items.slice(0, mid), items.slice(mid)];
};

/** The subcategory mega-menu shown on category hover: a plain 2-column list,
 *  no section heading (Figma 2099-23297). The picked subcategory (if any)
 *  stays highlighted so it's clear what the grid is currently filtered to. */
const MegaMenu: FC<{
    category: OfficeCategory;
    selectedSubcategoryKey?: string | null;
    onPick: (item: SubItem) => void;
}> = ({ category, selectedSubcategoryKey, onPick }) => {
    const items = category.subGroups?.[0]?.items || [];
    const [left, right] = splitIntoColumns(items);

    const column = (colItems: SubItem[]) => (
        <Flex vertical gap={6}>
            {colItems.map(item => {
                const isSelected = item.key === selectedSubcategoryKey;
                return (
                    <Button
                        key={item.key}
                        type="link"
                        onClick={() => onPick(item)}
                        className={`!h-auto !w-fit !justify-start !border-0 !p-0 !text-[13px] !leading-6 hover:!text-bgOrange ${
                            isSelected ? '!font-semibold !text-bgOrange' : '!font-medium !text-[#475569]'
                        }`}
                    >
                        {item.label}
                    </Button>
                );
            })}
        </Flex>
    );

    return (
        <Flex gap={40}>
            {column(left)}
            {right.length > 0 && column(right)}
        </Flex>
    );
};

/**
 * Horizontal row of category circles (Figma-matched). "All Product" is the
 * default. Categories with `subGroups` open a mega-menu flyout on hover; picking
 * a subcategory narrows the product filter.
 */
const categoryBarScrollClass =
    'mt-4 w-full overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden';

const categoryRowClass = 'mx-auto w-max min-w-full flex-nowrap';

const CategoryBar: FC<CategoryBarProps> = ({
    categories,
    isLoading = false,
    selected,
    selectedSubcategoryKey,
    onSelect,
    onSelectSubcategory,
}) => {
    // While a category (or its mega-menu) is hovered, that chip gets the orange
    // label + red underline; "All Product" falls back to black if it was selected.
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div
                className={categoryBarScrollClass}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <Flex align="start" gap={20} justify="center" className={categoryRowClass}>
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Flex
                            key={index}
                            vertical
                            align="center"
                            gap={6}
                            className="min-w-[76px] shrink-0"
                        >
                            <Skeleton.Avatar active size={64} shape="circle" className="!flex !shrink-0" />
                            <div className="h-3 w-14 shrink-0 rounded bg-[#f0f0f0]" />
                        </Flex>
                    ))}
                </Flex>
            </div>
        );
    }

    return (
        <div
            className={categoryBarScrollClass}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            <Flex align="start" gap={20} justify="center" className={categoryRowClass}>
                {categories.map(cat => {
                    const active = selected === cat.key;
                    const isAll = cat.key === 'all';
                    const isHovered = hoveredKey === cat.key;
                    const emphasized = isHovered || (active && hoveredKey === null);
                    const hasMenu = !!(cat.subGroups?.length && onSelectSubcategory);

                    let labelClass = 'text-[#5b5b5b]';
                    if (emphasized) {
                        labelClass =
                            'text-bgOrange underline decoration-2 underline-offset-4 decoration-bgOrange';
                    } else if (isAll) {
                        labelClass = 'text-black';
                    }

                    const chip = (
                        <Flex
                            key={cat.key}
                            vertical
                            align="center"
                            gap={6}
                            className="group min-w-[76px] shrink-0 cursor-pointer"
                            onClick={() => onSelect(cat)}
                            onMouseEnter={() => {
                                if (!hasMenu) setHoveredKey(cat.key);
                            }}
                            onMouseLeave={() => {
                                if (!hasMenu) setHoveredKey(null);
                            }}
                        >
                            <Flex
                                align="center"
                                justify="center"
                                className={`h-16 w-16 overflow-hidden rounded-full border transition-transform duration-200 group-hover:scale-105 ${
                                    emphasized ? 'border-bgOrange' : 'border-[#e2e2e2]'
                                }`}
                            >
                                <Image
                                    src={cat.image}
                                    alt={cat.label}
                                    preview={false}
                                    className={
                                        isAll ? '!h-7 !w-7 object-contain' : '!h-10 object-cover'
                                    }
                                />
                            </Flex>
                            <Typography.Text
                                className={`whitespace-nowrap text-center text-xs leading-tight ${labelClass}`}
                            >
                                {cat.label}
                            </Typography.Text>
                        </Flex>
                    );

                    if (hasMenu) {
                        return (
                            <Popover
                                key={cat.key}
                                trigger="hover"
                                placement="bottom"
                                arrow={false}
                                styles={{ body: { borderRadius: 16, padding: 20 } }}
                                onOpenChange={open => setHoveredKey(open ? cat.key : null)}
                                content={
                                    <MegaMenu
                                        category={cat}
                                        selectedSubcategoryKey={selectedSubcategoryKey}
                                        onPick={item => onSelectSubcategory!(cat, item)}
                                    />
                                }
                            >
                                {chip}
                            </Popover>
                        );
                    }
                    return chip;
                })}
            </Flex>
        </div>
    );
};

export default CategoryBar;
