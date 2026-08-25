import { useState } from 'react';

import { EditOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';

import { MetroJourneySelection } from '../../slices/metroSlice';
import EditJourneyDrawer from '../shared/EditJourneyDrawer';

type RouteSummaryCardProps = {
    journey: MetroJourneySelection;
    onChange: (journey: MetroJourneySelection) => void;
};

export default function RouteSummaryCard({ journey, onChange }: RouteSummaryCardProps) {
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
            <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 20 }}>
                <Flex justify="space-between" align="center">
                    <Flex vertical gap={4}>
                        <Typography.Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                            {journey.cityName} Metro
                        </Typography.Text>
                        <Flex align="center" gap={10}>
                            <Typography.Text style={{ fontSize: 18, fontWeight: 700 }}>
                                {journey.boardingStationName}
                            </Typography.Text>
                            <Typography.Text style={{ fontSize: 18, color: '#FF4F4F' }}>→</Typography.Text>
                            <Typography.Text style={{ fontSize: 18, fontWeight: 700 }}>
                                {journey.dropStationName}
                            </Typography.Text>
                        </Flex>
                        <Typography.Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>
                            {journey.passengerCount} {journey.passengerCount === 1 ? 'Passenger' : 'Passengers'}
                        </Typography.Text>
                    </Flex>
                    <EditOutlined
                        onClick={() => setEditOpen(true)}
                        style={{ color: '#FF4F4F', fontSize: 18, cursor: 'pointer' }}
                    />
                </Flex>
            </Card>

            <EditJourneyDrawer
                open={editOpen}
                journey={journey}
                onClose={() => setEditOpen(false)}
                onSave={onChange}
            />
        </>
    );
}
