import { Card, Flex, Skeleton, Typography } from 'antd';

import { FareBreakdown } from '../../types/metro';

type FareBreakdownCardProps = {
    fare: FareBreakdown | null;
    isLoading: boolean;
};

export default function FareBreakdownCard({ fare, isLoading }: FareBreakdownCardProps) {
    return (
        <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 20 }}>
            <Flex vertical gap={8}>
                <Typography.Text style={{ fontSize: 14, fontWeight: 700 }}>Fare</Typography.Text>
                {isLoading || !fare ? (
                    <Skeleton.Input active size="small" style={{ width: 120 }} />
                ) : (
                    <Flex vertical gap={2}>
                        <Typography.Text style={{ fontSize: 24, fontWeight: 700, color: '#FF4F4F' }}>
                            ₹ {fare.amount.toFixed(2)}
                        </Typography.Text>
                        {/* PLACEHOLDER FARE LOGIC — flat/distance-tier mock, not a real fare API. */}
                        <Typography.Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                            Estimated fare (placeholder pricing)
                        </Typography.Text>
                    </Flex>
                )}
            </Flex>
        </Card>
    );
}
