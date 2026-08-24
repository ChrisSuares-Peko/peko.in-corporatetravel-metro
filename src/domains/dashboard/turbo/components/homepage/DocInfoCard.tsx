import { Button, Flex, Grid, Typography } from 'antd';
// import CountUp from 'react-countup';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { paths } from '@src/routes/paths';

import { resetInputParams, resetRcResponse, resetResponse } from '../../slices/turboSlice';

const DocInfoCard = ({
    icon,
    title,
    value,
    isPercentage,
    bgColor,
    verified,
    unverified,
    subText1,
    subText2,
    buttonText,
}: any) => {
    const screens = Grid.useBreakpoint();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    return (
        <Flex
            className={`${bgColor} ${screens.sm ? 'rounded-2xl' : 'rounded-xl'} p-4 w-full `}
            gap={10}
            align={`${screens.xs && 'center'}`}
            vertical
        >
            <Flex justify="space-between" align="center" className="w-full flex-wrap gap-x-2">
                <Flex align="center">
                    <Flex className="w-9 h-9 flex-shrink-0" align="center" justify="center">
                        <ReactSVG src={icon} />
                    </Flex>
                    <Flex vertical className="p-0 m-0 min-w-0">
                        <Typography.Text className="text-base font-semibold md:text-lg whitespace-nowrap truncate sm:min-w-28 p-0 m-0">
                            {`${value}`}
                        </Typography.Text>
                    </Flex>
                </Flex>

                <Button
                    type="default"
                    danger
                    // size='small'
                    onClick={() => {
                        if (buttonText === 'Add Vehicle') {
                            dispatch(resetRcResponse());
                            dispatch(resetInputParams());
                            navigate(paths.turbo.addVehicle);
                        }
                        if (buttonText === 'Add Driver') {
                            dispatch(resetResponse());
                            dispatch(resetInputParams());
                            navigate(paths.turbo.addDriver);
                        }
                    }}
                    className="flex items-center justify-center text-xs w-24 md:text-sm"
                >
                    {buttonText}
                </Button>
            </Flex>
            <Flex justify="space-between" className="px-2 mt-1 w-full">
                <Typography.Text type="secondary" className="truncate">
                    {subText1}
                </Typography.Text>
                <Typography.Text className="text-right">{verified}</Typography.Text>
            </Flex>
            <Flex justify="space-between" className="px-2 w-full">
                <Typography.Text type="secondary" className="truncate">
                    {subText2}
                </Typography.Text>
                <Typography.Text className="text-right">{unverified}</Typography.Text>
            </Flex>
        </Flex>
    );
};

export default DocInfoCard;
