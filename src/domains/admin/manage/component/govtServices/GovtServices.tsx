import { useEffect, useState } from 'react';

import {
    CheckOutlined,
    CloseOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { Flex, Pagination, Tooltip, Typography } from 'antd';

import GenericTable from '@components/atomic/GenericTable';
import ConfirmationModal from '@components/molecular/modals/ConfirmationModal';
import { useAppSelector } from '@src/hooks/store';
import useDebounceSearch from '@src/hooks/useDebounceSearch';
import { formattedDateOnly } from '@utils/dateFormat';
import { useFindRolesService } from '@utils/findRolesService';

import GovtServicesHeader from './GovtServicesHeader';
import GovtServicesModal from './GovtServicesModal';
import useFilter from '../../hooks/useFilters';
import useGetGovtServices from '../../hooks/useGetGovtServices';
import { GovtService, RolePermissionAccessData } from '../../types/govtServicesTypes';

const { Text } = Typography;

const GovtServices = () => {
    const initialFilters = {
        searchText: '',
        page: 1,
        itemsPerPage: 10,
        sort: 'DESC',
        sortField: '',
    };

    const [filters, setFilters] = useState(initialFilters);
    const [openModal, setOpenModal] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [modalData, setModalData] = useState<GovtService>();
    const [pendingStatusRecord, setPendingStatusRecord] = useState<GovtService>();
    const [accessPermission, setAccessPermission] = useState<RolePermissionAccessData>();
    const { searchText, updateSearchText } = useDebounceSearch(setFilters);

    const { services } = useAppSelector(state => state.reducer.services) ?? {};
    const service = useFindRolesService(services?.data, 'Government Services');

    useEffect(() => {
        if (service) setAccessPermission(service);
    }, [service]);

    const { isLoading, tableData, count, setRefresh, handleToggleStatus } =
        useGetGovtServices(filters);
    const { handlePageChange, handleTableChange } = useFilter({ setFilters });

    const handleEdit = (record: GovtService) => {
        setModalData(record);
        setOpenModal(true);
    };

    const confirmStatusToggle = () => {
        if (pendingStatusRecord) {
            handleToggleStatus(pendingStatusRecord);
        }
        setStatusModal(false);
        setPendingStatusRecord(undefined);
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            sorter: true,
            key: 'createdAt',
            render: (createdAt: string) => (
                <Text>{formattedDateOnly(new Date(createdAt))}</Text>
            ),
        },
        {
            title: 'Service Name',
            dataIndex: 'name',
            sorter: true,
            key: 'name',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            sorter: true,
            key: 'category',
        },
        {
            title: 'Tag',
            dataIndex: 'tag',
            sorter: true,
            key: 'tag',
        },
        {
            title: 'Processing Time',
            dataIndex: 'processingTime',
            key: 'processingTime',
            render: (val: string | null) => <Text>{val || '-'}</Text>,
        },
        {
            title: 'Peko Fee (₹)',
            dataIndex: 'price',
            sorter: true,
            key: 'price',
            render: (price: string | number) => (
                <Text>₹{Number(price).toLocaleString('en-IN')}</Text>
            ),
        },
        {
            title: 'Govt Fee (₹)',
            dataIndex: 'govtFee',
            key: 'govtFee',
            render: (fee: string | number | null) =>
                fee !== null && fee !== undefined ? (
                    <Text>₹{Number(fee).toLocaleString('en-IN')}</Text>
                ) : (
                    <Text>Free</Text>
                ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            sorter: true,
            key: 'status',
            render: (status: boolean | number, record: GovtService) => (
                <Tooltip
                    placement="top"
                    title={
                        !accessPermission?.update
                            ? 'Sorry, you do not have permission to perform this action'
                            : ''
                    }
                >
                    <span>
                        {status === true || status === 1 ? (
                            <CheckOutlined
                                className={`cursor-pointer ${
                                    accessPermission?.update ? 'text-textLime' : 'text-gray-400'
                                }`}
                                style={{ cursor: accessPermission?.update ? 'pointer' : 'not-allowed' }}
                                onClick={() => {
                                    if (accessPermission?.update) {
                                        setPendingStatusRecord(record);
                                        setStatusModal(true);
                                    }
                                }}
                            />
                        ) : (
                            <CloseOutlined
                                className={`cursor-pointer ${
                                    accessPermission?.update ? 'text-brandColor' : 'text-gray-400'
                                }`}
                                style={{ cursor: accessPermission?.update ? 'pointer' : 'not-allowed' }}
                                onClick={() => {
                                    if (accessPermission?.update) {
                                        setPendingStatusRecord(record);
                                        setStatusModal(true);
                                    }
                                }}
                            />
                        )}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_: any, record: GovtService) => (
                <Tooltip
                    placement="top"
                    title={
                        !accessPermission?.update
                            ? 'Sorry, you do not have permission to perform this action'
                            : ''
                    }
                >
                    <span>
                        {accessPermission?.update ? (
                            <EditOutlined onClick={() => handleEdit(record)} />
                        ) : (
                            <EditOutlined style={{ color: 'gray', cursor: 'not-allowed' }} />
                        )}
                    </span>
                </Tooltip>
            ),
        },
    ];

    return (
        <Flex vertical gap={20}>
            <GovtServicesHeader
                handleSearch={updateSearchText}
                searchText={searchText}
                setRefresh={setRefresh}
                accessPermission={accessPermission}
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
                className="justify-end text-end pt-7"
                onChange={handlePageChange}
                total={count}
                showSizeChanger={false}
            />
            {openModal && (
                <GovtServicesModal
                    open={openModal}
                    data={modalData}
                    handleCancel={() => {
                        setOpenModal(false);
                        setModalData(undefined);
                    }}
                    setRefresh={setRefresh}
                />
            )}
            {statusModal && (
                <ConfirmationModal
                    handleSubmit={confirmStatusToggle}
                    handleCancel={() => {
                        setStatusModal(false);
                        setPendingStatusRecord(undefined);
                    }}
                    isOpen={statusModal}
                    title={`Do you want to ${pendingStatusRecord?.status ? 'deactivate' : 'activate'} this service?`}
                    isLoading={false}
                />
            )}
        </Flex>
    );
};

export default GovtServices;
