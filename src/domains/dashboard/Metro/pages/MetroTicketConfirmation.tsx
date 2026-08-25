import { useEffect } from 'react';

import { Button, Card, Flex, Typography } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import FieldLabelValue from '@components/molecular/Text/FieldLabelValue';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';

import MetroQrPlaceholder from '../components/confirmation/MetroQrPlaceholder';
import { clearMetroJourney } from '../slices/metroSlice';

export default function MetroTicketConfirmation() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const ticket = useAppSelector(state => state.reducer.metro.ticket);

    useEffect(() => {
        if (!ticket) {
            navigate(`${paths.dashboard.corporateTravel}/${paths.metro.index}`, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!ticket) return null;

    const handleDone = () => {
        dispatch(clearMetroJourney());
        navigate(paths.dashboard.corporateTravel);
    };

    const handleDownload = () => {
        // Non-functional stub — no ticket-PDF backend exists yet for the prototype.
        dispatch(showToast({ description: 'Download will be available once ticketing is live.', variant: 'info' }));
    };

    return (
        <Flex vertical gap={20} align="center" style={{ maxWidth: 420, margin: '0 auto' }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
                Ticket confirmed
            </Typography.Title>

            <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 24 }}>
                <Flex vertical gap={20} align="center">
                    <MetroQrPlaceholder payload={ticket.qrPayload} />
                    <Typography.Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
                        Placeholder QR — for prototype use only
                    </Typography.Text>

                    <Flex vertical gap={16} style={{ width: '100%' }}>
                        <FieldLabelValue label="From" value={ticket.boardingStationName} />
                        <FieldLabelValue label="To" value={ticket.dropStationName} />
                        <FieldLabelValue label="Passengers" value={String(ticket.passengerCount)} />
                        <FieldLabelValue label="Fare" value={`₹ ${ticket.fare.amount.toFixed(2)}`} />
                        <FieldLabelValue
                            label="Booked on"
                            value={dayjs(ticket.bookedAt).format('DD MMM YYYY, hh:mm A')}
                        />
                    </Flex>
                </Flex>
            </Card>

            <Flex gap={12} style={{ width: '100%' }}>
                <Button onClick={handleDownload} size="large" style={{ flex: 1, height: 52, borderRadius: 12 }}>
                    Download
                </Button>
                <Button
                    onClick={handleDone}
                    danger
                    type="primary"
                    size="large"
                    style={{ flex: 1, height: 52, borderRadius: 12 }}
                >
                    Done
                </Button>
            </Flex>
        </Flex>
    );
}
