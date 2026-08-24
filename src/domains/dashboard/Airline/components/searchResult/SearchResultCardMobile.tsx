import React, { useEffect, useState } from 'react';

import { RightOutlined } from '@ant-design/icons';
import { Badge, Card, Col, Divider, Flex, Pagination, Row, Typography } from 'antd';
import dayjs from 'dayjs';
import Lottie from 'react-lottie';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import useScrollUpOnPageChange from '@src/hooks/useScrollTopOnPageChange';
import { paths } from '@src/routes/paths';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import DynamicImageCard from './DynamicImageCard';
import { setSelectedAirline } from '../../slices/airlineSlice';
import { Flight } from '../../types/Flight';
import { formattedTimeOnly } from '../../utils/dateTime';
import {
    calculateDuration,
    formatDurationToHourMinute,
    formatStopQuantityWithCities,
} from '../../utils/formatDateCode';
import { noFlightResults } from '../../utils/lottie';
import FlightInfoDrawer from '../FlightInfoDrawer';
import LayoverTooltip from '../LayoverTooltip';

interface FlightDetailProps {
    flights: Flight[] | undefined;
}

const { Text } = Typography;

function SearchResultCardMobile({ flights }: FlightDetailProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [drawerDetails, setDrawerDetails] = useState<Flight>();
    const [selectedAirlinePrice, setSelectedAirlinePrice] = useState<number>();
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5; // Number of items per page

    const handleClick = (item: Flight) => {
        dispatch(setSelectedAirline(item));
        navigate(
            `${paths.dashboard.corporateTravel}/${paths.airline.index}/${paths.airline.results}/${paths.airline.details}`
        );
    };

    // Paginate flights
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFlights = flights?.slice(startIndex, endIndex) || [];
    useEffect(() => {
        setCurrentPage(1);
    }, [flights]);
    useScrollUpOnPageChange(currentPage);

    const findLastSegment = (journey: any) => journey[journey.length - 1];
    return (
        <>
            <Row gutter={16}>
                {flights?.length === 0 ? (
                    <Flex className="w-full h-full" vertical justify="center" align="center">
                        <Lottie options={noFlightResults} height={250} width={350} />
                        <Typography.Text className="text-base text-center">
                            Apologies, no flights found. Kindly consider refining your search or
                            exploring alternative destinations.
                        </Typography.Text>
                    </Flex>
                ) : (
                    paginatedFlights.map((item, index) => (
                        <Col key={index} className="border-b border-solid " span={24}>
                            <Card className="border-0" bodyStyle={{ padding: 10 }}>
                                <Row gutter={[0, 10]} className="p-0 m-0">
                                    {item.journey.map((ele, i) => (
                                        <Col span={24} className="">
                                            <DynamicImageCard flightSegments={ele} />

                                            <Row justify="space-between">
                                                <Col
                                                    span={8}
                                                    className="flex flex-col px-1 items-start"
                                                >
                                                    <Text className="font-bold text-xs xs375:text-sm  text-start">
                                                        {formattedTimeOnly(
                                                            new Date(ele[0].Origin.DepTime)
                                                        )}
                                                    </Text>
                                                    <Text className="text-[0.54rem] xs375:text-xs xs375:mt-1">
                                                        {ele[0].Origin.Airport.AirportCode}
                                                        <Badge
                                                            dot
                                                            className="mx-1"
                                                            color="#000"
                                                        />
                                                        {dayjs(ele[0].Origin.DepTime).format(
                                                            'MMM D'
                                                        )}
                                                    </Text>
                                                </Col>
                                                <Col
                                                    span={8}
                                                    className="flex flex-col items-center justify-center"
                                                >
                                                    <Text className=" text-[0.6rem] xs375:text-[0.7rem]">
                                                        {formatDurationToHourMinute(
                                                            calculateDuration(ele)
                                                        )}
                                                    </Text>
                                                    <Divider className="my-[0.098rem] xs375:my-1" />
                                                    <LayoverTooltip segments={ele}>
                                                        <Text className="text-[0.6rem] xs375:text-[0.7rem] block w-full truncate text-center">
                                                            {formatStopQuantityWithCities(ele)}
                                                        </Text>
                                                    </LayoverTooltip>
                                                </Col>
                                                <Col
                                                    span={8}
                                                    className="flex flex-col px-1 items-end"
                                                >
                                                    <Text className="font-bold text-sm mt-2">
                                                        {formattedTimeOnly(
                                                            new Date(
                                                                findLastSegment(
                                                                    ele
                                                                ).Destination.ArrTime
                                                            )
                                                        )}
                                                    </Text>
                                                    <Text className="text-[0.54rem] xs375:text-xs xs375:mt-1">
                                                        {
                                                            findLastSegment(ele).Destination.Airport
                                                                .AirportCode
                                                        }
                                                        <Badge
                                                            dot
                                                            className="mx-1"
                                                            color="#000"
                                                        />
                                                        {dayjs(
                                                            findLastSegment(ele).Destination.DepTime
                                                        ).format('MMM D')}
                                                    </Text>
                                                </Col>
                                                <Col
                                                    span={24}
                                                    className="flex flex-col items-end justify-end"
                                                >
                                                    {/* {item.FareClassification?.Type && (
                                                        <Tag
                                                            style={{
                                                                backgroundColor:
                                                                    item.FareClassification.Color ||
                                                                    undefined,
                                                                border: 'none',
                                                            }}
                                                            className="text-[10px] font-medium mb-1"
                                                        >
                                                            {item.FareClassification.Type}
                                                        </Tag>
                                                    )} */}
                                                    <Text className="font-bold text-[0.8rem] mt-5 xs375:text-sm ">
                                                        ₹ {formatNumberWithLocalString(item.price)}
                                                    </Text>

                                                    <Text className="text-[.5rem] xs375:text-[0.64rem] xs375:mt-1 text-gray-500 text-center ">
                                                        Includes taxes and Charges
                                                    </Text>
                                                    {/* {item.seatsAvailable !== undefined &&
                                                        item.seatsAvailable <= 9 && (
                                                            <Text className="text-[0.6rem] xs375:text-xs text-orange-500 font-medium">
                                                                Only {item.seatsAvailable} left!
                                                            </Text>
                                                        )} */}
                                                </Col>
                                            </Row>
                                        </Col>
                                    ))}
                                    <Col span={12} className="border-0 rounded-none ">
                                        <Flex justify="space-between" align="center">
                                            <Typography.Text
                                                onClick={() => {
                                                    setDrawerDetails(item);
                                                    setSelectedAirlinePrice(Number(item.price));
                                                    setIsDrawerOpen(true);
                                                }}
                                                className="text-brandColor cursor-pointer text-xs"
                                            >
                                                Flight Details
                                            </Typography.Text>
                                        </Flex>
                                    </Col>
                                    <Col span={12}>
                                        <Typography.Text
                                            className=" text-brandColor cursor-pointer flex justify-end items-center  text-sm "
                                            onClick={() => handleClick(item)}
                                        >
                                            Book Now <RightOutlined className="ms-1 text-xs" />
                                        </Typography.Text>
                                    </Col>
                                    {/* <Col span={24}>
                                        <Row justify="space-between">
                                            <Col
                                                span={12}
                                                className="flex flex-col items-start justify-end"
                                            >
                                                <Flex>
                                                    <ReactSVG src={BagSVG} className="ms-2" />
                                                    <ReactSVG src={BagSVG} className="ms-2" />
                                                </Flex>
                                                <Text className="text-gray-400 text-[.65rem] xs375:text-xs font-normal mt-1 ms-2">
                                                    Baggage -
                                                    <Text className="text-gray-400 text-[.65rem] xs375:text-xs font-normal ms-1">
                                                        {item?.journey[0][0].Baggage}
                                                    </Text>
                                                </Text>
                                            </Col>
                                            <Col
                                                span={12}
                                                className="flex flex-col items-end justify-center"
                                            >
                                                <Text className="font-bold text-md mt-2">
                                                    ₹ {formatNumberWithLocalString(item.price)}
                                                </Text>

                                                <Text className="text-gray-400 text-[.65rem] xs375:text-xs font-thin text-end">
                                                    Includes taxes and Charges
                                                </Text>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={24}>
                                        <Button
                                            size="large"
                                            type="primary"
                                            className="w-full my-2"
                                            danger
                                            onClick={() => handleClick(item)}
                                        >
                                            Book Now
                                        </Button>
                                    </Col> */}
                                </Row>
                            </Card>
                        </Col>
                    ))
                )}
                <Col span={24} className="flex justify-center mt-4">
                    {flights && flights.length > 0 && (
                        <Pagination
                            current={currentPage}
                            pageSize={itemsPerPage}
                            total={flights.length}
                            onChange={page => setCurrentPage(page)}
                            className="mt-4"
                        />
                    )}
                </Col>
            </Row>
            {isDrawerOpen && drawerDetails && (
                <FlightInfoDrawer
                    handleClose={() => setIsDrawerOpen(!isDrawerOpen)}
                    flightDetails={drawerDetails}
                    price={selectedAirlinePrice}
                    isDrawerOpen={isDrawerOpen}
                    handleSubmit={handleClick}
                />
            )}
        </>
    );
}

export default SearchResultCardMobile;
