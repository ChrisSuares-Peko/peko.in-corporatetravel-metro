import { QuestionCircleOutlined, UserOutlined } from '@ant-design/icons';
import { MenuProps } from 'antd';

import SettingIcon from '@assets/icons/Settings.svg';
import LogoutIcon from '@assets/svg/Logout.svg';

export const corporateDropdownItems: MenuProps['items'] = [
    { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
     {
        key: 'settings',
        label: 'Settings',
        icon: <img src={SettingIcon} alt="" style={{ width: 14, height: 14 }} />,
    },
    { key: 'help', label: 'Help center', icon: <QuestionCircleOutlined /> },
    { type: 'divider' as const },
    {
        key: 'logout',
        label: 'Log out',
        icon: <img src={LogoutIcon} alt="" style={{ width: 14, height: 14 }} />,
    },
];

export const systemDropdownItems: MenuProps['items'] = [
    { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
    { type: 'divider' as const },
    {
        key: 'logout',
        label: 'Log out',
        icon: <img src={LogoutIcon} alt="" style={{ width: 14, height: 14 }} />,
    },
];
