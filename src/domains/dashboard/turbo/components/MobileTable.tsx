import React from 'react';

import { Col, Empty, Flex, Row, Skeleton, Typography } from 'antd';

import MoreTransactions from '@assets/svg/moretransactions.svg';

import TableMobile from './TableMobile';

type Props = {
    data: any[];
    page: number;
    handlePageChange: (page: number, pageSize: number) => void;
    count: number | undefined;
    drivers: any
    isLoading: boolean;
    handleDriverChange: any
};

const MobileTable = ({
    isLoading,
    data,
    drivers,
    count,
    page,
    handlePageChange,
    handleDriverChange
}: Props) => (
    <>
        <Row align="middle" className="p-5 mt-5 rounded-md bg-bgLightGray">
            <Col xs={9}>
                <Flex justify="start">
                    <Typography.Text>Vehicle Number</Typography.Text>
                </Flex>
            </Col>

            <Col xs={9}>
                <Flex justify="center">

                    <Typography.Text>RC Status</Typography.Text>

                </Flex>
            </Col>
            <Col xs={5}>
                <Flex justify="center">
                    <Typography.Text>Action</Typography.Text>
                </Flex>
            </Col>
        </Row>
        {isLoading ? (
            <Skeleton paragraph={{ rows: 6 }} className="mt-5" />
        ) : (
            <Flex vertical className="h-full">
                {data.length > 0 ? (
                    data.map(transaction => (
                        <TableMobile
                            key={transaction.transactionID}
                            transaction={transaction}
                            drivers={drivers}
                            handleDriverChange={handleDriverChange}

                        />
                    ))
                ) : (
                    <Flex vertical justify="center" align="center" className="h-full">
                        <Empty image={MoreTransactions} description="No data found" />
                    </Flex>
                )}
            </Flex>
        )}
        {/* <Pagination
            current={page}
            onChange={handlePageChange}
            className="text-center mt-10"
            size="small"
            total={count}
            showSizeChanger={false}
        /> */}
    </>
);

export default MobileTable;
