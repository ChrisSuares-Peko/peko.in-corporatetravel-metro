import { useState } from 'react';

import { Button, Flex, Pagination, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

import GenericTable from '@components/atomic/GenericTable';
import { formattedDateOnly, formattedTime } from '@utils/dateFormat';

// eslint-disable-next-line import/no-cycle
import GovtServiceApplicationDrawer from './GovtServiceApplicationDrawer';
import Header from './Header';
import { GovtServicesApplicationBody } from '../../api/govtServicesApplications';
import useFilter from '../../hooks/useFilter';
import useGetCorporateDatas from '../../hooks/useGetCorporateDatas';
import useGovtServicesApplications from '../../hooks/useGovtServicesApplications';

const { Text } = Typography;

export const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'default',
    SUBMITTED: 'orange',
    IN_REVIEW: 'orange',
    APPROVED: 'green',
    COMPLETED: 'green',
    REJECTED: 'red',
    ACTION_REQUIRED: 'red',
    REUPLOAD: 'red',
};

export const formatServiceName = (slug: string) =>
    slug
        .replace(/^govt[_-]/i, '')
        .split(/[-_]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

const GovtServicesApplications = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const initialValues = {
        searchText: '',
        sort: 'DESC',
        sortField: '',
        page: 1,
        itemsPerPage: 10,
        from: today,
        to: today,
        id: '',
        status: '',
    };

    const [filters, setFilters] = useState(initialValues);
    const { isLoading, tableData, count, refetch } = useGovtServicesApplications(filters);
    const {
        handleSearch,
        handlePageChange,
        handleDateChange,
        handleFromChange,
        handleToChange,
        handleChangeFilters,
        handleCategoryFilters,
        handleTableChange,
        searchText,
        setSearchText,
    } = useFilter({
        setFilters,
        initalStartDate: initialValues.from,
        initalEndDate: initialValues.to,
    });

    const { corporateDatas } = useGetCorporateDatas(searchText);

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            sorter: true,
            key: 'createdAt',
            render: (date: string) => (
                <Flex vertical>
                    <Text>{formattedDateOnly(new Date(date))}</Text>
                    <Text type="secondary" className="text-xs">{formattedTime(new Date(date))}</Text>
                </Flex>
            ),
        },
        {
            title: 'Application No.',
            dataIndex: 'applicationNumber',
            sorter: true,
            key: 'applicationNumber',
            render: (val: string) => <Text>{val || '-'}</Text>,
        },
        {
            title: 'Service',
            dataIndex: 'service',
            sorter: true,
            key: 'service',
            render: (slug: string) => <Text>{formatServiceName(slug)}</Text>,
        },
        {
            title: 'Corporate Name',
            key: 'corporateName',
            render: (_: any, record: GovtServicesApplicationBody) => (
                <Text>{record.credential?.name || '-'}</Text>
            ),
        },
        {
            title: 'Corporate ID',
            key: 'corporateId',
            render: (_: any, record: GovtServicesApplicationBody) => (
                <Text>{record.credential?.username || '-'}</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            sorter: true,
            key: 'status',
            render: (status: string) => {
                const label = status === 'DRAFT' ? 'Payment pending' : status.replace(/_/g, ' ');
                const formatted = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
                return <Tag color={STATUS_COLORS[status] ?? 'default'}>{formatted}</Tag>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: GovtServicesApplicationBody) =>
                record.status === 'DRAFT' ? null : (
                    <Button
                        size="small"
                        onClick={() => {
                            setSelectedId(record.id);
                            setDrawerOpen(true);
                        }}
                    >
                        View
                    </Button>
                ),
        },
    ];

    return (
        <Flex vertical gap={20}>
            <Header
                searchText={filters.searchText}
                handleSearch={handleSearch}
                from={filters.from}
                to={filters.to}
                handleDateChange={handleDateChange}
                handleFromChange={handleFromChange}
                handleToChange={handleToChange}
                dropDownData={corporateDatas}
                setSearchText={setSearchText}
                handleChangeFilters={handleChangeFilters}
                handleCategoryFilters={handleCategoryFilters}
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
                className="text-end pt-7 justify-end"
                onChange={handlePageChange}
                total={count}
                showSizeChanger={false}
            />

            {selectedId && (
                <GovtServiceApplicationDrawer
                    id={selectedId}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    onStatusUpdated={() => {
                        setDrawerOpen(false);
                        refetch();
                    }}
                />
            )}
        </Flex>
    );
};

export default GovtServicesApplications;
