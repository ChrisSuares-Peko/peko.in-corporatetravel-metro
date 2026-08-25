import { useEffect, useMemo, useState } from 'react';

import { Button, Flex, Select, Typography } from 'antd';

import DrawerModal from '@components/atomic/DrawerModal';

import useMetroCities from '../../hooks/useMetroCities';
import useMetroStations from '../../hooks/useMetroStations';
import { MetroJourneySelection } from '../../slices/metroSlice';
import PassengerCounter from './PassengerCounter';

type EditJourneyDrawerProps = {
    open: boolean;
    journey: MetroJourneySelection;
    onClose: () => void;
    onSave: (journey: MetroJourneySelection) => void;
};

// Pencil-icon "edit journey" surface for the ticket summary screen. There's no
// existing "reopen the dropdown inline" precedent in the codebase (the closest
// real analogs — Airline/Hotels — either navigate back to search or reopen a
// full Modal), so this reuses the shared `DrawerModal` atomic component as the
// closest match to "reopening the selection to change it".
export default function EditJourneyDrawer({ open, journey, onClose, onSave }: EditJourneyDrawerProps) {
    const { cities } = useMetroCities();
    const [cityId, setCityId] = useState(journey.cityId);
    const [boardingStationId, setBoardingStationId] = useState(journey.boardingStationId);
    const [dropStationId, setDropStationId] = useState(journey.dropStationId);
    const [passengerCount, setPassengerCount] = useState(journey.passengerCount);

    const { stations } = useMetroStations(cityId);

    useEffect(() => {
        if (open) {
            setCityId(journey.cityId);
            setBoardingStationId(journey.boardingStationId);
            setDropStationId(journey.dropStationId);
            setPassengerCount(journey.passengerCount);
        }
    }, [open, journey]);

    const dropStationOptions = useMemo(
        () => stations.filter(station => station.id !== boardingStationId),
        [stations, boardingStationId]
    );

    useEffect(() => {
        if (dropStationId && !dropStationOptions.some(station => station.id === dropStationId)) {
            setDropStationId('');
        }
    }, [dropStationOptions, dropStationId]);

    const canSave = Boolean(cityId && boardingStationId && dropStationId);

    const handleSave = () => {
        const city = cities.find(c => c.id === cityId);
        const boardingStation = stations.find(s => s.id === boardingStationId);
        const dropStation = stations.find(s => s.id === dropStationId);
        if (!city || !boardingStation || !dropStation) return;

        onSave({
            cityId: city.id,
            cityName: city.name,
            boardingStationId: boardingStation.id,
            boardingStationName: boardingStation.name,
            dropStationId: dropStation.id,
            dropStationName: dropStation.name,
            passengerCount,
        });
        onClose();
    };

    return (
        <DrawerModal open={open} handleCancel={onClose} modalTitle="Edit Journey" closeIcon width={420}>
            <Flex vertical gap={20}>
                <Flex vertical gap={6}>
                    <Typography.Text style={{ fontSize: 14, fontWeight: 700 }}>City</Typography.Text>
                    <Select
                        value={cityId}
                        onChange={value => {
                            setCityId(value);
                            setBoardingStationId('');
                            setDropStationId('');
                        }}
                        options={cities.map(city => ({ label: city.name, value: city.id }))}
                    />
                </Flex>

                <Flex vertical gap={6}>
                    <Typography.Text style={{ fontSize: 14, fontWeight: 700 }}>Boarding Point</Typography.Text>
                    <Select
                        value={boardingStationId || undefined}
                        onChange={setBoardingStationId}
                        showSearch
                        optionFilterProp="label"
                        placeholder="Select boarding station"
                        options={stations.map(station => ({ label: station.name, value: station.id }))}
                    />
                </Flex>

                <Flex vertical gap={6}>
                    <Typography.Text style={{ fontSize: 14, fontWeight: 700 }}>Drop Point</Typography.Text>
                    <Select
                        value={dropStationId || undefined}
                        onChange={setDropStationId}
                        showSearch
                        optionFilterProp="label"
                        placeholder="Select drop station"
                        disabled={!boardingStationId}
                        options={dropStationOptions.map(station => ({ label: station.name, value: station.id }))}
                    />
                </Flex>

                <PassengerCounter value={passengerCount} onChange={setPassengerCount} />

                <Button
                    onClick={handleSave}
                    disabled={!canSave}
                    danger
                    type="primary"
                    size="large"
                    style={{ borderRadius: 12, fontWeight: 500 }}
                >
                    Update
                </Button>
            </Flex>
        </DrawerModal>
    );
}
