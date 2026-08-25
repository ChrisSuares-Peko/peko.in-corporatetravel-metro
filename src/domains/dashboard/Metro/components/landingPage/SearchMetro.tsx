import { useEffect, useMemo, useState } from 'react';

import { Button, Flex, Select, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';

import cityIcon from '../../assets/icons/cityIcon.svg';
import stationIcon from '../../assets/icons/stationIcon.svg';
import useMetroCities from '../../hooks/useMetroCities';
import useMetroStations from '../../hooks/useMetroStations';
import { setMetroJourney } from '../../slices/metroSlice';
import PassengerCounter from '../shared/PassengerCounter';

const INPUT_STYLE: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1px solid #d9d9d9',
    borderRadius: 12,
    padding: '0 18px',
    background: 'white',
    height: 60,
};

export default function SearchMetro() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { cities } = useMetroCities();

    const [cityId, setCityId] = useState<string | null>(null);
    const [boardingStationId, setBoardingStationId] = useState<string | null>(null);
    const [dropStationId, setDropStationId] = useState<string | null>(null);
    const [passengerCount, setPassengerCount] = useState(1);

    const { stations } = useMetroStations(cityId);

    // Drop list excludes whichever station is currently selected as Boarding —
    // recomputed live whenever the station list or boarding selection changes.
    const dropStationOptions = useMemo(
        () => stations.filter(station => station.id !== boardingStationId),
        [stations, boardingStationId]
    );

    // If the user changes Boarding after already picking Drop and the current
    // Drop is no longer valid (e.g. it became the new Boarding station), clear it.
    useEffect(() => {
        if (dropStationId && !dropStationOptions.some(station => station.id === dropStationId)) {
            setDropStationId(null);
        }
    }, [dropStationOptions, dropStationId]);

    const handleCityChange = (value: string) => {
        setCityId(value);
        setBoardingStationId(null);
        setDropStationId(null);
    };

    const canContinue = Boolean(cityId && boardingStationId && dropStationId);

    const handleContinue = () => {
        const city = cities.find(c => c.id === cityId);
        const boardingStation = stations.find(s => s.id === boardingStationId);
        const dropStation = stations.find(s => s.id === dropStationId);

        if (!city || !boardingStation || !dropStation) {
            dispatch(showToast({ description: 'Please complete your journey details.', variant: 'error' }));
            return;
        }

        dispatch(setMetroJourney({
            cityId: city.id,
            cityName: city.name,
            boardingStationId: boardingStation.id,
            boardingStationName: boardingStation.name,
            dropStationId: dropStation.id,
            dropStationName: dropStation.name,
            passengerCount,
        }));
        navigate(`${paths.dashboard.corporateTravel}/${paths.metro.index}/${paths.metro.results}`);
    };

    return (
        <Flex vertical gap={20}>
            {/* Recharge Smart Card entry point */}
            <Flex justify="end">
                <Button
                    className="h-11 px-6 rounded-lg border border-[#FF4F4F] text-[#FF4F4F] bg-white hover:bg-[#fff4f4] hover:text-[#FF4F4F] hover:border-[#FF4F4F]"
                    onClick={() => navigate(`${paths.dashboard.corporateTravel}/${paths.metro.index}/${paths.metro.smartCard}`)}
                >
                    Recharge Smart Card
                </Button>
            </Flex>

            <Flex gap={16} wrap="wrap" align="flex-end">
                {/* City */}
                <Flex vertical gap={6} style={{ flex: 1, minWidth: 180 }}>
                    <Typography.Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', fontWeight: 700 }}>
                        City
                    </Typography.Text>
                    <div style={INPUT_STYLE}>
                        <img src={cityIcon} width={24} height={24} style={{ flexShrink: 0 }} alt="" />
                        <Select
                            value={cityId ?? undefined}
                            onChange={handleCityChange}
                            variant="borderless"
                            placeholder="Select city"
                            options={cities.map(city => ({ label: city.name, value: city.id }))}
                            className="[&_.ant-select-selection-item]:!text-[18px] [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-[#101010]"
                            style={{ flex: 1 }}
                        />
                    </div>
                </Flex>

                {/* Boarding Point */}
                <Flex vertical gap={6} style={{ flex: 1, minWidth: 180 }}>
                    <Typography.Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', fontWeight: 700 }}>
                        Boarding Point
                    </Typography.Text>
                    <div style={INPUT_STYLE}>
                        <img src={stationIcon} width={24} height={24} style={{ flexShrink: 0 }} alt="" />
                        <Select
                            value={boardingStationId ?? undefined}
                            onChange={setBoardingStationId}
                            variant="borderless"
                            placeholder={cityId ? 'Select boarding station' : 'Select a city first'}
                            disabled={!cityId}
                            showSearch
                            optionFilterProp="label"
                            options={stations.map(station => ({ label: station.name, value: station.id }))}
                            className="[&_.ant-select-selection-item]:!text-[18px] [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-[#101010]"
                            style={{ flex: 1 }}
                        />
                    </div>
                </Flex>

                {/* Drop Point */}
                <Flex vertical gap={6} style={{ flex: 1, minWidth: 180 }}>
                    <Typography.Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', fontWeight: 700 }}>
                        Drop Point
                    </Typography.Text>
                    <div style={INPUT_STYLE}>
                        <img src={stationIcon} width={24} height={24} style={{ flexShrink: 0 }} alt="" />
                        <Select
                            value={dropStationId ?? undefined}
                            onChange={setDropStationId}
                            variant="borderless"
                            placeholder={boardingStationId ? 'Select drop station' : 'Select boarding point first'}
                            disabled={!boardingStationId}
                            showSearch
                            optionFilterProp="label"
                            options={dropStationOptions.map(station => ({ label: station.name, value: station.id }))}
                            className="[&_.ant-select-selection-item]:!text-[18px] [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-[#101010]"
                            style={{ flex: 1 }}
                        />
                    </div>
                </Flex>
            </Flex>

            <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
                <div style={{ maxWidth: 260 }}>
                    <PassengerCounter value={passengerCount} onChange={setPassengerCount} />
                </div>

                <Button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    danger
                    type="primary"
                    size="large"
                    style={{ height: 60, paddingInline: 36, borderRadius: 12, fontWeight: 500, fontSize: 18 }}
                >
                    Continue
                </Button>
            </Flex>
        </Flex>
    );
}
