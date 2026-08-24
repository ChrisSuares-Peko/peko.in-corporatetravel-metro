import { useCallback, useEffect, useRef, useState, type FC } from 'react';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Flex, Skeleton, Typography } from 'antd';

import ProductCard from './ProductCard';
import chevronRightIcon from '../../assets/icons/chevron-right.svg';
import { ProductCardProps } from '../../types/products';

interface ProductSectionProps {
    title: string;
    subtitle?: string;
    products: ProductCardProps[];
    isLoading: boolean;
    /**
     * Figma-matched scroll affordance: the overflowing edge fades into the page
     * background under a small grey circular chevron, instead of the plain arrow
     * sitting on top of the edge card. Opt-in — only Top Deals uses it.
     */
    fadeEdges?: boolean;
}

/** Same column math as All Products grid (2 / 3 / 5 cols). Spacing is card padding, not gap. */
const CARD_W = 'w-1/2 shrink-0 overflow-visible lg:w-1/3 xl:w-1/5';
const FADE_W = 'w-[54%] lg:w-[36%] xl:w-[22%]';
const FADE_BTN =
    'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06]';

/**
 * A titled horizontal carousel of products (reuses ProductCard in `bare` mode).
 * Renders nothing once loaded with no products, so empty/stubbed sections
 * (Top Rated, Frequently Bought) stay hidden until they have data.
 */
const ProductSection: FC<ProductSectionProps> = ({
    title,
    subtitle,
    products,
    isLoading,
    fadeEdges = false,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateArrows = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }, []);

    // Measure after paint and keep in sync with scrolling *and* resizing — the
    // edge fades must appear/disappear as the viewport (or sidebar) changes.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return undefined;

        requestAnimationFrame(updateArrows);
        el.addEventListener('scroll', updateArrows);

        const resizeObserver = new ResizeObserver(updateArrows);
        resizeObserver.observe(el);

        return () => {
            el.removeEventListener('scroll', updateArrows);
            resizeObserver.disconnect();
        };
    }, [updateArrows, products, isLoading]);

    const scrollBy = (direction: -1 | 1) => {
        const el = scrollRef.current;
        if (!el) return;
        // Scroll roughly one card (matches All Products column width).
        const amount = el.clientWidth / 5;
        el.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };

    if (!isLoading && products.length === 0) return null;

    /**
     * Scroll affordance for one edge. `fadeEdges` renders the Figma treatment (a
     * gradient fading the edge card into the page background, with a grey 32px
     * chevron button centred on the full card); otherwise the original white
     * pill arrow.
     */
    const renderEdge = (side: 'left' | 'right') => {
        const isLeft = side === 'left';
        if (!(isLeft ? canScrollLeft : canScrollRight)) return null;
        const onClick = () => scrollBy(isLeft ? -1 : 1);

        if (!fadeEdges) {
            const Arrow = isLeft ? LeftOutlined : RightOutlined;
            return (
                <Arrow
                    className={`absolute ${
                        isLeft ? 'left-0' : 'right-0'
                    } top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 px-1 py-2 shadow-sm`}
                    onClick={onClick}
                />
            );
        }

        return (
            <div
                className={`pointer-events-none absolute inset-y-0 z-10 flex items-center from-transparent to-white ${FADE_W} ${
                    isLeft ? 'left-0 justify-start bg-gradient-to-l' : 'right-0 justify-end bg-gradient-to-r'
                }`}
            >
                <button
                    type="button"
                    aria-label={isLeft ? 'Scroll left' : 'Scroll right'}
                    className={FADE_BTN}
                    onClick={onClick}
                >
                    <img
                        src={chevronRightIcon}
                        alt=""
                        className={`h-[14px] w-[14px] ${isLeft ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>
        );
    };

    return (
        <Flex vertical className="mb-8 w-full mt-8">
            <Flex vertical className="mb-4">
                <Typography.Text className="text-lg font-semibold text-[#19191d] lg:text-xl">
                    {title}
                </Typography.Text>
                {subtitle && (
                    <Typography.Text className="mt-0.5 text-[13px] text-[#868686]">
                        {subtitle}
                    </Typography.Text>
                )}
            </Flex>

            {isLoading ? (
                <Flex gap={0} className="w-full overflow-visible">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton.Node key={i} active className={`!h-64 ${CARD_W}`}>
                            <span />
                        </Skeleton.Node>
                    ))}
                </Flex>
            ) : (
                <div className="relative w-full overflow-visible">
                    {renderEdge('left')}

                    <Flex
                        ref={scrollRef}
                        align="stretch"
                        className="hide-scrollbar w-full gap-0 flex-nowrap overflow-x-auto overflow-y-visible scroll-smooth py-1"
                    >
                        {products.map(product => (
                            <div key={product.id} className={CARD_W}>
                                <ProductCard bare {...product} />
                            </div>
                        ))}
                    </Flex>

                    {renderEdge('right')}
                </div>
            )}
        </Flex>
    );
};

export default ProductSection;
