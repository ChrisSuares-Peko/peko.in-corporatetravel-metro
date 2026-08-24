import { ReactNode, useEffect, useMemo, useState } from 'react';

import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Tabs } from 'antd';
import type { TabsProps } from 'antd/lib';

import ComingSoon from './ComingSoon';
import { DashboardNavProvider } from './dashboardNav';
import { getTabLabel } from '../../utils/helpers';
import { TabItem } from '../../utils/types';

interface TabbedDashboardProps {
    tabs: TabItem[];
    content: Record<string, ReactNode>;
    defaultTab?: string;
}

const TabbedDashboard = ({ tabs, content, defaultTab = 'dashboard' }: TabbedDashboardProps) => {
    const [activeKey, setActiveKey] = useState(defaultTab);

    // Switching tabs (main tab bar, a dropdown child, or a "View all" link via DashboardNavProvider)
    // swaps `content[activeKey]` in place — no route change, so nothing resets the scroll position on
    // its own, and the new section could open scrolled to wherever the previous one was left (ADO
    // 29052). #myContainer is the actual scrollable region (see layouts/DashboardLayout.tsx); this is
    // the same reset idiom already used by useScrollToTop / useScrollUpOnPageChange elsewhere.
    useEffect(() => {
        window.scrollTo(0, 0);
        document.getElementById('myContainer')?.scrollTo(0, 0);
    }, [activeKey]);

    const tabsActiveKey = useMemo(() => {
        const parent = tabs.find(tab => tab.children?.some(c => c.key === activeKey));
        return parent ? parent.key : activeKey;
    }, [activeKey, tabs]);

    const tabItems = useMemo<TabsProps['items']>(
        () =>
            tabs.map(tab => {
                if (tab.children?.length) {
                    return {
                        key: tab.key,
                        label: (
                            <Dropdown
                                menu={{
                                    items: tab.children.map(child => ({
                                        key: child.key,
                                        label: child.label,
                                    })),
                                    onClick: ({ key }) => setActiveKey(key),
                                }}
                                trigger={['click']}
                            >
                                <span className="flex items-center gap-1">
                                    {tab.label}
                                    <DownOutlined className="text-xs" />
                                </span>
                            </Dropdown>
                        ),
                    };
                }
                return { key: tab.key, label: tab.label };
            }),
        [tabs]
    );

    const handleTabChange = (key: string) => {
        const tab = tabs.find(t => t.key === key);
        if (!tab?.children?.length) setActiveKey(key);
    };

    const activeContent = content[activeKey] ?? <ComingSoon title={getTabLabel(tabs, activeKey)} />;

    return (
        <div className="flex flex-col gap-6">
            <Tabs
                activeKey={tabsActiveKey}
                onChange={handleTabChange}
                items={tabItems}
                className="-mb-4"
            />
            <DashboardNavProvider value={setActiveKey}>{activeContent}</DashboardNavProvider>
        </div>
    );
};

export default TabbedDashboard;
