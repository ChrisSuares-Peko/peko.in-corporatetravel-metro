/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';

import { Button, Col, Descriptions, Form, Row, Skeleton } from 'antd';
import { Formik } from 'formik';

import PasswordInput from '@components/atomic/inputs/PasswordInput';
import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import { useAppSelector } from '@src/hooks/store';
import { useFindRolesService } from '@utils/findRolesService';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import useSelfTransfer from '../hooks/useSelfTransfer';
import { selfTransferSchema } from '../schema/selfTransfer';
import { RolePermissionAccessData } from '../types/SelfTransferTypes';
import { transferTypes } from '../utils/data';

const SelfTransfer = () => {
    const [accessPermission, setAccessPermission] = useState<RolePermissionAccessData>();
    const { services } = useAppSelector(state => state.reducer.services) ?? {};
    const service = useFindRolesService(services?.data, 'Self Transfer'); // Get the service
    useEffect(() => {
        if (service) {
            setAccessPermission(service); // Update state if service is found
        }
    }, [service]);
    const { handleSelfTransfer, isLoading, walletDetails } = useSelfTransfer(true);
    return (
        <Row className="mt-5" gutter={[60, 30]}>
            <Col xs={24} sm={12} lg={10} xxl={8}>
                <Formik
                    initialValues={{ amount: '', password: '', type: '' }}
                    onSubmit={(values, { resetForm }) => {
                        handleSelfTransfer(values);
                        resetForm();
                    }}
                    validationSchema={selfTransferSchema(walletDetails?.balance || '0')}
                >
                    {({ handleSubmit }) => (
                        <Form onFinish={handleSubmit} className="w-full " layout="vertical">
                            <SelectInput
                                label="Transfer Type"
                                name="type"
                                placeholder="Select Transfer Type"
                                options={transferTypes}
                            />
                            <TextInput
                                name="amount"
                                label="Amount"
                                placeholder="Enter Amount"
                                type="text"
                                size="large"
                                allowDecimalsOnly
                                maxLength={12}
                            />
                            <PasswordInput
                                label="Password"
                                name="password"
                                placeholder="Enter Password"
                                type="password"
                                size="large"
                            />
                               {accessPermission && accessPermission.update && (
                            <Button
                                htmlType="submit"
                                type="primary"
                                danger
                                className="mt-5 "
                                loading={isLoading}
                            >
                                Submit
                            </Button>
                               )}
                        </Form>
                    )}
                </Formik>
            </Col>
            <Col xs={24} sm={12} lg={14}>
                {isLoading ? (
                    <Skeleton active />
                ) : walletDetails ? (
                    <Descriptions layout="horizontal" bordered title="Your Account">
                        <Descriptions.Item
                            span={24}
                            labelStyle={{ fontWeight: 'bold' }}
                            label="Username"
                        >
                            {walletDetails.username}
                        </Descriptions.Item>
                        <Descriptions.Item
                            span={24}
                            label="Name"
                            labelStyle={{ fontWeight: 'bold' }}
                        >
                            {walletDetails.companyName}
                        </Descriptions.Item>
                        <Descriptions.Item
                            span={24}
                            label="Wallet Balance"
                            labelStyle={{ fontWeight: 'bold' }}
                        >
                            ₹ {formatNumberWithLocalString(Number(walletDetails.balance))}
                        </Descriptions.Item>
                    </Descriptions>
                ) : (
                    ''
                )}
            </Col>
        </Row>
    );
};

export default SelfTransfer;
