import { Flex, Typography } from 'antd';

import maskCardNumber from '../../utils/maskCardNumber';

type SmartCardSummaryProps = {
    cardNumber: string;
    label?: string;
};

export default function SmartCardSummary({ cardNumber, label }: SmartCardSummaryProps) {
    return (
        <Flex vertical gap={4}>
            <Typography.Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                {label || 'Smart Card'}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
                {maskCardNumber(cardNumber)}
            </Typography.Text>
        </Flex>
    );
}
