import { SmileOutlined } from '@ant-design/icons';
import { Content } from 'antd/es/layout/layout';

import { useAppSelector } from '@src/hooks/store';

import NotificationCard from './NotificationCard';

const NotificationsList = () => {
    const { notifications } = useAppSelector(state => state.reducer.user);

    return (
        <div className=" max-h-80 overflow-y-scroll w-[24rem]">
            {notifications && notifications.data && notifications.data.length > 0 ? (
                Array.isArray(notifications?.data) &&
                notifications?.data?.map(notification => (
                    <NotificationCard
                        key={notification.id}
                        notification={notification.notificationBrief}
                        date={notification.createdAt}
                        notificationTitle={notification.notificationTitle}
                    />
                ))
            ) : (
                <Content style={{ textAlign: 'center' }} className="py-6">
                    <SmileOutlined className="text-gray-500" style={{ fontSize: 20 }} />
                    <p className="text-gray-500">No notifications available</p>
                </Content>
            )}
        </div>
    );
};

export default NotificationsList;
