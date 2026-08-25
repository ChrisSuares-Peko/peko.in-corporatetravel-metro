import { useEffect } from 'react';

import { Button, Flex, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import FareBreakdownCard from '../components/ticketSummary/FareBreakdownCard';
import RouteSummaryCard from '../components/ticketSummary/RouteSummaryCard';
import useBookMetroTicket from '../hooks/useBookMetroTicket';
import useMetroFare from '../hooks/useMetroFare';
import { MetroJourneySelection, setMetroFare, setMetroJourney, setMetroTicket } from '../slices/metroSlice';

export default function MetroTicketSummary() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const journey = useAppSelector(state => state.reducer.metro.journey);
    const fare = useAppSelector(state => state.reducer.metro.fare);
    const { getFare, isLoading: isFareLoading } = useMetroFare();
    const { bookTicket, isLoading: isBooking } = useBookMetroTicket();

    useEffect(() => {
        if (!journey) {
            navigate(`${paths.dashboard.corporateTravel}/${paths.metro.index}`, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!journey) return;
        getFare({
            boardingStationId: journey.boardingStationId,
            dropStationId: journey.dropStationId,
            passengerCount: journey.passengerCount,
        }).then(result => dispatch(setMetroFare(result)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [journey?.boardingStationId, journey?.dropStationId, journey?.passengerCount]);

    if (!journey) return null;

    const handleJourneyChange = (updatedJourney: MetroJourneySelection) => {
        dispatch(setMetroJourney(updatedJourney));
    };

    const handleBuyTicket = async () => {
        if (!fare) return;
        const ticket = await bookTicket({
            cityId: journey.cityId,
            boardingStationId: journey.boardingStationId,
            boardingStationName: journey.boardingStationName,
            dropStationId: journey.dropStationId,
            dropStationName: journey.dropStationName,
            passengerCount: journey.passengerCount,
            fare,
        });
        dispatch(setMetroTicket(ticket));
        navigate(`${paths.dashboard.corporateTravel}/${paths.metro.index}/${paths.metro.confirmation}`);
    };

    return (
        <Flex vertical gap={20} style={{ maxWidth: 480, margin: '0 auto' }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
                Review your journey
            </Typography.Title>

            <RouteSummaryCard journey={journey} onChange={handleJourneyChange} />
            <FareBreakdownCard fare={fare} isLoading={isFareLoading} />

            <Button
                onClick={handleBuyTicket}
                loading={isBooking}
                disabled={!fare || isFareLoading}
                danger
                type="primary"
                size="large"
                style={{ height: 56, borderRadius: 12, fontWeight: 500, fontSize: 16 }}
            >
                Buy Ticket
            </Button>
        </Flex>
    );
}
