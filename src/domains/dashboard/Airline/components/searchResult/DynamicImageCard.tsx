import React from 'react';

import { Flex, Image, Typography } from 'antd';

import { retrieveAirlineName } from '../../utils/airlineData';

interface DynamicImageCardProps {
    flightSegments: any;
}

export default function DynamicImageCard({ flightSegments }: DynamicImageCardProps) {
    function capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    const operatingAirlines = flightSegments.map((segment: any) => segment.Airline.AirlineCode);
    const uniqueOperatingAirlines = [...new Set(operatingAirlines)];

    const flightNumbers = flightSegments.map(
        (segment: any) => `${segment.Airline.AirlineCode}-${segment.Airline.FlightNumber}`
    );
    const uniqueFlightNumbers = [...new Set(flightNumbers)].join(' | ');
    return uniqueOperatingAirlines.length > 1 ? (
        <Flex vertical align="center" justify="center">
            {uniqueOperatingAirlines.map((v, i) => (
                <Image
                    key={i}
                    preview={false}
                    width={60}
                    alt="logo"
                    src={`https://firebasestorage.googleapis.com/v0/b/peko-storage.appspot.com/o/staging%2Fairline_logos%2F${v}.gif?alt=media`}
                />
            ))}
            {/* <Typography.Text className="text-center mt-1 text-sm font-normal text-[#6B6B6B]">
                Multiple Airlines
            </Typography.Text> */}
            <Typography.Text className="capitalize text-center text-[.65rem]">
                {uniqueFlightNumbers}
            </Typography.Text>
        </Flex>
    ) : (
        <Flex vertical align="center" justify="center">
            <Image
                preview={false}
                width={80}
                alt="logo"
                src={`https://firebasestorage.googleapis.com/v0/b/peko-storage.appspot.com/o/staging%2Fairline_logos%2F${uniqueOperatingAirlines[0]}.gif?alt=media`}
            />
            <Typography.Text className="capitalize text-center mt-2 font-medium">
                {capitalizeFirstLetter(retrieveAirlineName(uniqueOperatingAirlines[0] as string))}
            </Typography.Text>
            <Typography.Text className="capitalize text-center text-[.65rem] hidden md:block">
                {uniqueFlightNumbers}
            </Typography.Text>
        </Flex>
    );
}
