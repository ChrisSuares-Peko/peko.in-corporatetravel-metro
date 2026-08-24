import { useRef, useState, type FC } from 'react';

import {
    AimOutlined,
    CloseOutlined,
    CompassOutlined,
    EnvironmentFilled,
    SearchOutlined,
} from '@ant-design/icons';
import { Flex, Input, Modal, Spin, Typography } from 'antd';

import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import LocationMapStep from './LocationMapStep';
import { useCitySearch } from '../../hooks/useCitySearch';
import { getPosition } from '../../hooks/useCurrentLocation';
import { geocodeFirstMatch, useNominatimSearch } from '../../hooks/useNominatimSearch';
import { RecentLocation, useRecentLocations } from '../../hooks/useRecentLocations';
import { SelectedCity } from '../../utils/indianCityStdCodes';

const DEFAULT_MAP_CENTER = { lat: 28.6139, lng: 77.209 };
const PINCODE_RE = /^\d{6}$/;

const { Text } = Typography;

interface LocationModalProps {
    open: boolean;
    onClose: () => void;
    selectedCity: SelectedCity | null;
    onSelect: (city: SelectedCity) => void;
}

interface LocationRowProps {
    label: string;
    pincode?: string;
    state?: string;
    active?: boolean;
    onClick: () => void;
}

const LocationRow: FC<LocationRowProps> = ({ label, pincode, state, active, onClick }) => (
    <Flex
        align="center"
        gap={12}
        onClick={onClick}
        className={`w-full cursor-pointer rounded-xl px-2 py-2.5 transition-colors hover:bg-[#f7f7f7] ${
            active ? 'bg-[#f7f7f7]' : ''
        }`}
    >
        <EnvironmentFilled className="shrink-0 text-lg text-bgOrange" />
        <Flex vertical gap={2} className="min-w-0">
            <Text className="truncate text-[15px] font-medium text-[#0a0a0a]">{label}</Text>
            {(pincode || state) && (
                <Flex align="center" gap={6} className="text-[13px] text-[#6b6b6b]">
                    {pincode && <span>{pincode}</span>}
                    {pincode && state && <span className="h-1 w-1 rounded-full bg-[#6b6b6b]" />}
                    {state && <span>{state}</span>}
                </Flex>
            )}
        </Flex>
    </Flex>
);

/**
 * "Select a location" modal (original layout): search + tabs + recents on step 1;
 * Leaflet pin-confirm on step 2. Step-1 search uses Nominatim (map pan) plus the
 * existing city/pincode index (direct select).
 */
