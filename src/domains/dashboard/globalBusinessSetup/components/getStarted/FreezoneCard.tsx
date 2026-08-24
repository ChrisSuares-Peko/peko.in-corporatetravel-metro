import React from 'react';

import { GlobalOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';

import SelectableCard from './SelectableCard';

interface FreezoneCardProps {
    label: string;
    selected: boolean;
    onSelect: () => void;
}

const FreezoneCard: React.FC<FreezoneCardProps> = ({ label, selected, onSelect }) => (
    <SelectableCard selected={selected} onClick={onSelect}>
        <Flex align="center" gap={12}>
            <Flex
                justify="center"
                align="center"
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#FFF0F0',
                    flexShrink: 0,
                }}
            >
                <GlobalOutlined style={{ fontSize: 16, color: '#FF4F4F' }} />
            </Flex>
            <Typography.Text className="text-base text-neutral-900">{label}</Typography.Text>
        </Flex>
    </SelectableCard>
);

export default FreezoneCard;
