import { useState } from 'react';

import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Divider, Dropdown, Flex, MenuProps, Popover, Typography, theme } from 'antd';
import { IoIosClose } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';

import NotificationIcon from '@assets/icons/Notification.svg';
import pekoConnect from '@assets/svg/pekoConnect.svg';
import ChatService from '@components/molecular/freshChat/service/ChatService';
import SearchTree from '@components/molecular/searchTree/SearchTree';
import ServiceSearch from '@components/molecular/searchTree/ServiceSearch';
import UpgradePlanButton from '@components/molecular/upgradePlanButton';
import { UserRole } from '@customtypes/general';
import { useCompanyNameFallback } from '@domains/dashboard/profile/hooks/useCompanyNameFallback';
import { useAppSelector } from '@src/hooks/store';
import useNotificationApi from '@src/hooks/useNotificationApi';
import useSubUserLogout from '@src/hooks/useSubUserLogout';
import useUserInfo from '@src/hooks/useUserInfo';
import { paths } from '@src/routes/paths';
import { handleLogout } from '@src/services/handleLogout';
import { corporateDropdownItems, systemDropdownItems } from '@utils/navbarData';
import { formatNumberWithLocalString } from '@utils/priceFormat';
import formatString from '@utils/wordFormat';

import NotificationsList from '../NotificationsList';

const { Text } = Typography;

