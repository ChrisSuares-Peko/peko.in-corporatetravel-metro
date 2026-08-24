import { Button, Flex, Image, Skeleton, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';
import useScreenSize from '@src/hooks/useScreenSize';

import PekoOneHeader from './PekoOneHeader';
import useBannersApi from '../hooks/useBannersApi';

const Headers = () => {
    const { Text } = Typography;
    const { sm } = useScreenSize();
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.reducer.user);
    const { data, isLoading, isUserHavingTopPlan } = useBannersApi('TOP');

    if (user?.accountType === 'freelancer') return null;

    const handleButtonClick = () => {
        const bannerLink = data?.[0]?.bannerLink;
        if (!bannerLink || typeof bannerLink !== 'string') return;
        try {
            const fullUrl = new URL(bannerLink, window.location.origin);
            const target = `${fullUrl.pathname}${fullUrl.search}${fullUrl.hash}`;

            if (fullUrl.hostname === window.location.hostname) {
                navigate(target);
            } else {
                window.location.href = fullUrl.toString();
            }
        } catch (err) {
            console.error('Invalid banner link:', bannerLink, err);
        }
    };

    if (isLoading) {
        return (
            <Flex
                className="px-4 py-4 mb-5 sm:px-10 sm:py-7 banner-gradient rounded-2xl"
                justify="space-between"
                align="center"
            >
                <Skeleton active />
            </Flex>
        );
    }
    if (!data || data.length === 0) return null;

    return !isUserHavingTopPlan ? (
        <PekoOneHeader subscriptionBanner={data!} />
    ) : (
        <Flex
            className="px-4 py-4 mb-5 sm:px-10 sm:py-7 banner-gradient rounded-2xl"
            justify="space-between"
            align="center"
        >
            <Flex vertical gap={sm ? 16 : 10}>
                <Text className="text-base font-medium xxl:text-xl">
                    {data[0]?.bannerTitle}
                    {/* <Text className="text-base font-medium text-brandColor xxl:text-xl">
                        Save Cost!
                    </Text> */}
                </Text>
                <Text
                    className="max-w-xl text-[0.65rem] font-normal sm:text-xs xxl:max-w-lg"
                    style={{ lineHeight: sm ? '1.4rem' : '1.1rem' }}
                >
                    {data[0]?.description}
                </Text>
                <Button
                    onClick={handleButtonClick}
                    danger
                    size={sm ? 'middle' : 'small'}
                    type="primary"
                    className="w-24 text-xs font-normal sm:text-base sm:font-medium sm:w-32"
                >
                    {data?.[0]?.buttonText || 'Shop Now'}
                </Button>
            </Flex>
            <Image
                src={data[0].bannerImage}
                preview={false}
                style={{ width: '100%', height: '100%', maxHeight: '9rem' }} // auto 24vh
            />
        </Flex>
    );
};

export default Headers;
