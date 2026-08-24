import type { KeyboardEvent } from 'react';

import { GlobalOutlined } from '@ant-design/icons';
import { Radio, Typography, Row, Col, Space } from 'antd';
import type { RadioChangeEvent } from 'antd';

const { Text } = Typography;

type TravelType = 'single' | 'multi';

type TravelTypeSelectorProps = {
    value: TravelType;
    onChange: (value: TravelType) => void;
};

export const TravelTypeSelector = ({ value, onChange }: TravelTypeSelectorProps) => {
    const handleRadioChange = (e: RadioChangeEvent) => {
        const nextValue = e.target.value;
        if (nextValue === 'single' || nextValue === 'multi') {
            onChange(nextValue);
        }
    };

    const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, selectedValue: TravelType) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onChange(selectedValue);
        }
    };

    return (
        <div className="esim-travel-type-section">
            <Space align="center" className="mb-4">
                <GlobalOutlined className="text-red-500" style={{ fontSize: 16 }} />
                <Text strong className="text-[17px]">Travel Type</Text>
            </Space>

            <Radio.Group value={value} onChange={handleRadioChange} className="w-full">
                <Row gutter={16}>
                    <Col span={24} sm={12}>
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => onChange('single')}
                            onKeyDown={event => handleCardKeyDown(event, 'single')}
                            className={`esim-travel-card ${
                                value === 'single' ? 'esim-travel-card-active' : ''
                            }`}
                        >
                            <Radio value="single" checked={value === 'single'} className="mt-1" />

                            <div>
                                <Text className="block font-medium text-[16px]">
                                    International Travel
                                </Text>
                                <Text className="block text-sm text-gray-500">
                                    Traveling to a single country
                                </Text>
                            </div>
                        </div>
                    </Col>

                    <Col span={24} sm={12}>
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => onChange('multi')}
                            onKeyDown={event => handleCardKeyDown(event, 'multi')}
                            className={`esim-travel-card ${
                                value === 'multi' ? 'esim-travel-card-active' : ''
                            }`}
                        >
                            <Radio value="multi" checked={value === 'multi'} className="mt-1" />

                            <div>
                                <Text className="block font-medium text-[16px]">
                                    Multi-Country Trip
                                </Text>
                                <Text className="block text-sm text-gray-500">
                                    Traveling to multiple countries
                                </Text>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Radio.Group>
        </div>
    );
};
