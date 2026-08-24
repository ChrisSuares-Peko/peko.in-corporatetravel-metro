import { InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';

interface Props {
    text: string;
}

// Tinted "Best for : …" note that opens the What's-included block on each
// report-type card.
const BestForNote = ({ text }: Props) => (
    <Flex align="start" gap={8} className="rounded-lg bg-[#FFF4F5] px-3 py-[10px]">
        <InfoCircleOutlined className="mt-[2px] shrink-0 text-xs text-[#98A2B3]" />
        <Typography.Text className="text-[11px] leading-[16px] text-[#667085]">
            {text}
        </Typography.Text>
    </Flex>
);

export default BestForNote;
