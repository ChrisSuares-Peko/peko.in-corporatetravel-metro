import { useEffect, type FC } from 'react';

import { ClockCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Flex, Image, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/hooks';
import { paths } from '@src/routes/paths';

import OndcLogo from '../assets/ondc-network-logo.png';
import { useCartDetailsApi } from '../hooks/useCartDetailsApi';

interface OfficeSuppliesTopProps {
    /** hide the title/subtitle block (used on the product-details page) */
    titleHidden?: boolean;
    /** shown in place of the title when titleHidden (e.g. the category name) */
    categoryText?: string;
    /** override the page title (e.g. "Shopping cart") */
    title?: string;
    /** override the subtitle line (e.g. "3 items") */
    subtitle?: string;
}

const SUBTITLE = 'Source stationery, devices & pantry from verified sellers on the ONDC network';

/**
 * Office Supplies header (Figma-matched): title + subtitle on the left (the
 * breadcrumb comes from the root DashboardLayout); ONDC Network logo, Order
 * History and Cart actions on the right. On the product-details page
 * (`titleHidden`) the title block collapses to the category name and only the
 * actions remain.
 */
const OfficeSuppliesTop: FC<OfficeSuppliesTopProps> = ({
    titleHidden,
    categoryText,
    title = 'Office Supplies',
    subtitle = SUBTITLE,
}) => {
    const { getCartDetails } = useCartDetailsApi();
    const cartCount = useAppSelector(state => state.reducer.cart.count);
    const navigate = useNavigate();

    useEffect(() => {
        getCartDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goOrderHistory = () =>
        navigate(`${paths.dashboard.officeSupplies}/${paths.officeSupplies.orderHistory}`);
    const goCart = () =>
        navigate(`${paths.dashboard.officeSupplies}/${paths.officeSupplies.cartPage}`);

    return (
        <Flex vertical gap={4} className="w-full">
            <Flex align="start" justify="space-between" wrap="wrap" gap={16} className="w-full">
                {/* Left: title + subtitle (or category name on details page) */}
                <Flex vertical gap={2} className="min-w-0">
                    {!titleHidden ? (
                        <>
                            <Typography.Text className="text-[20px] font-medium text-black md:text-[22px]">
                                {title}
                            </Typography.Text>
                            {subtitle && (
                                <Typography.Text className="text-[13px] text-[#868686] md:text-[14px]">
                                    {subtitle}
                                </Typography.Text>
                            )}
                        </>
                    ) : (
                        categoryText && (
                            <Typography.Text className="text-lg font-medium text-black">
                                {categoryText}
                            </Typography.Text>
                        )
                    )}
                </Flex>

                {/* Right: ONDC logo + actions */}
                <Flex align="center" gap={16} wrap="wrap">
                    <Flex align="center" gap={12}>
                        <Image
                            src={OndcLogo}
                            alt="ONDC Network"
                            preview={false}
                            height={40}
                            className="object-contain"
                        />
                        <div className="h-10 w-px bg-[#e9e9e9]" />
                    </Flex>
                    <Flex align="center" gap={8} wrap="wrap">
                        <Button
                            icon={<ClockCircleOutlined style={{ fontSize: 14 }} />}
                            onClick={goOrderHistory}
                            className="!flex !h-10 !items-center !gap-1 !rounded-xl !border-lightRed !text-sm !font-medium !text-lightRed"
                        >
                            Order History
                        </Button>
                        <div className="relative">
                            <Button
                                icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
                                onClick={goCart}
                                className="!flex !h-10 !items-center !gap-2 !rounded-xl !border-lightRed !text-[15px] !font-medium !text-lightRed"
                            >
                                Cart
                            </Button>
                            {cartCount > 0 && (
                                <Flex
                                    align="center"
                                    justify="center"
                                    className="absolute h-5 min-w-5 rounded-full bg-[#ff0000] px-1 shadow-[0_2.5px_5px_rgba(0,0,0,0.15)]"
                                    style={{ top: -4, right: -5 }}
                                >
                                    <Typography.Text className="text-xs font-semibold leading-none !text-white">
                                        {cartCount}
                                    </Typography.Text>
                                </Flex>
                            )}
                        </div>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default OfficeSuppliesTop;
