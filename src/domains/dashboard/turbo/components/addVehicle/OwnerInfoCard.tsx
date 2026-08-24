import { Col, Flex, Typography } from 'antd';

import LabelValue from './LabelValue';
import { capitalizeFirstLetter } from './vehicleDetailsHelpers';

const OwnerInfoCard = ({ ownerInfo, verifyRcResponse }: any) => (
    <Col xs={24} md={12}>
        <div className="h-full p-6 border rounded-xl">
            <Typography.Text className="text-sm font-semibold">Owner Info</Typography.Text>

            <div className="flex flex-wrap px-2 mt-4 gap-y-4 xl:hidden">
                {ownerInfo.map((item: any, index: number) => (
                    <div key={index} className="w-1/2">
                        <LabelValue
                            label={item.label}
                            value={item.value}
                            valueClassName="text-xs font-medium"
                        />
                    </div>
                ))}
            </div>

            <Flex justify="space-between" className="hidden gap-4 mt-4 xl:flex">
                {ownerInfo.map((item: any, index: number) => (
                    <LabelValue
                        key={index}
                        className="justify-between flex-1"
                        label={item.label}
                        value={item.value || 'N/A'}
                    />
                ))}
            </Flex>

            <Flex justify="space-between" className="w-full mt-8">
                <LabelValue
                    label="Permanent Address"
                    value={capitalizeFirstLetter(verifyRcResponse?.permanentAddress)}
                />
            </Flex>
        </div>
    </Col>
);

export default OwnerInfoCard;
