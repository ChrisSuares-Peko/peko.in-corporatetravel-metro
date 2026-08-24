import React from 'react';

import { Flex, Typography } from 'antd';
import { ReactSVG } from 'react-svg';

interface IconCardProps {
    icon: any;
    title: string;
    onClick?: () => void;
}

const { Text } = Typography;

const IconCard: React.FC<IconCardProps> = ({ icon, title, onClick }) => (
    <Flex vertical gap={8} align="center">
        <Flex
            className=" min-w-[5.6rem] xxl:min-w-24 h-24 xxl:h-24 cursor-pointer bg-bgIconCard rounded-3xl transition duration-300 transform hover:scale-110"
            align="center"
            role="button"
            onClick={onClick}
            justify="center"
        >
            <ReactSVG src={icon} />
        </Flex>
        <Text onClick={onClick} className="text-sm text-center max-w-[5rem] cursor-pointer">
            {title}
        </Text>
    </Flex>
);

export default React.memo(IconCard);
