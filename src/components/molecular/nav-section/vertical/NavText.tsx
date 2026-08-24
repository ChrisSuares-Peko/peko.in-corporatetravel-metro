import { JSXElementConstructor, ReactElement } from 'react';

import { Typography } from 'antd';

export const NavText = (
    text: any,
    isActive: boolean,
    label?: 'free' | 'new'
): ReactElement<string | JSXElementConstructor<any>> => {
    const { Text } = Typography;
    return (
        <Text className={isActive ? 'text-brandColor' : 'text-navTextColor'}>
            {text}
            {label === 'free' && <sup className="ml-3 text-textGreenLight">Free</sup>}
            {label === 'new' && <sup className="ml-3 text-bgOrange2">New</sup>}
        </Text>
    );
};
