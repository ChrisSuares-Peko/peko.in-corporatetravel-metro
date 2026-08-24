import { ReactNode } from 'react';

import { Button, Typography } from 'antd';

import { cn } from '../../utils/cn';

const { Text } = Typography;

interface SectionCardProps {
    title: string;
    /** Small muted text after the title, e.g. "(4 Active)". */
    badge?: string;
    /** Muted caption directly under the title, e.g. "Last 30 days · card transactions". */
    subtitle?: ReactNode;
    /** Right-aligned action, typically a "View all" link. */
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    /** Extra classes for the body wrapper (e.g. to remove default flex). */
    bodyClassName?: string;
}

/** White rounded panel with a title row + optional badge/action and a body. */
const SectionCard = ({
    title,
    badge,
    subtitle,
    action,
    children,
    className,
    bodyClassName,
}: SectionCardProps) => (
    <section
        className={cn(
            'flex flex-col rounded-2xl border border-borderCard bg-white p-5 xl:p-6',
            className
        )}
    >
        <header className="flex items-start justify-between gap-3 pb-4">
            <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                    <Text className=" font-semibold text-textHeadings xl:text-base">
                        {title}
                    </Text>
                    {badge && <Text className="text-xs text-textGreyLight">{badge}</Text>}
                </div>
                {subtitle && <Text className="text-xs text-textGreyLight">{subtitle}</Text>}
            </div>
            {action}
        </header>
        <div className="-mx-5 mb-4 border-b border-borderDivider xl:-mx-6" />
        <div className={cn('flex-1', bodyClassName)}>{children}</div>
    </section>
);

interface ViewAllLinkProps {
    label?: string;
    onClick?: () => void;
}

/** Brand-red text action used in section headers (antd link Button). */
export const ViewAllLink = ({ label = 'View all', onClick }: ViewAllLinkProps) => (
    <Button
        type="link"
        size="small"
        onClick={onClick}
        className="!px-0 text-sm font-medium !text-textLightRed"
    >
        {label}
    </Button>
);

export default SectionCard;
