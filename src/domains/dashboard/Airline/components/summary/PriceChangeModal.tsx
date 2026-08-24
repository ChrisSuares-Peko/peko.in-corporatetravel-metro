import { Alert, Button, Divider, Flex, Modal, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import { formattedTimeOnly } from '../../utils/dateTime';

type Props = {
    open: boolean;
    flightLatestDetails: any;
    handleSubmit: () => void;
    handleCloseModal: () => void;
    handleBookNow: () => void;
};
const PriceChangeModal = ({
    open,
    flightLatestDetails,
    handleSubmit,
    handleCloseModal,
    handleBookNow,
}: Props) => {
    const navigate = useNavigate();
    const { paymentData, selectedAirline, outbountFare, inbountFare } = useAppSelector(
        state => state.reducer.airline
    );

    const { totalAmount: previousTotal } = paymentData;
    let updatedFare;
    let updatedTime;

    const { inbount, outbount } = flightLatestDetails;

    if (inbount?.isPriceChanged) {
        updatedFare = previousTotal - inbountFare + Number(inbount.fare.PublishedFare);
    } else if (outbount.isPriceChanged) {
        updatedFare = previousTotal - outbountFare + Number(outbount.fare.PublishedFare);
    }

    if (inbount?.isTimeChanged) {
        updatedTime = inbount.schedule;
    } else if (outbount.isTimeChanged) {
        updatedTime = outbount.schedule;
    }

    const isTimeChanged = inbount.isTimeChanged || outbount.isTimeChanged;
    const isPriceChanged = inbount.isPriceChanged || outbount.isPriceChanged;

    let message = '';
    let title = '';

    const { arrive: previousArrival, depart: previousDeparture } = selectedAirline;

    if (isTimeChanged && isPriceChanged) {
        title = 'Fare and Schedule Changed';
        message =
            'There have been updates to both the fare and schedule of your selected flight. Please review the revised information to ensure it still meets your travel needs.';
    } else if (isTimeChanged) {
        title = 'Flight Schedule Update';
        message =
            'The airline has made changes to the departure or arrival time of your selected flight. Please review the updated schedule before proceeding.';
    } else {
        title = 'Flight Fare Update';
        message =
            'The fare for your selected flight has recently changed. Please review the updated pricing before proceeding with your booking.';
    }

    const isOnlyFareChange = !isTimeChanged;

    const navigateToFlightResult = () => {
        navigate(
            `${paths.dashboard.corporateTravel}/${paths.airline.index}/${paths.airline.results}`
        );
    };

    // const handleContinue = () => {
    //     // fetch user data
    //     const { passengers } = paymentData.payload;
    //     const udpatedPassengerData = passengers.map((passenger: any) => {
    //         const newPassenger = { ...passenger };
    //         const passengerType = passenger.PaxType;
    //         const fareData = passengerFares.filter(
    //             ({ PaxType }: { PaxType: string }) => PaxType === passengerType
    //         );
    //         const passengerFare = fareData[0];
    //         console.log('passengerFare', passengerFare);
    //         newPassenger.Fare = passengerFare.Fare;
    //         return newPassenger;
    //     });

    //     let total = fare.PublishedFare;
    //     const ssrFares = udpatedPassengerData.reduce(
    //         (acc: any, passenger: Passenger) => {
    //             passenger.MealDynamic.forEach(meal => {
    //                 acc.meal += meal.Price;
    //             });
    //             passenger.Baggage.forEach(baggage => {
    //                 acc.baggage += baggage.Price;
    //             });
    //             passenger.SeatDynamic.forEach(seat => {
    //                 acc.seat += seat.Price;
    //             });

    //             return acc;
    //         },
    //         {
    //             meal: 0,
    //             baggage: 0,
    //             seat: 0,
    //         }
    //     );
    //     total += (ssrFares.meal || 0) + (ssrFares.baggage || 0) + (ssrFares.seat || 0);

    //     setContinueToPayment(true);
    //     dispatch(
    //         setPaymentDetails({
    //             ...paymentData,
    //             totalAmount: total,
    //             payload: {
    //                 ...paymentData.payload,
    //                 passengers: udpatedPassengerData,
    //             },
    //         })
    //     );
    //     dispatch(updatePaymentDetailsPassenger(udpatedPassengerData));
    // };

    return (
        <Modal open={open} width={650} onCancel={handleCloseModal}>
            <Flex vertical>
                <Flex vertical align="center">
                    <Typography.Text className="font-medium text-xl">{title}</Typography.Text>
                    <Typography.Text className="mt-1 text-gray-500 text-xs text-center w-96">
                        {message}
                    </Typography.Text>
                </Flex>

                <Flex justify="center" className="pt-5">
                    <Flex vertical className="border rounded-md px-10 py-3 min-w-72 ">
                        {isPriceChanged && (
                            <Flex vertical className={` ${isOnlyFareChange && 'items-center'}`}>
                                <Typography.Text className="font-medium ">
                                    Updated Fare: ₹{formatNumberWithLocalString(updatedFare)}
                                </Typography.Text>
                                <Typography.Text className="mt-1 text-gray-500 text-xs">
                                    Previous Fare:{' '}
                                    <span className="ml-1 line-through">
                                        ₹{formatNumberWithLocalString(previousTotal)}
                                    </span>
                                </Typography.Text>
                            </Flex>
                        )}

                        {isTimeChanged && isPriceChanged && <Divider />}

                        {isTimeChanged && (
                            <Flex vertical>
                                <Typography.Text className="font-medium ">
                                    New Departure Time:{' '}
                                    {formattedTimeOnly(new Date(updatedTime.ArrTime))}
                                    <Typography.Text className="ml-1 text-gray-500 text-xs text-center">
                                        (previously{' '}
                                        {formattedTimeOnly(new Date(previousArrival.datetime))})
                                    </Typography.Text>
                                </Typography.Text>
                                <Typography.Text className="font-medium ">
                                    New Arrival Time:{' '}
                                    {formattedTimeOnly(new Date(updatedTime.DeptTime))}
                                    <Typography.Text className="ml-1 text-gray-500 text-xs text-center">
                                        (previously{' '}
                                        {formattedTimeOnly(new Date(previousDeparture.datetime))})
                                    </Typography.Text>
                                </Typography.Text>
                            </Flex>
                        )}
                    </Flex>
                </Flex>

                <Flex className="justify-center gap-2 mb-2 mt-4">
                    <Button danger className="px-5" onClick={navigateToFlightResult}>
                        Change Flight
                    </Button>
                    <Button danger type="primary" className="px-5" onClick={handleSubmit}>
                        Continue with Updated Fare
                    </Button>
                </Flex>

                <Divider />

                <Alert
                    message={
                        <Typography.Text className="text-sm">
                            <span className="font-bold">Note: </span>Fare adjustments are set by the
                            airline and may vary based on demand and availability. Prices are
                            updated in real-time and are subject to change until your booking is
                            confirmed.
                        </Typography.Text>
                    }
                    banner
                />
            </Flex>
        </Modal>
    );
};

export default PriceChangeModal;
