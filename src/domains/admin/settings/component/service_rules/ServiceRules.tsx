import React, { useEffect, useState } from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Flex, Pagination, Tooltip, Typography } from 'antd';

import GenericTable from '@components/atomic/GenericTable';
import ConfirmationModal from '@components/molecular/modals/ConfirmationModal';
import { useAppSelector } from '@src/hooks/store';
import { formattedDateOnly, formattedTime } from '@utils/dateFormat';
import { useFindRolesService } from '@utils/findRolesService';

import ServiceRulessHeader from './ServiceRulesHeaders';
import ServiceRulesmodal from './ServiceRulesModal';
import useFilter from '../../hooks/useFilters';
import useGetServiceRules from '../../hooks/useGetServiceRules';
import { RolePermissionAccessData } from '../../types/servicePackage';

type Props = {};

const ServiceRules = (props: Props) => {
    const initialValues = {
        searchText: '',
        page: 1,
        itemsPerPage: 10,
        sort: 'DESC',
        sortField: '',
    };
    const [accessPermission, setAccessPermission] = useState<RolePermissionAccessData>();
    const { services } = useAppSelector(state => state.reducer.services) ?? {};
    const service = useFindRolesService(services?.data, 'Service Rule'); // Get the service
    useEffect(() => {
        if (service) {
            setAccessPermission(service); // Update state if service is found
        }
    }, [service]);
    const [filters, setFilters] = useState(initialValues);
    const [openModal, setOpenModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [modalData, setModalData] = useState<any>();
    const { isLoading, tableData, count, deleteData, setRefresh, downloadReport } =
        useGetServiceRules(filters);
    const { handleSearch, handlePageChange, handleTableChange } = useFilter({ setFilters });
    // const handleActive = (docId: number | string, status: any) => {
    //     let active;
    //     if (status === 1 || status === true) active = false;
    //     else active = true;
    //     updateActiveStatus({ docId, status: active });
    // };
    const handleEdit = (record: Document) => {
        setModalData(record);
        setOpenModal(true);
    };
    const handleDelete = () => {
        deleteData(modalData!?.id);
        setDeleteModal(false);
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
            title: 'Rule',
            sorter: true,
            dataIndex: 'rule',
            key: 'rule',
        },
        {
            title: 'Description',
            sorter: true,
            dataIndex: 'description',
            key: 'description',
            render: (description: any) => <Typography.Text>{description}</Typography.Text>,
        },
        {
            title: 'Actions',
            dataIndex: 'action',
            key: 'action',
            render: (_: any, record: Document) => (
                <Flex justify="space-between">
                    <Tooltip
                        placement="top"
                        title={
                            !accessPermission?.update
                                ? 'Sorry, you do not have permission to perform this action'
                                : ''
                        }
                    >
                        <span>
                            {!accessPermission?.update ? (
                                <EditOutlined
                                    style={{ color: 'gray', cursor: 'not-allowed' }}
                                    disabled
                                />
                            ) : (
                                <EditOutlined onClick={() => handleEdit(record)} />
                            )}
                        </span>
                    </Tooltip>
                    <Tooltip
                        placement="top"
                        title={
                            !accessPermission?.update
                                ? 'Sorry, you do not have permission to perform this action'
                                : ''
                        }
                    >
                        <span>
                            {!accessPermission?.update ? (
                                <DeleteOutlined
                                    style={{ color: 'gray', cursor: 'not-allowed' }}
                                    disabled
                                />
                            ) : (
                                <DeleteOutlined
                                    className=" text-brandColor"
                                    onClick={() => {
                                        setModalData(record);
                                        setDeleteModal(true);
                                    }}
                                />
                            )}
                        </span>
                    </Tooltip>
                </Flex>
            ),
        },
    ];
    return (
        <Flex vertical gap={20}>
            <ServiceRulessHeader
                downloadReport={downloadReport}
                setRefresh={setRefresh}
                handleSearch={handleSearch}
                searchText={filters.searchText}
                rowCount={tableData?.length}
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
                <ServiceRulesmodal
                    setRefresh={setRefresh}
                    data={modalData}
                    open={openModal}
                    handleCancel={() => setOpenModal(false)}
                />
            )}{' '}
            {deleteModal && (
                <ConfirmationModal
                    handleSubmit={handleDelete}
                    handleCancel={() => setDeleteModal(false)}
                    isOpen={deleteModal}
                    title="Do you want to proceed with the deletion?"
                    isLoading={false}
                />
            )}
        </Flex>
    );
};

export default ServiceRules;
