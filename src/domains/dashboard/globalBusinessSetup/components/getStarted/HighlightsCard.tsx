import React from 'react';

import { Flex, Typography } from 'antd';

interface HighlightsCardProps {
    html?: string;
}

const HighlightsCard: React.FC<HighlightsCardProps> = ({ html }) => {
    if (!html) return null;

    return (
        <Flex
            vertical
            gap={14}
            className="rounded-3xl bg-white"
            style={{
                border: '1px solid #E5E7EB',
                padding: '30px 32px',
                boxShadow: '0px 1.5px 16.5px 0px rgba(0, 0, 0, 0.06)',
                marginTop: 16,
            }}
        >
            <Typography.Text className="text-lg font-semibold text-neutral-900">
                What&apos;s Included
            </Typography.Text>
            <div
                className="text-sm text-neutral-700 leading-relaxed peko-highlights"
                // Vendor-controlled HTML; mirrors vendor's QuoteCard pattern.
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </Flex>
    );
};

export default HighlightsCard;