const LocationModal: FC<LocationModalProps> = ({ open, onClose, selectedCity, onSelect }) => {
    const dispatch = useAppDispatch();
    const { options, isSearching, search: citySearch } = useCitySearch();
    const { options: placeOptions, isSearching: isPlaceSearching, search: placeSearch } =
        useNominatimSearch();
    const { recents, addRecent } = useRecentLocations();
    const [query, setQuery] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [isLocatingOnMap, setIsLocatingOnMap] = useState(false);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'current' | 'map'>('current');
    const cancelledRef = useRef(false);

    const handleQuery = (v: string) => {
        setQuery(v);
        citySearch(v);
        placeSearch(v);
    };

    const close = () => {
        cancelledRef.current = true;
        setQuery('');
        setMapCenter(null);
        onClose();
    };

    const commit = (city: SelectedCity, extra?: { pincode?: string; state?: string }) => {
        onSelect(city);
        addRecent({ ...city, ...extra });
        close();
    };

    const handleCurrentLocation = async () => {
        cancelledRef.current = false;
        setActiveTab('current');
        setIsDetecting(true);
        const pos = await getPosition();
        setIsDetecting(false);
        if (cancelledRef.current) return;
        if (!pos) {
            dispatch(
                showToast({
                    description: "Couldn't detect your location. Please try again.",
                    variant: 'error',
                })
            );
            return;
        }
        setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    };

    const handleLocateOnMap = async () => {
        cancelledRef.current = false;
        setActiveTab('map');
        setIsLocatingOnMap(true);
        const center = selectedCity
            ? (await geocodeFirstMatch(selectedCity.name)) || DEFAULT_MAP_CENTER
            : DEFAULT_MAP_CENTER;
        setIsLocatingOnMap(false);
        if (cancelledRef.current) return;
        setMapCenter(center);
    };

    const openMapAtPlace = (lat: number, lng: number) => {
        cancelledRef.current = false;
        setMapCenter({ lat, lng });
    };

    const showResults = query.trim().length > 0;
    const isSearchLoading = isSearching || isPlaceSearching;

    const renderSearchResults = () => {
        if (isSearchLoading) {
            return (
                <Flex justify="center" className="py-6">
                    <Spin />
                </Flex>
            );
        }

        const hasPlaces = placeOptions.length > 0;
        const hasCities = options.length > 0;

        if (!hasPlaces && !hasCities) {
            return (
                <Text className="block px-2 py-6 text-center text-gray-400">
                    No location found
                </Text>
            );
        }

        return (
            <>
                {hasPlaces && (
                    <>
                        <Text className="mb-2 block px-2 text-[13px] font-semibold text-[#999]">
                            Places on map
                        </Text>
                        {placeOptions.map(opt => (
                            <LocationRow
                                key={`${opt.lat}-${opt.lng}`}
                                label={opt.label}
                                onClick={() => openMapAtPlace(opt.lat, opt.lng)}
                            />
                        ))}
                    </>
                )}
                {hasCities && (
                    <>
                        {hasPlaces && <div className="my-2 h-px bg-[#eee]" />}
                        <Text className="mb-2 block px-2 text-[13px] font-semibold text-[#999]">
                            {PINCODE_RE.test(query.trim()) ? 'Pincode' : 'Cities'}
                        </Text>
                        {options.map(o => (
                            <LocationRow
                                key={o.value || o.label}
                                label={o.label}
                                pincode={o.pincode}
                                state={o.state}
                                active={
                                    o.value
                                        ? selectedCity?.code === o.value
                                        : selectedCity?.name === o.label
                                }
                                onClick={() =>
                                    commit(
                                        { name: o.label, code: o.value },
                                        { pincode: o.pincode, state: o.state }
                                    )
                                }
                            />
                        ))}
                    </>
                )}
            </>
        );
    };

    return (
        <Modal
            open={open}
            onCancel={close}
            footer={null}
            closable={false}
            centered
            width={680}
            styles={{ content: { borderRadius: 20, padding: 28 } }}
        >
            {mapCenter ? (
                <LocationMapStep
                    initialCenter={mapCenter}
                    onBack={() => setMapCenter(null)}
                    onClose={close}
                    onConfirm={commit}
                />
            ) : (
                <>
                    <Flex align="start" justify="space-between" className="mb-6">
                        <Flex vertical gap={4} className="min-w-0 pe-4">
                            <Text className="text-2xl font-semibold text-[#1e293b]">
                                Select a location
                            </Text>
                            <Text className="text-[15px] text-[#6a7282]">
                                Products and prices depend on where your order ships.
                            </Text>
                        </Flex>
                        <button
                            type="button"
                            onClick={close}
                            aria-label="Close"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5]"
                        >
                            <CloseOutlined className="text-[#6a7282]" />
                        </button>
                    </Flex>

                    <Input
                        size="large"
                        allowClear
                        value={query}
                        onChange={e => handleQuery(e.target.value)}
                        placeholder="Search area, locality or pincode"
                        prefix={<SearchOutlined className="me-1 text-[#bdbdbd]" />}
                        className="!h-14 !rounded-2xl !border-[#dce5ee] !bg-[#f8fafc] text-base"
                    />

                    <Flex align="start" className="mt-4 w-full">
                        <button
                            type="button"
                            onClick={handleCurrentLocation}
                            disabled={isDetecting}
                            className={`flex flex-1 items-center justify-center gap-2 border-b-[3px] pb-3 text-[15px] font-medium disabled:opacity-60 ${
                                activeTab === 'current'
                                    ? 'border-bgOrange text-bgOrange'
                                    : 'border-transparent text-[#1e293b]'
                            }`}
                        >
                            {isDetecting ? <Spin size="small" /> : <AimOutlined />}
                            Use my current location
                        </button>
                        <button
                            type="button"
                            onClick={handleLocateOnMap}
                            disabled={isLocatingOnMap}
                            className={`flex flex-1 items-center justify-center gap-2 border-b-[3px] pb-3 text-[15px] font-medium disabled:opacity-60 ${
                                activeTab === 'map'
                                    ? 'border-bgOrange text-bgOrange'
                                    : 'border-transparent text-[#1e293b]'
                            }`}
                        >
                            {isLocatingOnMap ? <Spin size="small" /> : <CompassOutlined />}
                            Locate on map
                        </button>
                    </Flex>

                    <div className="mt-6 max-h-[320px] overflow-auto">
                        {showResults ? (
                            renderSearchResults()
                        ) : (
                            <>
                                <Text className="mb-3 block text-[15px] font-semibold text-[#999]">
                                    Recent locations
                                </Text>
                                {recents.length ? (
                                    recents.map((r: RecentLocation) => (
                                        <LocationRow
                                            key={r.code}
                                            label={r.name}
                                            pincode={r.pincode}
                                            state={r.state}
                                            active={selectedCity?.code === r.code}
                                            onClick={() =>
                                                commit(
                                                    { name: r.name, code: r.code },
                                                    { pincode: r.pincode, state: r.state }
                                                )
                                            }
                                        />
                                    ))
                                ) : (
                                    <Text className="block px-2 py-4 text-gray-400">
                                        Search a city or pincode to get started.
                                    </Text>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </Modal>
    );
};

export default LocationModal;
