import { Button, Divider, Flex, theme, Typography } from 'antd';

import { formatNumberWithLocalString } from '@utils/priceFormat';

import CheckoutTextRow from './CheckoutTextRow';

const CheckoutDetails = ({ totalData, loading }: { totalData: any; loading?: boolean }) => {
    const {
        token: { colorPrimary },
    } = theme.useToken();
    return (
        <Flex vertical className="p-6 mt-5 border border-gray-200 rounded md:mt-0">
            <Typography.Title level={5}>Total Amount</Typography.Title>
            <Flex vertical className="mt-4 " gap={15}>
                <CheckoutTextRow text="Subtotal" value={formatNumberWithLocalString(totalData)} />
                <CheckoutTextRow text="Discount" value="0.00" />
                <CheckoutTextRow text="VAT " value="0.00" />

                <Divider className="m-0" />

                <CheckoutTextRow text="Total" value={formatNumberWithLocalString(totalData)} bold />
                <Button
                    type="primary"
                    htmlType="submit"
                    danger
                    loading={loading}
                    style={{
                        backgroundColor: colorPrimary,
                        color: 'white',
                    }}
                >
                    Buy Now
                </Button>
            </Flex>
        </Flex>
    );
};

export default CheckoutDetails;
