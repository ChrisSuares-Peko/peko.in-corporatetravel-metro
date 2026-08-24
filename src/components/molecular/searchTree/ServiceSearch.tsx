import React, { useEffect, useRef, useState } from 'react';

import { HistoryOutlined } from '@ant-design/icons';
import { Input, Typography, Card, Flex, InputRef } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import useServiceSearch from '@src/hooks/useServiceSearch';
import { paths } from '@src/routes/paths';

import searchIcon from '../../../assets/icons/searchIcon.svg';

type ServiceSearchProps = {
    classes?: string;
    variant: 'filled' | 'outlined' | 'borderless';
};
const ServiceSearch = ({ classes, variant }: ServiceSearchProps) => {
    let toggleTimeout: any;
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const { histories, services, getHistories, saveSearch } = useServiceSearch(searchValue);
    const inputRef = useRef<InputRef | null>(null);

    const handleFocus = () => {
        setDropdownVisible(true);
    };
    const handleBlur = () => {
        toggleTimeout = setTimeout(() => {
            inputRef.current?.blur();
            setDropdownVisible(false);
        }, 1000);
    };

    const handleServiceSelect = (service: any) => {
        setSelectedService(service);
        setSearchValue(service.name);
        getHistories();
        navigate(
            paths.dashboard?.[
                service.pathKey as keyof typeof paths.dashboard
            ] as (typeof paths.dashboard)[keyof typeof paths.dashboard]
        );
    };
    const handleSearchChange = (e: any) => {
        setSearchValue(e.target.value);
        setDropdownVisible(true);
    };

    useEffect(() => {
        setDropdownVisible(false);
        return () => {
            clearTimeout(toggleTimeout);
        };
    }, [pathname, toggleTimeout]);
    useEffect(() => {
        if (
            pathname !==
            (paths.dashboard?.[
                selectedService?.pathKey as keyof typeof paths.dashboard
            ] as (typeof paths.dashboard)[keyof typeof paths.dashboard])
        ) {
            setSelectedService(null);
            setSearchValue('');
        }
    }, [pathname, selectedService?.pathKey]);

    return (
        <div className="w-full max-w-x h-full mx-auto relative" onMouseLeave={handleBlur}>
            <Input
                size="large"
                placeholder="Search for services and features"
                suffix={
                    <ReactSVG
                        beforeInjection={svg => {
                            svg.setAttribute('style', 'width: 23px; height: 23px;');
                        }}
                        src={searchIcon}
                        className="text-base text-center"
                    />
                }
                value={searchValue}
                allowClear
                onChange={handleSearchChange}
                onFocus={handleFocus}
                className="w-full rounded-lg border-none"
                ref={inputRef}
                variant={variant}
                rootClassName="custom-search-input" // ✅ Apply class to wrapper
            />
            {dropdownVisible && (
                <Card
                    className={`w-full ${classes} shadow-lg rounded-none rounded-b-2xl border-t-0 absolute z-10 bg-white`}
                    bodyStyle={{
                        padding: '15px',
                        marginRight: '10px',
                    }}
                >
                    <Flex vertical className="px-2">
                        <Flex vertical gap={10}>
                            {services.map((service, index) => (
                                <Flex
                                    gap={10}
                                    align="center"
                                    key={index}
                                    className="w-full p-1 hover:bg-gray-50 rounded cursor-pointer"
                                    onClick={() => {
                                        handleServiceSelect(service);
                                        saveSearch(service?.name);
                                    }}
                                >
                                    <ReactSVG
                                        beforeInjection={svg => {
                                            svg.setAttribute('style', 'width: 16px; height: 16px;');
                                        }}
                                        src={searchIcon}
                                        className="text-base text-center"
                                    />

                                    <Typography.Text>{service.name}</Typography.Text>
                                </Flex>
                            ))}
                            {services.length <= 0 &&
                                histories.map((option, index) => (
                                    <Flex
                                        gap={10}
                                        align="center"
                                        key={index}
                                        className="w-full p-1 hover:bg-gray-50 rounded cursor-pointer"
                                        onClick={() => setSearchValue(option)}
                                    >
                                        <HistoryOutlined
                                            className="text-xs mt-[0.1rem]"
                                            size={10}
                                        />
                                        <Typography.Text>{option}</Typography.Text>
                                    </Flex>
                                ))}
                            {histories.length === 0 && (
                                <Typography.Text className="text-center py-4 text-gray-500">
                                    No search history found
                                </Typography.Text>
                            )}
                        </Flex>
                    </Flex>
                </Card>
            )}
        </div>
    );
};

export default ServiceSearch;
