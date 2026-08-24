import { AppstoreFilled, ArrowRightOutlined, FileTextFilled } from '@ant-design/icons';
import { Button, Card, Flex, Typography } from 'antd';

import { TaxService } from '../types';

interface ServiceCardProps {
    service: TaxService;
    locked: boolean;
    onCtaClick?: () => void;
}

interface ServiceConfig {
    iconBgClass: string;
    iconBgStyle?: React.CSSProperties;
    icon: React.ReactNode;
    dotClass: string;
    dotStyle?: React.CSSProperties;
    ctaClass: string;
}

const SERVICE_CONFIG: Record<string, ServiceConfig> = {
    gst: {
        iconBgClass: 'bg-brandColor',
        icon: <FileTextFilled className="text-white text-xl" />,
        dotClass: 'bg-brandColor',
        ctaClass: 'text-brandColor hover:text-iconRed',
    },
    tds: {
        iconBgClass: '',
        iconBgStyle: { backgroundColor: '#6366F1' },
        icon: <AppstoreFilled className="text-white text-xl" />,
        dotClass: '',
        dotStyle: { backgroundColor: '#6366F1' },
        ctaClass: 'text-[#6366F1]',
    },
};

const ServiceCard = ({ service, locked, onCtaClick }: ServiceCardProps) => {
    const config = SERVICE_CONFIG[service.id] ?? SERVICE_CONFIG.gst;

    return (
        <Card
            className="h-full rounded-xl border border-customBorderColor shadow-sm"
            styles={{ body: { padding: '40px 45px' } }}
        >
            <Flex vertical gap={16}>
                <Flex
                    align="center"
                    justify="center"
                    className={`rounded-xl flex-shrink-0 ${config.iconBgClass}`}
                    style={{ width: 48, height: 48, ...config.iconBgStyle }}
                >
                    {config.icon}
                </Flex>

                <Flex vertical gap={6}>
                    <Typography.Title level={4} className="!mb-0 text-valueText">
                        {service.title}
                    </Typography.Title>
                    <Typography.Text className="text-titleText text-sm leading-relaxed">
                        {service.description}
                    </Typography.Text>
                </Flex>

                <Flex vertical gap={8}>
                    {service.features.map(feat => (
                        <Flex key={feat} align="center" gap={10}>
                            <span
                                className={`rounded-full flex-shrink-0 ${config.dotClass}`}
                                style={{ width: 6, height: 6, marginTop: 1, ...config.dotStyle }}
                            />
                            <Typography.Text className="text-sm text-textDarkGray">
                                {feat}
                            </Typography.Text>
                        </Flex>
                    ))}
                </Flex>

                <Button
                    type="link"
                    className={`!px-0 !h-auto font-medium w-fit ${locked ? 'text-textDisabledGray cursor-not-allowed' : config.ctaClass}`}
                    disabled={locked}
                    onClick={!locked ? onCtaClick : undefined}
                    icon={<ArrowRightOutlined style={{ fontSize: 12 }} />}
                    iconPosition="end"
                >
                    {service.ctaLabel}
                </Button>
            </Flex>
        </Card>
    );
};

export default ServiceCard;
