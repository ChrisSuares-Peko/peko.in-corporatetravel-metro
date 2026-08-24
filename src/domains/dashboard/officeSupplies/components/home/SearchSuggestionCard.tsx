import { useCallback, useState, type FC } from 'react';

import { Flex, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { paths } from '@src/routes/paths';
import { formatNumberWithLocalStringWithoutDecimalPoint } from '@utils/priceFormat';

import { ProductCardProps } from '../../types/products';
import ProductImageView from '../common/ProductImageView';

const { Text } = Typography;

/**
 * Compact search-suggestion card (Figma-matched): image, single-line
 * truncated name, price + discount badge only. No "Sold by", strikethrough
 * price, or Add-to-Cart button — this card is click-to-navigate only, used
 * inside the search-bar autocomplete dropdown's 6-column grid.
 */
const SearchSuggestionCard: FC<ProductCardProps> = ({
    image,
    name,
    price,
    actualPrice,
    ondcProductId,
    quantity,
}) => {
    const navigate = useNavigate();
    const [imageUnavailable, setImageUnavailable] = useState(!String(image || '').trim());
    const markImageUnavailable = useCallback(() => setImageUnavailable(true), []);

    const priceNum = parseFloat(price) || 0;
    const maxNum = parseFloat(actualPrice) || 0;
    const discountPct =
        maxNum > priceNum && maxNum > 0 ? Math.round(((maxNum - priceNum) / maxNum) * 100) : 0;

    if (imageUnavailable || (quantity !== undefined && quantity < 1)) return null;

    const goToDetails = () =>
        navigate(
            `/${paths.officeSupplies.index}/${paths.officeSupplies.productDetails}/${encodeURIComponent(ondcProductId)}`
        );

    return (
        <Flex
            vertical
            gap={3}
            role="button"
            onClick={goToDetails}
            className="w-full min-w-0 cursor-pointer"
        >
            <div className="flex h-[104px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#f7f7f7]">
                <ProductImageView
                    src={image}
                    alt={name}
                    loading="lazy"
                    hideOnFail
                    onUnavailable={markImageUnavailable}
                    className="max-h-[80%] max-w-[80%] object-contain"
                />
            </div>
            <Text
                title={name}
                className="truncate text-[12px] font-semibold tracking-[0.33px] text-[#19191d]"
            >
                {name}
            </Text>
            <Flex align="center" gap={6}>
                <Text className="whitespace-nowrap text-[12px] font-medium tracking-[0.33px] text-[#19191d]">
                    ₹{formatNumberWithLocalStringWithoutDecimalPoint(price)}
                </Text>
                {discountPct > 0 && (
                    <span className="whitespace-nowrap rounded-[3px] border-[0.27px] border-[#d4fbdc] bg-[#e8ffed] px-1 text-[8px] tracking-[0.22px] text-[#43b75d]">
                        {discountPct}% OFF
                    </span>
                )}
            </Flex>
        </Flex>
    );
};

export default SearchSuggestionCard;
