import { Avatar, Divider, Flex, Tag, Typography } from 'antd';

interface bookingProp {
    nightDifferenceString: string;
}
const CheckInDetails = ({ nightDifferenceString }: bookingProp) => (
    <Flex className="" style={{ alignItems: 'center' }}>
        <Flex>
            <Avatar
                className="bg-bgOrange2 rounded-full"
                style={{ width: '0.69rem', height: '0.69rem' }}
            />
        </Flex>
        <Flex style={{ position: 'relative', width: '15rem' }}>
            <Divider className="text-bgOrange2" style={{ borderTop: '0.1rem dashed' }} />
            <Tag
                className="text-bgOrange2 absolute rounded-full"
                color="red"
                bordered={false}
                style={{
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '39%',
                    zIndex: 1,
                }}
            >
                <Typography.Text className="text-bgOrange2">
                    {nightDifferenceString}
                </Typography.Text>
            </Tag>
        </Flex>
        <Flex>
            <Avatar
                className="rounded-full bg-bgOrange2"
                style={{
                    width: '0.69rem',
                    height: '0.69rem',
                }}
            />
        </Flex>
    </Flex>
);

export default CheckInDetails;
