import React, { useState } from 'react';

import { MenuOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Flex, Grid, Image, Typography, theme } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

import NotificationIcon from '@assets/icons/Notification.svg';
import Support from '@assets/icons/Support.svg';
import Logo from '@assets/mainLogo/Logo.png';
import LogoutIcon from '@assets/svg/Logout.svg';
import pekoConnectMobile from '@assets/svg/pekoConnectMobile.svg';
import { UserRole } from '@customtypes/general';
import { useCompanyNameFallback } from '@domains/dashboard/profile/hooks/useCompanyNameFallback';
import { useAppSelector } from '@src/hooks/store';
import useNotificationApi from '@src/hooks/useNotificationApi';
import { paths } from '@src/routes/paths';
import { handleLogout } from '@src/services/handleLogout';
import { formatNumberWithLocalString } from '@utils/priceFormat';

const { Text } = Typography;
type MobileHeaderType = {
    handleDraggerOpen: () => void;
};
const MobileHeader = ({ handleDraggerOpen }: MobileHeaderType) => {
    const { user, notifications } = useAppSelector(state => state.reducer.user);
    const { role } = useAppSelector(state => state.reducer.auth);
    const { resetNotificationCount } = useNotificationApi();
    const { applicationId, name: resolvedName } = useCompanyNameFallback();
    const displayName = resolvedName || applicationId || null;
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const screens = Grid.useBreakpoint();

    const navigate = useNavigate();
    const {
        token: { colorPrimary },
    } = theme.useToken();

    const handleNotificationClick = () => {
        resetNotificationCount();
        navigate(paths.dashboard.notifications);
    };
    return (
        <Flex align="center" justify="space-between" className="pl-4">
            <Flex>
                {/* {isSubroute && (
                    <LeftOutlined
                        className="cursor-pointer"
                        onClick={() => navigate(-1)}
                        style={{ marginRight: '4px', fontSize: '18px' }}
                    />
                )} */}
                {user?.roleName === 'corporate sub user' && (
                    <Button
                        type="text"
                        className="mt-3"
                        style={{ background: '#ffffff' }}
                        icon={<MenuOutlined style={{ fontSize: 20 }} />}
                        onClick={() => handleDraggerOpen()}
                    />
                )}
                <Image
                    src={Logo}
                    alt="logo"
                    className="bg-transparent cursor-pointer"
                    preview={false}
                    width={screens.xs ? 100 : 120}
                    onClick={() => navigate(paths.dashboard.home)}
                />
            </Flex>
            <Flex className="pr-5" gap={16} align="center">
                <Flex vertical className="hidden sm:flex" align="center" justify="center">
                    <Text className="text-xs">Cashback</Text>
                    <Text className="text-sm font-semibold">
                        {`₹ ${formatNumberWithLocalString(user?.balance! ?? 0)}`}
                    </Text>
                </Flex>
                <Avatar
                    alt="Support icon"
                    size={28}
                    shape="square"
                    src={Support}
                    className={`cursor-pointer ${role === UserRole.SYSTEM ? 'hidden' : ''}`}
                    onClick={() => navigate(paths.dashboard.needHelp)}
                />
                {user?.roleName === 'corporate' ? (
                    <Link className='hidden' to={`${paths.dashboard.moreServices}/${paths.pekoConnect.index}`}>
                        <Flex className="cursor-pointer">
                            <Badge size="small" count={0} offset={[-5, 5]}>
                                <Avatar
                                    alt="pekoConnect"
                                    size={28}
                                    shape="square"
                                    src={pekoConnectMobile}
                                    className="cursor-pointer "
                                />
                            </Badge>
                        </Flex>
                    </Link>
                ) : (
                    ''
                )}
                <Badge size="small" count={notifications?.count || 0} offset={[-10, 10]}>
                    <Avatar
                        shape="circle"
                        src={NotificationIcon}
                        className={`cursor-pointer ${role === UserRole.SYSTEM ? 'hidden' : ''}`}
                        onClick={() => handleNotificationClick()}
                    />
                </Badge>
                <Avatar
                    src={user?.logo}
                    alt="profile"
                    className="cursor-pointer bg-[#ffeeee]"
                    draggable={false}
                    onClick={() => {
                        navigate(
                            role === UserRole.CORPORATE
                                ? paths.dashboard.profile
                                : paths.systemUser.profile
                        );
                    }}
                >
                    {displayName ? (
                        <Text style={{ color: colorPrimary }} className="text-2xl font-bold">
                            {displayName.slice(0, 1).toUpperCase()}
                        </Text>
                    ) : (
                        <UserOutlined style={{ color: colorPrimary, fontSize: 18 }} />
                    )}
                </Avatar>
                {role === UserRole.SYSTEM && (
                    <Image
                        alt="LogoutIcon"
                        src={LogoutIcon}
                        preview={false}
                        onClick={async () => {
                            if (!isLoggingOut) {
                                setIsLoggingOut(true);
                                await handleLogout().finally(() => {
                                    setIsLoggingOut(false);
                                });
                            }
                        }}
                        className="pl-4 cursor-pointer"
                    />
                )}
            </Flex>
        </Flex>
    );
};

export default MobileHeader;
