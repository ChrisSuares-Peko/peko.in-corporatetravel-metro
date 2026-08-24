import { OndcProduct, ProductCardProps } from '../types/products';

const isUsableImageUrl = (value?: string | null) => {
    const url = String(value || '').trim();
    if (!url) return false;
    if (!/^https?:\/\//i.test(url)) return false;
    if (/placeholder|no[_-]?image|image[_-]?not[_-]?available/i.test(url)) return false;
    return true;
};

/** First usable product image URL, or empty string. */
export const resolveProductImageUrl = (
    product: Pick<OndcProduct, 'images' | 'symbol'>
): string => {
    const fromImages = Array.isArray(product.images)
        ? product.images.find(isUsableImageUrl)
        : null;
    if (fromImages) return String(fromImages).trim();
    if (isUsableImageUrl(product.symbol)) return String(product.symbol).trim();
    return '';
};

type ProductListRow = Pick<
    OndcProduct,
    | 'id'
    | 'ondcProductId'
    | 'name'
    | 'images'
    | 'symbol'
    | 'price'
    | 'availableQuantity'
    | 'minQuantity'
    | 'maxPrice'
    | 'vendorName'
>;

const toProductCard = (product: ProductListRow): ProductCardProps | null => {
    const image = resolveProductImageUrl(product);
    if (!image) return null;
    return {
        id: product.id,
        ondcProductId: product.ondcProductId,
        name: product.name,
        image,
        price: product.price,
        quantity: product.availableQuantity,
        minQuantity: product.minQuantity,
        actualPrice: product.maxPrice,
        savePrice: product.maxPrice,
        soldBy: product.vendorName?.trim(),
    };
};

/**
 * Map listing rows to cards, dropping products with missing / unusable images
 * (backend also filters; this is a client safety net).
 */
export const mapProductsWithImages = (rows?: ProductListRow[] | null): ProductCardProps[] =>
    (rows || []).flatMap(product => {
        const card = toProductCard(product);
        return card ? [card] : [];
    });
