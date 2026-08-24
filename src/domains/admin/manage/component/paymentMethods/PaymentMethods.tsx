import { useState } from 'react';

import { EditOutlined } from '@ant-design/icons';
import { Button, Flex, Switch, Typography, Pagination } from 'antd';

import GenericTable from '@components/atomic/GenericTable';
import useDebounceSearch from '@src/hooks/useDebounceSearch';
import { formattedDateOnly, formattedTime } from '@utils/dateFormat';

import PaymentMethodHeader from './PaymentMethodHeader';
import PaymentMethodsModal from './PaymentMethodsModal';
import useGetPaymentMethods from '../../hooks/paymentMethods/useGetPaymentMethods';
import useUpdatePaymentMethodsApi from '../../hooks/paymentMethods/useUpdatePaymentMethods';
import useFilter from '../../hooks/useFilters';
import { PaymentMethod } from '../../types/paymentMethods';

const PaymentMethods = () => {
    const initialValues = {
        searchText: '',
        page: 1,
        itemsPerPage: 10,
        sort: 'DESC',
        sortField: '',
    };
    const [filters, setFilters] = useState(initialValues);
    const { handlePageChange, handleTableChange } = useFilter({ setFilters });
    const { searchText, updateSearchText } = useDebounceSearch(setFilters);
    const [openModal, setOpenModal] = useState(false);
    const [modalData, setModalData] = useState<PaymentMethod>();

    const { switchStates, onChange, isLoading, tableData, count, setRefresh } =
        useGetPaymentMethods(filters);

    const { updatePaymentMethods, isLoading: isUpdating } = useUpdatePaymentMethodsApi();
    const handleSave = () => updatePaymentMethods(switchStates);

    const handleEdit = (record: PaymentMethod) => {
        setModalData(record);
        setOpenModal(true);
    };

    const getPaymentMethod = (value: string) => {
        if (value === 'PAYMENT_GATEWAY') return 'Payment gateway';
        if (value === 'WALLET') return 'Wallet  Payment';
        return '';
    };
    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            sorter: true,
            key: 'createdAt',
            render: (createdAt: any) => (
                <Flex vertical>
                    <Typography.Text>{formattedDateOnly(new Date(createdAt))}</Typography.Text>
                    <Typography.Text>{formattedTime(new Date(createdAt))}</Typography.Text>
                </Flex>
            ),
        },
        {
            title: 'Payment Method',
            sorter: true,
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (code: string) => (
                <Flex>
                    <Typography.Text className="w-3/4 " style={{ marginRight: '8px' }}>
                        {getPaymentMethod(code)}
                    </Typography.Text>
                </Flex>
            ),
        },
        {
            title: 'Partner Name',
            dataIndex: 'name',
            sorter: true,
            key: 'name',
            render: (partnerName: string) => (
                <Flex vertical>
                    <Typography.Text>{partnerName || 'N/A'}</Typography.Text>
                </Flex>
            ),
        },
        {
            title: 'Actions',
            dataIndex: 'action',
            key: 'action',
            render: (_: any, record: PaymentMethod) => (
                <EditOutlined onClick={() => handleEdit(record)} />
            ),
        },
    ];

    return (
        <>
            <Flex vertical justify="space-between" align="start" gap={40} className="mb-5">
                <Typography.Text className="w-full text-base font-medium md:w-fit sm:text-lg lg:text-xl">
                    Payment Methods Configuration
                </Typography.Text>

                {switchStates && (
                    <>
                        <Flex justify="space-between" align="center" className="w-1/4">
                            <Typography.Text className="font-normal text-valueText text-custom">
                                Payment gateway
                            </Typography.Text>
                            <Switch
                                checked={switchStates.isGatewayPaymentAvailable}
                                onChange={onChange('isGatewayPaymentAvailable')}
                                size="small"
                            />
                        </Flex>

                        <Flex justify="space-between" align="center" className="w-1/4">
                            <Typography.Text className="font-normal text-valueText text-custom">
                                Wallet Payment
                            </Typography.Text>
                            <Switch
                                checked={switchStates.isWalletPaymentAvailable}
                                onChange={onChange('isWalletPaymentAvailable')}
                                size="small"
                            />
                        </Flex>

                        <Flex justify="space-between" align="center" className="w-1/4">
                            <Typography.Text className="font-normal text-valueText text-custom">
                                Coupon Applicable
                            </Typography.Text>
                            <Switch
                                checked={switchStates.isCouponApplicable}
                                onChange={onChange('isCouponApplicable')}
                                size="small"
                            />
                        </Flex>

                        <Button
                            type="primary"
                            danger
                            className="mt-4"
                            onClick={handleSave}
                            loading={isUpdating}
                        >
                            Save
                        </Button>
                    </>
                )}
            </Flex>

            <PaymentMethodHeader
                setRefresh={setRefresh}
                handleSearch={updateSearchText}
                searchText={searchText}
                // accessPermission={accessPermission}
            />
            <GenericTable
                rowKey={record => record.id}
                columns={columns}
                dataSource={tableData}
                pagination={false}
                loading={isLoading}
                onChange={handleTableChange}
            />
            <Pagination
                current={filters.page}
                size="default"
                className="text-end pt-7"
                onChange={handlePageChange}
                total={count}
                showSizeChanger={false}
            />
            {openModal && (
                <PaymentMethodsModal
                    open={openModal}
                    data={modalData}
                    handleCancel={() => setOpenModal(false)}
                    setRefresh={setRefresh}
                />
            )}
        </>
    );
};

export default PaymentMethods;
