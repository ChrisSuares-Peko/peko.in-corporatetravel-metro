import { useState } from 'react';

import { Button, Col, Divider, Flex, Row, Typography } from 'antd';
import { Content } from 'antd/es/layout/layout';

import { useAppSelector } from '@src/hooks/store';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import CheckoutTextRow from '../../GiftCards/components/CheckoutTextRow';
import Bookings from '../Components/BookingReview/Bookings';
import GuestDetails from '../Components/BookingReview/GuestDetails';
import ReviewHotelModal from '../Components/BookingReview/ReviewHotelModal';
import Summary from '../Components/BookingReview/Summary';
import ShowTimer from '../Components/ShowTimer';
import useForm from '../hooks/useCheckout';

const BookingDetails = () => {
    const { hotelResponse, hotelsRequest, netAmount, prebookResponse } = useAppSelector(
        state => state.reducer.hotels
    );
  
     const [isModal, setIsModal] = useState<boolean>(false);
        const reviewModal = () => {
            setIsModal(true);
        };
        const cancelModal = () => {
            setIsModal(false);
        };
    const response = hotelResponse as any;
    const { loading } = useForm();
    const checkIn = new Date(hotelsRequest.CheckIn);
    const checkout = new Date(hotelsRequest.CheckOut);
    const timeDiff = checkout.getTime() - checkIn.getTime();
    const nightDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return (
        <Content>
            <Flex>
                <Typography.Title level={4}>Your Booking Summary</Typography.Title>
            </Flex>
            <Row gutter={[30, 30]} className="mt-5">
                <Col xl={17} sm={24} xs={24}>
                    <Summary />
                    {prebookResponse.HotelResult[0]?.Rooms[0]?.Name.map((item: string) => (
                        <Bookings
                            hotel={response.HotelDetails[0].HotelName}
                            details={hotelsRequest}
                            checkInTime={response.HotelDetails[0].CheckInTime}
                            roomName={item}
                            checkoutTime={response.HotelDetails[0].CheckOutTime}
                        />
                    ))}

                    {/* <PriceSummary /> */}
                    <GuestDetails />
                </Col>
                <Col xl={7} sm={24} className="w-full">
                    <Flex vertical className=" md:mt-0 mt-5 border border-gray-200 p-6  rounded-md">
                        <ShowTimer/>
                        <Typography.Title level={5}>Total Amount</Typography.Title>
                        <Flex vertical className=" mt-4" gap={15}>
                            <CheckoutTextRow
                                text={`Base Price (${nightDifference} ${nightDifference === 1 ? 'night' : 'nights'})`}
                                value={formatNumberWithLocalString(netAmount.basePrice) || '0.00'}
                            />
                            {!!netAmount.tax && (
                                <CheckoutTextRow
                                    text="Taxes and fees"
                                    value={formatNumberWithLocalString(netAmount.tax) || '0.00'}
                                />
                            )}

                            <Divider className="m-0" />

                            <CheckoutTextRow
                                text="Total (Tax Inclusive)"
                                value={formatNumberWithLocalString(netAmount.totalFare)}
                                bold
                            />

                            <div data-testid="continue">
                                <Button
                                    danger
                                    type="primary"
                                    className="w-full font-medium px-5 h-10"
                                    onClick={reviewModal}
                                    loading={loading}
                                >
                                    Continue
                                </Button>
                            </div>
                        </Flex>
                    </Flex>
                </Col>
            </Row>
             <ReviewHotelModal
                            isModalOpen={isModal}
                            handleCancel={cancelModal}
                            prebookResponse={prebookResponse}
                          
                        />
        </Content>
    );
};

export default BookingDetails;
