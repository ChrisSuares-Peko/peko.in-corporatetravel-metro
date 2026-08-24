import { Flex, Typography } from 'antd';

import DroomLogo from './DroomLogo';

const { Text } = Typography;

interface Props {
    // Height of the droom wordmark in px.
    height?: number;
    classes?: string;
}

// "Partnered with <droom>" attribution row on the vehicle-report screens, which are
// Droom-backed. The traffic-challan screens show the same row but keep their own copy
// (challan/components/DroomLogo.tsx and the inline rows in their pages) — deliberately, so
// neither domain depends on the other.
const Branding = ({ height, classes = '' }: Props) => (
    <Flex align="center" gap={10} className={`shrink-0 ${classes}`}>
        <Text className="whitespace-nowrap text-base text-[#486284]">Partnered with</Text>
        <DroomLogo height={height} />
    </Flex>
);

export default Branding;
