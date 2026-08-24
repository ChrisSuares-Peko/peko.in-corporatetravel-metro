import { Col, Collapse, Row } from 'antd';

import { useAppSelector } from '@src/hooks/store';
import useScreenSize from '@src/hooks/useScreenSize';

import PassengerAddons from './PassengerAddons';
import useFetchSSR from '../../hooks/useFetchSSR';
import { AllFareQuote } from '../../types/fareRules';

type Props = {
    isSSRLoading?: boolean;
    setShowSpinner: (value: boolean) => void;
    fareQuotes: AllFareQuote;
    handleBooking?: () => void;
};
export default function Ancillaries({
    isSSRLoading,
    setShowSpinner,
    fareQuotes,
    handleBooking,
}: Props) {
    const { sm } = useScreenSize();

    const { passengers } = useAppSelector(state => state.reducer.airline.bookingData);
    const { meal, baggage, seat } = useFetchSSR({ setShowSpinner, handleBooking });
    const { RequiredFieldValidators } = fareQuotes.combined;

    if (isSSRLoading) return null;

    const items = [
        {
            key: '1',
            label: <h1 className="font-bold m-0">Add On</h1>,
            children: (
                <Row className="relative flex gap-96">
                    <Col span={24}>
                        {passengers &&
                            passengers.map((passenger, index) => (
                                <PassengerAddons
                                    item={passenger}
                                    index={index}
                                    key={index}
                                    meal={meal}
                                    seat={seat}
                                    baggage={baggage}
                                    isMealRequired={!!RequiredFieldValidators?.IsMealRequired}
                                    isSeatRequired={!!RequiredFieldValidators?.IsSeatRequired}
                                />
                            ))}
                    </Col>
                </Row>
            ),
        },
    ];

    return (
        <Row className="xs:w-full md:w-auto">
            <Collapse
                size={sm ? 'large' : 'small'}
                expandIconPosition="end"
                className="w-full border-none "
                style={{ padding: 0 }}
                defaultActiveKey={['1']}
                items={items}
            />
        </Row>
    );
}