const CustomHeader = () => {
    const { resetNotificationCount } = useNotificationApi();
    useUserInfo();
    useSubUserLogout();
    const navigate = useNavigate();
    const { user, notifications } = useAppSelector(state => state.reducer.user);
    const { roleName, role, sessionId } = useAppSelector(state => state.reducer.auth);
    const freshChatDetails = useAppSelector(state => state.reducer.freshChat);
    const [open, setOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const email: string | undefined =
        roleName === 'corporate sub user' ? user?.subCorporateEmail : user?.email;
    const mobile: string | undefined =
        roleName === 'corporate sub user' ? user?.subCorporateMobile : user?.mobileNo;
    const credentialId: number | undefined =
        roleName === 'corporate sub user' ? user?.subCorporateCredential : user?.credentialId;

    // const restoreId: string | undefined = user?.chatId;
    const restoreId: string | undefined = freshChatDetails?.chatId;
    let userRole: string | undefined;
    let companyName: string | undefined;

    if (user) {
        userRole = user.role;
        // eslint-disable-next-line prefer-destructuring
        companyName = user.companyName;
    }

    const { applicationId, name: resolvedName } = useCompanyNameFallback();
    const isFreelancer = user?.accountType === 'freelancer';
    const displayName = resolvedName || applicationId || 'Registration Pending';

    const isSubCorporate = roleName === 'corporate sub user';
    const currentPlanName = user?.activeGroupPackageName || 'Free';
    const showUpgrade = !user?.isTopPlan;

    const {
        token: { colorPrimary },
    } = theme.useToken();

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };

    const accountMenuItems =
        role === UserRole.CORPORATE ? corporateDropdownItems : systemDropdownItems;

    const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
        if (key === 'profile') {
            navigate(
                role === UserRole.CORPORATE ? paths.dashboard.profile : paths.systemUser.profile
            );
        } else if (key === 'settings') {
            navigate(paths.dashboard.settings);
        } else if (key === 'help') {
            navigate(paths.dashboard.needHelp);
        } else if (key === 'logout') {
            if (!isLoggingOut) {
                setIsLoggingOut(true);
                await handleLogout().finally(() => {
                    setIsLoggingOut(false);
                });
            }
        }
    };

    return (
        <>
            {userRole === 'CORPORATE' && (
                <ChatService
                    name={companyName}
                    email={email}
                    mobile={mobile}
                    credentialId={credentialId}
                    restoreId={restoreId}
                    role={role}
                    sessionId={sessionId}
                />
            )}
            <Flex
                className="hidden w-full lg:flex justify-between gap-8 min-[1402px]:gap-3"
                align="center"
            >
                {role === UserRole.SYSTEM && (
                    <Flex align="center" className="w-4/12">
                        <SearchTree />
                    </Flex>
                )}
                <>
                    {role === UserRole.CORPORATE && (
                        <Flex align="center" className="xl:w-[30%] xxl:w-4/12 mySearchClass">
                            <Flex align="center" className="relative w-full mySearchClass">
                                <ServiceSearch classes="-mt-3" variant="borderless" />
                                <Flex justify="end" align="end">
                                    <Divider type="vertical" className="h-10 mx-0" />
                                </Flex>
                            </Flex>
                        </Flex>
                    )}
                </>
                <Flex justify="flex-end" align="center" className="gap-2 xxl:gap-4 w-full">
                    {role === UserRole.CORPORATE && !isSubCorporate && (
                        <>
                            <Flex align="center" gap={12} className="whitespace-nowrap">
                                <Link to={paths.dashboard.plans}>
                                    <Text className="text-sm cursor-pointer whitespace-nowrap">
                                        Current Plan:{' '}
                                        <span className="font-medium">{currentPlanName}</span>
                                    </Text>
                                </Link>
                                {showUpgrade &&<>
                            <Divider type="vertical" className="flex-shrink-0 h-10" />
                            <UpgradePlanButton />
                                </> 
                                }
                            </Flex>
                            <Divider type="vertical" className="flex-shrink-0 h-10" />
                        </>
                    )}

                    {/* WALLET TEMPORARILY HIDDEN
                    {!isSubCorporate && (
                        <>
                            <Link to={paths.pekoWallet.index}>
                                <Flex
                                    vertical
                                    align="center"
                                    justify="center"
                                    className="whitespace-nowrap"
                                >
                                    <Typography.Text className="text-xs">Wallet</Typography.Text>
                                    <Typography.Text className="text-sm font-semibold">
                                        {`₹ ${formatNumberWithLocalString(user?.balance ?? 0)}`}
                                    </Typography.Text>
                                </Flex>
                            </Link>
                            <Divider type="vertical" className="h-12" />
                        </>
                    )}
                    */}

                    {role === UserRole.CORPORATE && (
                        <>
                            {/* Peko Connect hidden until chat is wired up */}
                            <>
                                <Link
                                    className="hidden"
                                    to={`${paths.dashboard.moreServices}/${paths.pekoConnect.index}`}
                                >
                                    <Flex className="cursor-pointer">
                                        <Badge count={0} offset={[-5, 5]}>
                                            <Avatar
                                                size={32}
                                                shape="square"
                                                src={pekoConnect}
                                                className="cursor-pointer"
                                            />
                                        </Badge>
                                    </Flex>
                                </Link>
                                <Divider rootClassName="hidden" type="vertical" className="h-10" />
                            </>

                            <Popover
                                content={
                                    <div className="px-4">
                                        {NotificationsList()}
                                        <Flex className="w-full py-4" justify="end">
                                            {(notifications?.data?.length ?? 0) > 0 && (
                                                <Link to={paths.dashboard.notifications}>
                                                    <Text
                                                        className="text-sm"
                                                        style={{ color: colorPrimary }}
                                                        onClick={() => {
                                                            resetNotificationCount();
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        See More
                                                    </Text>
                                                </Link>
                                            )}
                                        </Flex>
                                    </div>
                                }
                                trigger="hover"
                                styles={{ body: { padding: 0, minWidth: 260 } }}
                                open={open}
                                title={() => (
                                    <Flex className="px-8 py-4 border-b" justify="space-between">
                                        <Text className="text-lg font-semibold">Notifications</Text>
                                        <IoIosClose
                                            className="text-2xl cursor-pointer text-black/45"
                                            onClick={() => setOpen(false)}
                                        />
                                    </Flex>
                                )}
                                placement="bottomRight"
                                onOpenChange={handleOpenChange}
                            >
                                <Badge count={notifications?.count || 0} offset={[-5, 5]}>
                                    <Avatar
                                        onClick={resetNotificationCount}
                                        shape="circle"
                                        src={NotificationIcon}
                                        className="cursor-pointer"
                                    />
                                </Badge>
                            </Popover>
                            <Divider type="vertical" className="h-10" />

                            {!isSubCorporate && user?.isPekoCreditAvailable && (
                                <>
                                    {user?.isPekoCreditActive === false ? (
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => navigate(paths.pekoCredits.index)}
                                            onKeyDown={e =>
                                                e.key === 'Enter' &&
                                                navigate(paths.pekoCredits.index)
                                            }
                                            className="inline-flex items-stretch cursor-pointer w-[110px] h-10 rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(255,100,100,0.35)] shrink-0"
                                        >
                                            {/* Scratched (revealed) left section */}
                                            <Flex
                                                align="center"
                                                justify="center"
                                                className="relative w-[78%] overflow-hidden"
                                                style={{
                                                    background:
                                                        'linear-gradient(135deg, #FF6464 60%, #ff3e3e 100%)',
                                                    clipPath:
                                                        'polygon(0 0, calc(100% - 6px) 0, 100% 15%, calc(100% - 4px) 30%, 100% 45%, calc(100% - 5px) 60%, 100% 75%, calc(100% - 3px) 88%, 100% 100%, 0 100%)',
                                                }}
                                            >
                                                {/* Shimmer sweep */}
                                                <div
                                                    className="absolute inset-0 pointer-events-none animate-[scratchShimmer_2.2s_ease-in-out_infinite]"
                                                    style={{
                                                        background:
                                                            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                                                    }}
                                                />
                                                {/* Diagonal scratch texture */}
                                                <div
                                                    className="absolute inset-0 pointer-events-none"
                                                    style={{
                                                        backgroundImage:
                                                            'repeating-linear-gradient(118deg, transparent, transparent 4px, rgba(255,255,255,0.06) 4px, rgba(255,255,255,0.06) 5px)',
                                                    }}
                                                />
                                                <span className="text-white text-[10px] text-center leading-[1.3] relative z-10 tracking-[0.2px]">
                                                    Claim
                                                    <br />
                                                    Peko Credits
                                                </span>
                                            </Flex>

                                            {/* Unscratched right section */}
                                            <Flex
                                                vertical
                                                align="center"
                                                justify="center"
                                                className="w-[22%] border-2 border-dashed border-[#FF6464] border-l-0 rounded-r-lg relative overflow-hidden"
                                                style={{
                                                    background:
                                                        'repeating-linear-gradient(45deg, #fff8f8, #fff8f8 3px, #fff0f0 3px, #fff0f0 6px)',
                                                }}
                                            >
                                                <span className="text-[10px] leading-none text-[#FF6464] font-extrabold">
                                                    40
                                                </span>
                                            </Flex>

                                            <style>{`
                                                @keyframes scratchShimmer {
                                                    0% { transform: translateX(-100%); }
                                                    60%, 100% { transform: translateX(200%); }
                                                }
                                            `}</style>
                                        </div>
                                    ) : (
                                        <Link to={paths.pekoCredits.index}>
                                            <Flex
                                                vertical
                                                align="center"
                                                justify="center"
                                                className="whitespace-nowrap"
                                            >
                                                <Text className="text-xs">Peko Credits</Text>
                                                <Text className="text-sm font-semibold">
                                                    ₹{' '}
                                                    {formatNumberWithLocalString(
                                                        user?.pekoCredits ?? 0
                                                    )}
                                                </Text>
                                            </Flex>
                                        </Link>
                                    )}
                                    <Divider type="vertical" className="h-10" />
                                </>
                            )}
                        </>
                    )}

                    <Dropdown
                        menu={{ items: accountMenuItems, onClick: handleMenuClick }}
                        trigger={['hover']}
                        placement="bottomRight"
                        overlayClassName="nav-user-dropdown"
                        overlayStyle={{ minWidth: '280px' }}
                    >
                        <Flex
                            gap={10}
                            align="center"
                            className="h-12 px-3 py-2 border cursor-pointer rounded-xl"
                        >
                            <Avatar
                                src={user?.logo}
                                size="large"
                                draggable={false}
                                className="bg-[#ffeeee]"
                            >
                                {resolvedName ? (
                                    <Text
                                        style={{ color: colorPrimary }}
                                        className="text-2xl font-bold"
                                    >
                                        {resolvedName.slice(0, 1).toUpperCase()}
                                    </Text>
                                ) : (
                                    <UserOutlined style={{ color: colorPrimary, fontSize: 20 }} />
                                )}
                            </Avatar>
                            <Flex vertical>
                                <Text className="text-xs font-semibold text-black myNavClass">
                                    {displayName}
                                </Text>
                                <Text className="text-xs text-gray-400 myNavClass">
                                    {isFreelancer
                                        ? 'Freelancer / Influencer'
                                        : formatString(user?.roleName)}
                                </Text>
                            </Flex>
                            <DownOutlined className="text-xs text-gray-500" />
                        </Flex>
                    </Dropdown>
                </Flex>
            </Flex>
        </>
    );
};

export default CustomHeader;
