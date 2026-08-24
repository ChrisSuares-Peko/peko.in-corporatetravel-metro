import { Button, Grid } from 'antd';
import { Content } from 'antd/es/layout/layout';

import PricesummaryDetails from '@domains/dashboard/Hotels/Components/BookingReview/PricesummaryDetails';

import useForm from '../../hooks/useCheckout';
import { price } from '../../utils/data';

const PriceSummary = () => {
    const screens = Grid.useBreakpoint();
  
    const { handleSubmission } = useForm();
   
    return (
        <Content className="pt-5">
            <Content className="border border-solid border-gray-200 rounded-md">
                {screens.md ? (
                    <Content className="p-5" style={{ width: '26.56rem' }}>
                        <PricesummaryDetails
                            total={price.total}
                            room={price.room}
                            taxes={price.taxes}
                            mediCancel={price.mediCancel}
                            ct={price.ct}
                        />
                    </Content>
                ) : (
                    <Content className="p-5">
                        <PricesummaryDetails
                            total={price.total}
                            room={price.room}
                            taxes={price.taxes}
                            mediCancel={price.mediCancel}
                            ct={price.ct}
                        />
                    </Content>
                )}
            </Content>
            {/* <Button
                size="middle"
                className="px-5  w-72 h-10 rounded-md mt-5"
                onClick={handleSubmission}
                style={{
                    backgroundColor: colorPrimary,
                    color: 'white',
                }}
            >
                Continue
            </Button> */}
            <Button
                danger
                type="primary"
                className="md:w-72 xs:w-full font-medium px-5 mt-5"
                onClick={handleSubmission}
            >
                Continue
            </Button>
        </Content>
    );
};

export default PriceSummary;
