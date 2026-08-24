import { Button, Card, Flex, Image, Typography } from 'antd';

import BbpsPlanDrawer from './BbpsPlanDrawer';
import useFetchBillApi from '../hooks/useFetchBillApi';
import { Beneficiary } from '../types/index';
import { billPayments, telecomServices } from '../utils/data';

interface BeneficiaryCardProps {
    beneficiary: Beneficiary;
    handleEdit?: () => void;
}
const { Text } = Typography;

const allServices = [...billPayments, ...telecomServices];

const BeneficiaryCard = ({ beneficiary, handleEdit }: BeneficiaryCardProps) => {
    const { handleBeneficiaryPayment, isLoading, billerPlans, isPlanDrawerOpen, setIsPlanDrawerOpen, handlePlanSelect } = useFetchBillApi();
    const serviceImage = beneficiary?.serviceOperator?.serviceImage
        || allServices.find(s => s.accessKey === beneficiary?.accessKey)?.icon;
    const handlePayNow = () => {
        handleBeneficiaryPayment(beneficiary);
    };
    return (
        <>
        <BbpsPlanDrawer
            open={isPlanDrawerOpen}
            plans={billerPlans}
            onClose={() => setIsPlanDrawerOpen(false)}
            onSelectPlan={handlePlanSelect}
        />
        <Card
            size="small"
            className="sm:rounded-xl"
            title={
                <Text className="text-sm font-normal text-cardHTitleText">
                    {beneficiary?.serviceOperator?.serviceProvider}
                </Text>
            }
            extra={
                <Text onClick={handleEdit} className="px-3 cursor-pointer text-bgOrange2">
                    Edit
                </Text>
            }
        >
            <Flex className="w-full px-2 " align="center" justify="space-between">
                <Flex align="center" gap={12} className="w-full">
                    <div>
                        <Image src={serviceImage} preview={false} width={35} height={35} />
                    </div>
                    <Flex vertical gap={4}>
                        <Text className="text-xs font-normal ">{beneficiary?.name}</Text>
                        <Text className="text-xs font-normal text-black/45">
                            {beneficiary?.customerParams && beneficiary.customerParams.length > 0
                                ? `${beneficiary.customerParams[0]?.value} (${beneficiary?.serviceProvider})`
                                : 'No Data'}
                        </Text>
                    </Flex>
                </Flex>
                <Button
                    type="primary"
                    className="text-xs sm:text-sm"
                    danger
                    onClick={handlePayNow}
                    loading={isLoading}
                >
                    Pay Now
                </Button>
            </Flex>
        </Card>
        </>
    );
};

export default BeneficiaryCard;
