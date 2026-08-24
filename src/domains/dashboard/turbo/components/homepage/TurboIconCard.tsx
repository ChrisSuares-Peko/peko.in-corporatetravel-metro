import React from 'react';

import { Flex, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

interface IconCardProps {
    icon: any;
    title: string;
    onClick?: () => void;
    url?: string;
}



const TurboIconCard: React.FC<IconCardProps> = ({ icon, title, onClick, url }) => {
    const navigate = useNavigate();
    return (
        <Flex
            vertical
            onClick={() => url && navigate(url)}
            gap={12}
            align="center"
            justify="center"
            className="h-30 cursor-pointer sm:h-30 sm:w-28 transition duration-300 transform  hover:scale-110 cursor-default"
        >
            <Flex
                className="xs:h-24 xs:w-32 sm:h-28 md:h-24 md:w-32 sm:w-36 bg-[#F9F6F5] rounded-xl sm:rounded-2xl cursor-pointer"
                align="center"
                justify="center"
            >
                <ReactSVG
                    src={icon}
                    beforeInjection={svg => {
                        svg.setAttribute('width', '56');
                        svg.setAttribute('height', '56');
                    }}
                />
            </Flex>

            <Typography.Text
                // style={{ display: 'inline-block' }}
                className=" xs:text-sm cursor-pointer text-center block min-h-10"
            >
                {title}
            </Typography.Text>
        </Flex>
    );
};

export default React.memo(TurboIconCard);
