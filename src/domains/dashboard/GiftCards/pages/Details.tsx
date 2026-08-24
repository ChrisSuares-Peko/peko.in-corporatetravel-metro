/* eslint-disable no-nested-ternary */
import React, { useEffect } from 'react';

import { Col, Flex, Image, Row, Skeleton, Tabs, TabsProps, Grid } from 'antd';
import { useParams } from 'react-router-dom';

import '../styles/Style.css';
import defaultImage from '../assets/images/default.png';
import AboutTab from '../components/AboutTab';
import BuyForm from '../components/BuyForm';
// import GiftCard from '../components/GiftCard';
// import GiftCardSmall from '../components/GiftCardSmall';
import HowToUseTab from '../components/HowToUseTab';
import GetGiftDetails from '../hooks/useGiftDetailsApi';
import { GiftCardDetailResponse } from '../types/types';

const { useBreakpoint } = Grid;

const Details = () => {
    const { id } = useParams();

    let data: GiftCardDetailResponse | undefined;
    let isLoading;
    if (id) {
        ({ data, isLoading } = GetGiftDetails(id));
    }

    const screens = useBreakpoint();
     useEffect(() => {
        if (typeof Moengage?.track_event === 'function' && data) {
            Moengage.track_event('giftcard_brand_viewed', {
                brand_name: data?.mainGiftCard.brand_name || data?.mainGiftCard.name,
                min_amount: parseFloat(data?.mainGiftCard.min_price),
            });
        }
    }, [data]);

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'About this Gift Card',
            children: isLoading ? (
                <Skeleton active />
            ) : (
                <AboutTab
                    text={data?.mainGiftCard.description || 'No description available for this gift card'}
                />
            ),
        },
        {
            key: '2',
            label: 'Terms & Conditions',
            children: isLoading ? (
                <Skeleton active />
            ) : (
                <HowToUseTab
                    text={
                        data?.mainGiftCard.terms_and_condition || 'Terms and Conditions not available'
                    }
                />
            ),
        },
    ];
    return (
        <Row className="xs:mt-6 sm:mt-0">
            <Col xs={24}>
                <Flex className="flex-col md:flex-row ">
                    <Flex vertical gap={20}>
                        {/* {isLoading ? ( // Render loader if loading
                            // <Skeleton paragraph={{ rows: 3 }} />
                            <Skeleton.Image style={{ width: '24rem', height: '16rem' }} />
                        ) : (
                            <Image
                                preview={false}
                                src={data?.brand_logo}
                                style={{
                                    borderRadius: ' 0.625rem 0.625rem 0.625rem 0.625rem ',
                                    width: '24rem',
                                }}
                            />
                        )} */}

                        {isLoading ? (
                            <Skeleton.Image
                                style={{
                                    borderRadius: '0.625rem',
                                    width: screens.xl
                                        ? '24rem'
                                        : screens.lg
                                          ? '16rem'
                                          : screens.md
                                            ? '18rem'
                                            : '100%',
                                    height: '15rem',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <Image
                                preview={false}
                                src={data?.mainGiftCard.image}
                                fallback={defaultImage}
                                style={{
                                    borderRadius: '0.625rem',
                                    width: screens.xl
                                        ? '24rem'
                                        : screens.lg
                                          ? '16rem'
                                          : screens.md
                                            ? '18rem'
                                            : '100%',
                                    height: screens.sm ? '15rem' : '',
                                    objectFit: 'cover',
                                }}
                            />
                        )}
                    </Flex>

                    <BuyForm productData={data} key={id} />
                </Flex>
            </Col>
            <Col xs={24} className="mt-5 md:mt-10">
                <Tabs defaultActiveKey="1" items={items} />
            </Col>

            {/* <Row className="mt-8 overflow-x-auto">
                {(data?.length ?? 0) > 0 && (
                    <>
                        <Typography.Title className="w-full" level={5}>
                            You may also like
                        </Typography.Title>
                        <Flex
                            // className="flex mt-5 space-x-8"
                            className={
                                screens.xs
                                    ? 'flex xs:mt-1 space-x-3'
                                    : 'flex mt-5  space-x-8 overflow-x-auto'
                            }
                            id="scrollbar"
                            style={{
                                overflowX: 'auto',
                                WebkitOverflowScrolling: 'touch',

                                scrollbarWidth: 'thin', // For Firefox

                                scrollbarColor: 'rgba(0, 0, 0, 0.02) transparent',
                                // scrollbarColor: 'transparent transparent'
                            }}
                        >
                            {data?.relatedGiftCards.map((item, i) => (
                                <Col xs={12} sm={8} md={6} xl={4} key={i}>
                                    {screens.xs ? ( // Check if extra small screen
                                        <GiftCardSmall
                                            image={item.image}
                                            name={item.name}
                                            description={item.description}
                                            id={item.id}
                                        />
                                    ) : (
                                        <GiftCard
                                            image={item.image}
                                            name={item.name}
                                            description={item.description}
                                            id={item.id}
                                        />
                                    )}
                                </Col>
                            ))}
                        </Flex>
                    </>
                )}
            </Row> */}
        </Row>
    );
};

export default Details;
