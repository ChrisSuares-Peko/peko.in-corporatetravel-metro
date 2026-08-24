import { useMemo, useRef, useState } from 'react';

import { Col, Row, Form, message } from 'antd';
import { Formik } from 'formik';

import useHideWidgetOnDrawer from '@components/molecular/freshChat/hooks/useHideWidgetOnDrawer';
import { useAppSelector, useAppDispatch } from '@src/hooks/store';
import useScreenSize from '@src/hooks/useScreenSize';

import CheckoutDetails from '../components/CheckoutDetails';
import CheckoutForm from '../components/CheckoutForm';
import CheckoutTable from '../components/CheckoutTable';
import CheckoutTableMobile from '../components/CheckoutTableMobile';
import usePayment from '../hooks/usePayment';
import { giftCardSchema } from '../schema/index';
import { setAddressData } from '../slices/checkoutSlice';
import { SelectedEmployee } from '../types/employee';

const CheckoutPage = () => {
    const dispatch = useAppDispatch();
    const { sm } = useScreenSize();
    const onFinishFailed = () => {
        message.error('Submit failed!');
    };
    const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);
    const { userDetails, formDetails, addressDetails } = useAppSelector(
        state => state.reducer.giftcardCheckout
    );
    const initialAddressDetails = useRef(addressDetails);
    const initialValues = useMemo(
        () => ({
            receiverFirstName: initialAddressDetails.current.receiverFirstName || '',
            // receiverLastName: '',
            //  gender: '',
            receiverEmail: initialAddressDetails.current.receiverEmail || '',
            employee: [],
            //  postcode: '',
            message: initialAddressDetails.current.message || '',
            senderName: initialAddressDetails.current.senderName || userDetails?.userName || '',
            // senderEmail: userDetails?.userEmail ?? '',
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const totalData = useAppSelector(state => state.reducer.giftcardCheckout.formDetails.product);
    const { handleSubmission, loading } = usePayment();
    const [selectedEmployees, setSelectedEmployees] = useState<SelectedEmployee[]>([]);
    useHideWidgetOnDrawer(true);

    return (
        <Row className="">
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={giftCardSchema(formDetails.orderType, selectAllChecked)}
                onSubmit={async values => {
                    // await dispatch(setAddressData(values));
                    await dispatch(setAddressData({ ...values, employee: selectedEmployees }));
                    const employeesToSubmit =
                        selectedEmployees.length > 0 ? selectedEmployees : addressDetails.employee;
                    const employeesWithoutLabel = employeesToSubmit.map(
                        ({ label, ...rest }) => rest
                    );

                    handleSubmission({
                        ...values,
                        employee: employeesWithoutLabel,
                        orderType: formDetails.orderType,
                    });
                }}
            >
                {({ handleSubmit }) => (
                    <Form
                        onFinish={handleSubmit}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                        className="w-full mt-1"
                    >
                        <Row>
                            <Col xs={24} xl={16}>
                                <Row align="top" gutter={[20, 0]}>
                                    <Col span={24} className="mt-2">
                                        {sm ? <CheckoutTable /> : <CheckoutTableMobile />}
                                    </Col>
                                    <Col xs={24} md={14} xl={24}>
                                        <CheckoutForm
                                            setSelectedEmployees={setSelectedEmployees}
                                            setSelectAllChecked={setSelectAllChecked}
                                            selectAllChecked={selectAllChecked}
                                        />
                                    </Col>
                                    <Col span={10} className="hidden md:block xl:hidden mt-10">
                                        <CheckoutDetails totalData={totalData} loading={loading} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={0} md={1} />
                            <Col xs={24} md={7} className="md:p-2 md:hidden xl:block">
                                <CheckoutDetails totalData={totalData} loading={loading} />
                            </Col>
                        </Row>
                    </Form>
                )}
            </Formik>
        </Row>
    );
};

export default CheckoutPage;
