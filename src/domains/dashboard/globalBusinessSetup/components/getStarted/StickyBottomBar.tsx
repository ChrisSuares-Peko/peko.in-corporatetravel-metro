import React from 'react';

import { Button, Flex, Typography } from 'antd';

interface BreadcrumbItem {
    label: string;
    icon?: React.ReactNode;
}

interface StickyBottomBarProps {
    breadcrumb: BreadcrumbItem[];
    primaryLabel?: string;
    primaryDisabled?: boolean;
    primaryLoading?: boolean;
    onPrimary?: () => void;
    onReset: () => void;
    // Get Quote's detail view has per-card Proceed buttons, so the sticky bar
    // there shows breadcrumb + Reset only.
    hidePrimary?: boolean;
}

const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
    breadcrumb,
    primaryLabel,
    primaryDisabled,
    primaryLoading,
    onPrimary,
    onReset,
    hidePrimary = false,
}) => {
    if (breadcrumb.length === 0) return null;

    return (
        <div
            style={{
                position: 'sticky',
                bottom: 16,
                marginTop: 24,
                zIndex: 5,
            }}
        >
            <Flex
                align="center"
                justify="space-between"
                gap={16}
                wrap="wrap"
                className="bg-white"
                style={{
                    borderRadius: 16,
                    boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
                    padding: '12px 20px',
                    border: '1px solid #F3F4F6',
                }}
            >
                <Flex align="center" gap={12} wrap="wrap">
                    {breadcrumb.map((item, idx) => (
                        <React.Fragment key={idx}>
                            <Flex align="center" gap={8}>
                                {item.icon}
                                <Typography.Text className="text-sm text-neutral-700">
                                    {item.label}
                                </Typography.Text>
                            </Flex>
                            {idx < breadcrumb.length - 1 && (
                                <span style={{ color: '#D4D4D8' }}>•</span>
                            )}
                        </React.Fragment>
                    ))}
                </Flex>
                <Flex gap={8}>
                    <Button type="default" onClick={onReset} danger>
                        Reset
                    </Button>
                    {!hidePrimary && onPrimary && (
                        <Button
                            type="primary"
                            danger
                            disabled={primaryDisabled}
                            loading={primaryLoading}
                            onClick={onPrimary}
                        >
                            {primaryLabel}
                        </Button>
                    )}
                </Flex>
            </Flex>
        </div>
    );
};

export default StickyBottomBar;
