import React from 'react';

import { Row, Col, Card, Form, Flex, Typography } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';

import TextInput from '@components/atomic/inputs/TextInput';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import useScreenSize from '@src/hooks/useScreenSize';
import { paths } from '@src/routes/paths';

import { ReceiverDetailsSchema } from '../../schema/ReceiverDetailsSchema';
import { addCustomerInfo } from '../../slices/getHotelSlice';

type Props = {
    formRef: React.MutableRefObject<any>;
};
const { Paragraph } = Typography;

const ReceiverDetails = ({ formRef }: Props) => {
    const customerInfo = useAppSelector(state => state.reducer.hotels.customerInfo);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { md } = useScreenSize();

    return (
        <Content className="pt-4 ">
            <Content className="border border-gray-200 rounded-md">
                <Card size="small" className="p-4 border rounded-md">
                    {md ? (
                        <Typography.Paragraph className="mb-6 text-xl font-medium leading-7">
                            Booking details will be sent to
                        </Typography.Paragraph>
                    ) : (
                        <Flex vertical className="mb-2">
                            <Paragraph className="text-lg font-bold">Contact Information</Paragraph>
                            <Paragraph className="text-sm text-gray-500">
                                Your booking details will be sent here
                            </Paragraph>
                        </Flex>
                    )}

                    <Row>
                        <Formik
                            initialValues={{
                                phone: customerInfo?.phone || '',
                                emailAddress: customerInfo?.emailAddress || '',
                            }}
                            enableReinitialize
                            innerRef={formRef}
                            validationSchema={ReceiverDetailsSchema}
                            onSubmit={async values => {
                                dispatch(addCustomerInfo(values));
                                // All good – navigate to bookings
                                navigate(paths.hotels.bookings);
                            }}
                        >
                            {({ handleSubmit, handleChange, errors, values }) => (
                                <Form
                                    onFinish={handleSubmit}
                                    layout="vertical"
                                    autoComplete="off"
                                    className="w-full mt-0 md:mt-5 "
                                >
                                    <Row gutter={[30, 0]}>
                                        <Col
                                            className="mt-3 md:mr-10 w-full"
                                            md={10}
                                            // onBlur={() => handleFormSubmit(submitForm)}
                                        >
                                            <Flex vertical gap="small">
                                                <Typography.Text>
                                                    <Typography.Text className="text-red-500 me-1">
                                                        *
                                                    </Typography.Text>
                                                    Mobile Number
                                                </Typography.Text>
                                                <TextInput
                                                    type="text"
                                                    placeholder="Enter Mobile Number"
                                                    name="phone"
                                                    allowNumbersOnly
                                                    maxLength={10}
                                                    isRequired
                                                />
                                            </Flex>
                                        </Col>

                                        <Col
                                            className="mt-3 md:mr-10 w-full"
                                            md={10}
                                            // onBlur={() => handleFormSubmit(submitForm)}
                                        >
                                            <Flex vertical gap="small">
                                                <TextInput
                                                    label="Email ID"
                                                    name="emailAddress"
                                                    isRequired
                                                    placeholder="Enter Email ID"
                                                    type="text"
                                                    allowLowerCaseOnly
                                                    allowEmailsOnly
                                                    maxLength={50}
                                                />
                                            </Flex>
                                        </Col>
                                    </Row>
                                </Form>
                            )}
                        </Formik>
                    </Row>
                </Card>
            </Content>
        </Content>
    );
};

export default ReceiverDetails;
