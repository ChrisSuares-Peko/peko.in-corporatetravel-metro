import React, { useEffect } from 'react';

import { Col, Flex, Row, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import BharathConnect from '@src/domains/dashboard/billPayments/assets/svg/BharatConnect.svg';
import { useAppDispatch } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import UtilityBillsList from './UtilityBillsList';
import BeneficiariesList from '../components/BeneficiariesList';
import { clearPostpaid } from '../slices/billPaymentSlice';

const { Text } = Typography;

const BillPaymentsList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    useEffect(() => {
        const currentPath = location.pathname;
        return () => {
            if (currentPath === '/utility-payments' || currentPath === '/dashboard') {
                dispatch(clearPostpaid());
            }
        };
    }, [location.pathname, dispatch]);
    
    return (
        <Row>
            <Col xs={24}>
                <Flex justify="space-between">
                    <Text className="font-medium text-lg sm:text-xl">Utility Payments</Text>
                    <Flex vertical gap={15}>
                        <ReactSVG
                            className="ml-16"
                            src={BharathConnect}
                            beforeInjection={svg => {
                                svg.setAttribute('style', 'width: 85px; height: 40px;');
                            }}
                        />
                        <Text
                            className="font-medium text-sm sm:text-sm  text-bgOrange2 underline cursor-pointer "
                            onClick={() => navigate(paths.billPayments.complaintRegistration)}
                        >
                            Complaint Registration
                        </Text>
                    </Flex>
                </Flex>
            </Col>
            <Col xl={14} xxl={15} className="mt-8">
                <UtilityBillsList />
            </Col>
            <Col
                xl={10}
                xxl={9}
                className="w-full mt-7 sm:mt-[2.4rem] sm:bg-gray-50 rounded-3xl sm:p-6"
            >
                <BeneficiariesList />
            </Col>
        </Row>
    );
};

export default BillPaymentsList;
