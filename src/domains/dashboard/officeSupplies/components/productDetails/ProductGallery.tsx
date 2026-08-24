import { useState, type FC } from 'react';

import { Flex } from 'antd';

import { ProductImage as ProductImageType } from '../../types/productDetails';
import ProductImageView from '../common/ProductImageView';

interface ProductGalleryProps {
    images: ProductImageType[];
    name?: string;
}

/** Product image gallery: large image + thumbnail strip (Figma-matched). */
const ProductGallery: FC<ProductGalleryProps> = ({ images, name }) => {
    const [index, setIndex] = useState(0);
    const main = images?.[index]?.productImageUrl || images?.[0]?.productImageUrl || '';

    return (
        <Flex vertical gap={12} className="w-full max-w-[380px]">
            <div className="flex aspect-square max-h-[300px] w-full items-center justify-center overflow-hidden rounded-3xl bg-[#f7f7f7]">
                <ProductImageView
                    src={main}
                    alt={name}
                    className="max-h-[87%] max-w-[96%] object-contain mix-blend-multiply"
                    placeholderClassName="h-[35%] w-[35%] opacity-40"
                />
            </div>
            {images.length > 1 && (
                <div className="hide-scrollbar w-full overflow-x-auto">
                    <div className="mx-auto flex w-max gap-3">
                        {images.map((img, i) => (
                            <button
                                key={img.id ?? i}
                                type="button"
                                onClick={() => setIndex(i)}
                                className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-[#f7f7f7] transition-colors ${
                                    i === index ? 'border-lightRed' : 'border-[#ededed]'
                                }`}
                            >
                                <ProductImageView
                                    src={img.productImageUrl}
                                    alt={`${name}-${i}`}
                                    className="max-h-[80%] max-w-[80%] object-contain mix-blend-multiply"
                                    placeholderClassName="h-[45%] w-[45%] opacity-40"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </Flex>
    );
};

export default ProductGallery;
