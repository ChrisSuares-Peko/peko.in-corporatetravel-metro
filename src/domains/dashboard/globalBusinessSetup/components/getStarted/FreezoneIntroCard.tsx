import React from 'react';

import { Avatar, Flex, Typography } from 'antd';

interface FreezoneIntroCardProps {
    logo?: string;
    title: string;
    description?: string;
}

const FreezoneIntroCard: React.FC<FreezoneIntroCardProps> = ({ logo, title, description }) => (
    <Flex gap={16} align="flex-start">
        <div className="rounded-xl border border-stone-200 p-2 shrink-0" style={{ lineHeight: 0 }}>
            <Avatar
                src={
                    <img
                        src={logo || '/images/placeholder-image.png'}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        alt={`${title} logo`}
                    />
                }
                size={58}
                shape="square"
                style={{ borderRadius: 6, background: '#fff' }}
            />
        </div>
        <Flex vertical gap={6}>
            <Typography.Text className="text-xl font-semibold text-neutral-900">
                {title}
            </Typography.Text>
            {description && (
                <Typography.Text className="text-base text-neutral-500 leading-snug">
                    {description}
                </Typography.Text>
            )}
        </Flex>
    </Flex>
);

export default FreezoneIntroCard;
