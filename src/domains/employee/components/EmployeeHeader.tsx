import { useState } from 'react';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Image, Typography, theme } from 'antd';
import { useNavigate } from 'react-router-dom';

import LogoutIcon from '@assets/svg/Logout.svg';
import { paths } from '@routes/paths';
import { useAppSelector } from '@src/hooks/store';
import { handleLogout } from '@src/services/handleLogout';

const { Text } = Typography;

const EmployeeHeader = () => {
    const {
        token: { colorPrimary },
    } = theme.useToken();
    const navigate = useNavigate();
    const { username } = useAppSelector(state => state.reducer.auth);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const displayName = username || 'Employee';

    return (
        <Flex justify="flex-end" align="center" gap={16} className="w-full">
            <Flex
                gap={10}
                align="center"
                className="cursor-pointer"
                onClick={() => navigate(paths.employee.profile)}
            >
                <Avatar size="large" draggable={false} className="bg-[#ffeeee]">
                    {displayName ? (
                        <Text style={{ color: colorPrimary }} className="text-2xl font-bold">
                            {displayName.slice(0, 1).toUpperCase()}
                        </Text>
                    ) : (
                        <UserOutlined style={{ color: colorPrimary, fontSize: 20 }} />
                    )}
                </Avatar>
                <Flex vertical>
                    <Text className="text-xs font-semibold text-black">{displayName}</Text>
                    <Text className="text-gray-400">Employee</Text>
                </Flex>
            </Flex>
            <Image
                src={LogoutIcon}
                width={40}
                preview={false}
                onClick={async () => {
                    if (!isLoggingOut) {
                        setIsLoggingOut(true);
                        await handleLogout().finally(() => setIsLoggingOut(false));
                    }
                }}
                className="pl-4 cursor-pointer"
            />
        </Flex>
    );
};

export default EmployeeHeader;
