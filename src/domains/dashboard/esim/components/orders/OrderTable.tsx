import React, { useState } from 'react';

import { Button, Flex, Pagination, TableProps, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import GenericTable from '@components/atomic/GenericTable';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';
import { formattedDateTime } from '@utils/dateFormat';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import TopUpModal from './TopUpModal';
import { getOrderDetails } from '../../api/index';
import usePayment from '../../hooks/useTopupPayment';

type Props = {
    data: any;
    totalRecord: number;
    isLoading: boolean;
    handlePageChange: (page: number, itemsPerPage: number) => void;
    filter: { searchText: string; page: number; itemsPerPage: number };
};

const OrderTable = ({ data, handlePageChange, totalRecord, isLoading, filter }: Props) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);

    const [openModal, setOpenModal] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<any>();
    const [selectedDetails, setSelectedDetails] = useState<any>();

    const { handleSubmission } = usePayment();

    // Extract country from plan name pattern: "Country_DataGB_Days_d"
    const extractCountryFromPlanName = (planName: string): string => {
        if (!planName) return '';
        // Pattern: "Nigeria_0.5_GB_30_d" -> extract "Nigeria"
        const parts = planName.split('_');
        return parts[0] || ''; // Return first part as country name
    };

    const handleTopUpSubmit = async (
        selectedData: string,
        selectedValidity: string,
        selectedCountry: string
    ) => {

        if (!selectedCountry || !selectedData || !selectedValidity) {
            return;
        }

        const postData = {
            orders: [
                {
                    country: selectedCountry,
                    data: Number(selectedData) * 1024,
                    validity: Number(selectedValidity),
                    quantity: 1,
                    iccid: selectedDetails.iccid ?? '',
                },
            ],
        };

        handleSubmission(postData);
        setOpenModal(false);
    };
    const saveDetailsToSession = () => {
        const details = {
            url: `${paths.dashboard.corporateTravel}/${paths.esim.index}/${paths.esim.orders}`,
            service: 'eSim',
        };
        // Save the details in sessionStorage
        sessionStorage.setItem('ESIM', JSON.stringify(details));
    };
    const getStatusColor = (status = '') => {
        const statusColors: Record<string, { badgeColor: string; textColor: string }> = {
            SUCCESS: { badgeColor: '#EBFFE7', textColor: '#26A411' },
            FAILURE: { badgeColor: '#FFF4F3', textColor: '#D7341E' },
            REFUNDED: { badgeColor: '#FFF4F3', textColor: '#D7341E' },
        };
        const { textColor } = statusColors[status?.toUpperCase()] || {
            badgeColor: 'gray',
            textColor: 'white',
        };
        return textColor;
    };
    const columns: TableProps<any>['columns'] = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => formattedDateTime(new Date(date)),
        },
        {
            title: 'Order ID',
            dataIndex: 'orderId',
            key: 'orderId',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        // {
        //     title: 'Plan',
        //     dataIndex: 'plan',
        //     key: 'plan',
        // },
        {
            title: 'ICCID No.',
            dataIndex: 'iccid',
            key: 'iccid',
        },
        {
            title: 'Payment Method',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (text: string) => (
                <Typography.Text className="capitalize">{text}</Typography.Text>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amt: string) => (
                <Typography.Text>₹ {formatNumberWithLocalString(amt)}</Typography.Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const displayStatus =
                    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
                return (
                    <Typography.Text style={{ color: getStatusColor(status) }}>
                        {displayStatus}
                    </Typography.Text>
                );
            },
        },
        {
            title: 'Action',
            key: 'id',
            dataIndex: 'id',
            render: (text, record: any) => (
                <Flex gap={10}>
                    <Button
                        className="font-medium"
                        danger
                        // disabled={!record.planId}
                        onClick={() => {
                            if (!record.planId) {
                                dispatch(
                                    showToast({
                                        description: 'Plan is not available',
                                        variant: 'error',
                                    })
                                );
                            } else {
                                navigate(`${paths.esim.esimDetails}`, {
                                    state: {
                                        id: record.id,
                                        iccid: record.iccid,
                                        planId: record.planId,
                                        customerUid: record.customerUid,
                                        corporateTxnId: record.orderId,
                                        country: record.country || record.countryName,
                                    },
                                });
                            }
                        }}
                        // onClick={() =>
                        //     navigate(`${paths.esim.esimDetails}`, {
                        //         state: {
                        //             id: record.id,
                        //             iccid: record.iccid,
                        //             planId: record.planId,
                        //         },
                        //     })
                        // }
                    >
                        View
                    </Button>
                    <Button
                        className="font-medium"
                        danger
                        // disabled={!record.planId}
                        onClick={async () => {
                            if (!record.planId) {
                                dispatch(
                                    showToast({
                                        description: 'Plan is not available',
                                        variant: 'error',
                                    })
                                );
                                return;
                            }

                            const countryFromPlanName = extractCountryFromPlanName(record.planName);

                            let country =
                                record.country || countryFromPlanName || record.countryName || '';


                            // 🔥 WAIT for API BEFORE opening modal
                            if (!country) {
                                try {
                                    const res = await getOrderDetails({
                                        userType: role,
                                        userId: id,
                                        planId: record.planId,
                                        iccid: record.iccid,
                                        customerUid: record.customerUid,
                                    });


                                    country = res && res.countryName ? res.countryName : '';
                                } catch (err) {
                                    console.error('Failed to fetch country', err);
                                }
                            }


                            const orderWithCountry = {
                                ...record,
                                country: country || '',
                            };

                            // ✅ NOW open modal AFTER country is ready
                            setSelectedPlanId(record.planId);
                            setSelectedDetails(orderWithCountry);
                            setOpenModal(true);

                            saveDetailsToSession();
                        }}
                    >
                        Top-Up
                    </Button>
                </Flex>
            ),
        },
    ];

    return (
        <Flex vertical>
            <GenericTable
                rowKey={record => record.id}
                bordered={false}
                className="w-full"
                columns={columns}
                dataSource={data || []}
                pagination={false}
                loading={isLoading}
            />

            {data?.length > 0 && (
                <Pagination
                    className="sm:text-end text-center mt-10"
                    current={filter.page}
                    size="small"
                    total={totalRecord}
                    onChange={(page, pageSize) => {
                        if (page !== filter.page) handlePageChange(page, pageSize);
                        else handlePageChange(1, pageSize);
                    }}
                />
            )}
            {openModal && (
                <TopUpModal
                    handleCancel={() => setOpenModal(false)}
                    handleSubmit={handleTopUpSubmit}
                    planId={selectedPlanId}
                    isLoading={false}
                    isOpen={openModal}
                    country={selectedDetails.country}
                    iccid={selectedDetails.iccid}
                />
            )}
        </Flex>
    );
};

export default OrderTable;
