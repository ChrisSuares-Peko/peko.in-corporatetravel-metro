import { Flex, Image, Typography } from 'antd';

import { useAppSelector } from '@src/hooks/store';

import defaultImage from '../assets/images/default.png';

const CheckoutTableMobile = () => {
    const product = useAppSelector(state => state.reducer.giftcardCheckout.productDetails);
    const formData = useAppSelector(state => state.reducer.giftcardCheckout.formDetails);
    function renderDetails() {
        const details = [
            {
                label: 'Price',
                value: formData?.amount ? `₹ ${formData?.amount}` : 'N/A',
            },
            {
                label: 'Quantity',
                value: formData?.quantity
                    ? `${formData?.quantity} Gift ${Number('formData.quantity') > 1 ? 'Cards' : 'Card'}`
                    : 'N/A',
            },
            {
                label: 'Sub total',
                value: formData?.product ? `₹ ${formData?.product}` : 'N/A',
            },
        ];
        return details.map(detail => (
            <Flex className="w-full mb-2" vertical>
                <Flex justify="space-between" className="w-full">
                    <Typography.Text className="text-gray-500 text-xs">
                        {detail.label}
                    </Typography.Text>
                    <Typography.Text className="text-gray-500 text-xs">
                        {detail.value}
                    </Typography.Text>
                </Flex>
            </Flex>
        ));
    }
    return (
        <Flex className="mb-5" gap={25}>
            <Flex justify="center" align="center" className="w-2/5">
                <Flex className="w-4/5 block">
                    <Image
                        fallback={defaultImage}
                        preview={false}
                        src={product.product_image}
                        style={{ width: '100%', height: '100%' }}
                    />
                </Flex>
            </Flex>
            <Flex className="flex-1" vertical justify="center">
                <Flex className="mb-2">
                    <Typography.Text className="font-medium text-xl">
                        {product?.product_name || 'N/A'}
                    </Typography.Text>
                </Flex>
                {renderDetails()}
            </Flex>
        </Flex>
    );
};

export default CheckoutTableMobile;
