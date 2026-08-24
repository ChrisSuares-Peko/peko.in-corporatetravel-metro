import { useEffect, useState } from 'react';

import { Form, Typography, Button, Flex, message, Grid, Radio } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import useServiceAccess from '@src/hooks/useSubscriptionCheck';
import { paths } from '@src/routes/paths';
import { accessKeys } from '@utils/accessKeys';

import AmountField from './AmountField';
import QuantityField from './QuantityField';
import { useGetEmployee } from '../hooks/useGetEmployeeApi';
import { resetsetAddressData, setFormData, setProductData } from '../slices/checkoutSlice';
import { GiftCardOrderTypes } from '../types/employee';
import { GiftCardDetailResponse } from '../types/types';

const { useBreakpoint } = Grid;

interface BuyFormProps {
    productData?: GiftCardDetailResponse;
}

const BuyForm: React.FC<BuyFormProps> = ({ productData }: BuyFormProps) => {
    const dispatch = useAppDispatch();
    const { xs } = useBreakpoint();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission
    const isPurchasedPayroll = useServiceAccess(accessKeys.payroll);
     const { data } = useGetEmployee(true);
     console.log("data here",data)
    const [orderType, setOrderType] = useState<GiftCardOrderTypes>(GiftCardOrderTypes.BUYFOROTHER);

    const product_name = productData?.mainGiftCard?.product_name;

    const id = productData?.mainGiftCard.id;
    const product_id = productData?.mainGiftCard.product_id;
    const product_image = productData?.mainGiftCard.image;
    const denominations = productData?.mainGiftCard.denominations;
    const min_price = productData?.mainGiftCard.min_price;
    const max_price = productData?.mainGiftCard.max_price;
     const priceType = productData?.mainGiftCard?.priceType;
    const accessKey = productData?.mainGiftCard.serviceOperator?.accessKey;
    const serviceOperatorId = productData?.mainGiftCard.serviceOperatorId;
    const quantityLimit = accessKey === 'xoxoday' ? productData?.mainGiftCard.quantityLimit : undefined;

    useEffect(() => {
        const product = { product_name, id, product_image, product_id, accessKey: accessKey ?? '', serviceOperatorId };

        dispatch(setProductData(product));
    }, [dispatch, product_name, id, product_image, product_id, accessKey, serviceOperatorId]);

    const validateAmount = (val: number): boolean | undefined => {
        const minSellingPrice = Number(min_price) || 0;
        const maxSellingPrice = Number(max_price) || Number.MAX_SAFE_INTEGER;

        // Check if the value is within the min and max prices
        if (val < minSellingPrice || val > maxSellingPrice) {
            message.error('Value must be within the minimum and maximum price range');
            return false;
        }

        // Check if the value is one of the denominations
        if (priceType === 'FIXED') {
            const numericVal = Number(val);
            if (denominations && denominations.length > 0 && !denominations.includes(numericVal)) {
                message.error('Please select a valid amount:');
                return false;
            }
        }
        return true;
    };

    return (
        <Formik
            initialValues={{ amount: '', quantity: '2' }}
            onSubmit={(values, { setSubmitting }) => {
                setIsSubmitting(true);

                const isValidAmount = validateAmount(Number(values.amount));
                values.quantity =
                    orderType === GiftCardOrderTypes.BULKPURCHASE ? values.quantity : '1';
                if (isValidAmount) {
                    dispatch(setFormData({ ...values, orderType }));
                    dispatch(resetsetAddressData());
                          if (typeof Moengage?.track_event === 'function') {
                        Moengage.track_event('giftcard_buy_now', {
                            brand_name: product_name,
                            amount: parseFloat(values.amount),
                            mode: orderType,
                            quantity: values.quantity,
                        });
                    }
                    navigate(paths.giftcards.checkout);
                }

                setSubmitting(false);
            }}
            validateOnChange // Prevent validation on change
            validateOnBlur={false} // Prevent validation on blur
        >
            {({ handleSubmit, setFieldValue, setFieldError }) => (
                <Form
                    onFinish={handleSubmit}
                    layout="vertical"
                    className="md:-mt-4 md:-ml-4 xl:-ml-0 xs:-mt-0"
                >
                    <Content className="md:ml-10">
                        <Typography.Title
                            className="xs:mt-3 "
                            level={1}
                            style={{ fontSize: xs ? '1rem' : '1.9rem' }}
                        >
                            {productData?.mainGiftCard.product_name}
                        </Typography.Title>
                        <Flex className="mt-3" gap={2}>
                            <Radio.Group
                                onChange={e => {
                                    setOrderType(e.target.value);
                                    setFieldError('amount', ''); // updateTripData('orderType', e.target.value);
                                }}
                                buttonStyle="outline"
                                size="middle"

                                value={orderType}
                                defaultValue="buyForOther"
                                className="-mt-1"
                            >
                                <Radio
                                    defaultChecked
                                    value="buyForOther"
                                    className=" xs:text-xs md:text-[0.78rem] xl:text-sm "
                                >
                                    Buy for Other
                                </Radio>
                                <Radio
                                    value={GiftCardOrderTypes.BUYFORSELF}
                                    className="xs:text-xs md:text-[0.78rem] xl:text-sm"
                                >
                                    Buy for Self
                                </Radio>
                                {isPurchasedPayroll && (
                                    <Radio
                                        value="buyForEmployees"
                                        className="xs:text-xs md:text-[0.78rem] xs:-ml-2 lg:-ml-2 xl:-ml-0 xl:text-sm"
                                    >
                                        Buy for Employees
                                    </Radio>
                                 )}

                                <Radio
                                    value="bulkPurchase"
                                    className="xs:text-xs md:text-[0.78rem] xl:text-sm  xs:mt-2 md:mt-0 lg:-ml-2 xl:-ml-0"
                                >
                                    Bulk Purchase
                                </Radio>
                            </Radio.Group>
                        </Flex>

                        <Flex className="mt-3">
                            <Form.Item
                                className="-mb-1"
                                label={
                                    productData?.mainGiftCard.is_open_denominnation
                                        ? 'Select Amount'
                                        : 'Enter Amount'
                                }
                            >
                                <AmountField
                                    priceType={productData?.mainGiftCard?.priceType}
                                    min_price={productData?.mainGiftCard.min_price}
                                    max_price={productData?.mainGiftCard.max_price}
                                    setFieldValue={setFieldValue}
                                    isSubmitting={isSubmitting}
                                    denominations={productData?.mainGiftCard.denominations}
                                />
                            </Form.Item>
                        </Flex>
                        <Flex>
                            {' '}
                            {/* {orderType === GiftCardOrderTypes.BULKPURCHASE && (
                                <Form.Item className="mr-2" label="No. of Cards:">
                                    <QuantityField />
                                </Form.Item>
                            )} */}
                            <Form.Item
                                className="mr-2 m-0"
                                label="No. of Cards:"
                                style={{
                                    display:
                                        orderType === GiftCardOrderTypes.BULKPURCHASE
                                            ? 'block'
                                            : 'none',

                                    marginTop: !productData?.mainGiftCard?.is_open_denominnation
                                        ? '15px'
                                        : '4px',
                                }}
                            >
                                <QuantityField max={quantityLimit} />
                            </Form.Item>
                            <Button
                                className="h-10 w-36 "
                                type="primary"
                                style={{
                                    marginTop: !productData?.mainGiftCard?.is_open_denominnation
                                        ? '45px'
                                        : '34px',
                                }}
                                htmlType="submit"
                                danger
                            >
                                Buy Now
                            </Button>
                        </Flex>
                    </Content>
                </Form>
            )}
        </Formik>
    );
};
export default BuyForm;
