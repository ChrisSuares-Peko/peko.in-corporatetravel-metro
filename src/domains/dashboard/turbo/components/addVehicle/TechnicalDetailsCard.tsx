/* eslint-disable no-nested-ternary */
import { Col, Flex, Row, Typography } from 'antd';

const TechnicalDetailsCard = ({ technicalDetails }: any) => (
    <Col xs={24} md={12}>
        <div className="h-full p-6 border rounded-xl">
            <Typography.Text className="text-sm font-semibold">
                Technical Details
            </Typography.Text>
            <Row gutter={[20, 20]} className="mt-4">
                {technicalDetails.map((item: any, index: number) => (
                    <Col xs={12} xl={6} key={index}>
                        <Flex vertical gap={5} className="justify-between h-full">
                            <Typography.Text type="secondary" className="text-xs">
                                {item.label}
                            </Typography.Text>

                            {item.label === 'Wheelbase' ? (
                                <Typography.Text className="text-base font-medium">
                                    {item.value} MM
                                </Typography.Text>
                            ) : item.label === 'Unladen / Gross Weight' ? (
                                <Typography.Text className="text-base font-medium">
                                    {item.value} KG
                                </Typography.Text>
                            ) : (
                                <Typography.Text className="text-base font-medium">
                                    {item.value}
                                </Typography.Text>
                            )}
                        </Flex>
                    </Col>
                ))}
            </Row>
        </div>
    </Col>
);

export default TechnicalDetailsCard;
