import { lazy, useState } from 'react';

import type { TableProps } from 'antd';
import '../../assets/styles.css';
import { Col, Row, Table, Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import useDebounce from '@src/hooks/useDebounce';
import { showToast } from '@src/slices/apiSlice';

import EmptyEmployeeTable from './EmptyEmployeeTable';
import { useDeleteEmployeeApi } from '../../hooks/employeeHooks/useDeleteEmployeeApi';
import { Employee, useEmployeeListApi } from '../../hooks/employeeHooks/useEmployeeListApi';
import { getEmployeeTableColumns } from '../../utils/onboardEmployee/employeeTableColumns';
import OffBoardEmployeeModal from '../modals/OffBoardEmployeeModal';

const ConfirmationModal = lazy(() => import('@components/molecular/modals/ConfirmationModal'));

interface EmployeeProps {
    searchText: string;
    employeeStatus: 'active' | 'past';
    offboardReload: boolean;
    setOffboardReload: React.Dispatch<React.SetStateAction<boolean | number>>;
}

const EmployeesTable = ({
    searchText,
    employeeStatus,
    offboardReload,
    setOffboardReload,
}: EmployeeProps) => {
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [openOffBoardEmployeeModal, setOpenOffBoardEmployeeModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const dispatch = useAppDispatch();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(); // State variable to store the
    const navigate = useNavigate();
    const [sortField, setSortField] = useState<string>('dateOfJoin');
    const [sortOrder, setSortOrder] = useState<string>('desc');
    const debouncedSearch = useDebounce(searchText, 500);

    const {
        data,
        isLoading: employeeLoader,
        currentPage,
        setCurrentPage,
        count,
        refetch,
        setLimit,
    } = useEmployeeListApi({
        employeeStatus,
        offboardReload,
        sortField,
        sortOrder,
        debouncedSearch,
    });

    const { deleteUser, isLoading: isDeleting } = useDeleteEmployeeApi({
        handleCancel: () => setOpenConfirmationModal(false),
    });

    const handleDelete = async (employeeId: string) => {
        try {
            setSelectedEmployeeId(employeeId);
            setOpenConfirmationModal(true);

            await deleteUser(employeeId);
            refetch();
            dispatch(
                showToast({ variant: 'success', description: 'Employee deleted successsfully' })
            );
        } catch (error) {
            dispatch(
                showToast({
                    variant: 'error',
                    description: 'Failed to delete the employee. Please try again later.',
                })
            );
        }
    };
    // const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const EmployeeListcolumns = getEmployeeTableColumns({
        employeeStatus,
        onDelete: id => {
            setSelectedEmployeeId(id);
            setOpenConfirmationModal(true);
        },
        navigate,
        onOffboard: record => {
            setSelectedEmployee(record);
            setSelectedEmployeeId(record.id);
            setOpenOffBoardEmployeeModal(true);
        },
    });

    const handleTableChange: TableProps<Employee>['onChange'] = (
        pagination,
        filters,
        sorter,
        extra
    ) => {
        if (!Array.isArray(sorter) && sorter.order) {
            setSortField(sorter.field as string);
            setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
        }
    };

    const handlePageChange = (page: number, Limit: number) => {
        setCurrentPage(page);
        setLimit(Limit);
    };

    return (
        <Row className="mt-4" gutter={[0, 20]}>
            <Col span={24}>
                <Table
                    rowKey={record => record.employeeInformation?.employeeId}
                    columns={EmployeeListcolumns}
                    scroll={{ x: 992 }}
                    dataSource={data}
                    onChange={handleTableChange}
                    pagination={false}
                    style={{ overflow: 'auto' }}
                    locale={{
                        emptyText: !employeeLoader ? <EmptyEmployeeTable /> : null, // Show only when not loading
                    }}
                    loading={employeeLoader}
                />
            </Col>
            <Col span={24}>
                {data.length > 0 && (
                    <Pagination
                        current={currentPage}
                        size="default"
                        className="md:text-end pt-7 xs:text-center"
                        total={count}
                        onChange={handlePageChange}
                        defaultPageSize={10}
                    />
                )}
            </Col>

            <ConfirmationModal
                isOpen={openConfirmationModal}
                handleCancel={() => setOpenConfirmationModal(false)}
                title="Are you sure you want to delete this employee?This action is irreversible and will permanently remove all associated data."
                handleSubmit={() => handleDelete(selectedEmployeeId!)}
                isLoading={isDeleting}
            />
            {openOffBoardEmployeeModal && (
                <OffBoardEmployeeModal
                    open={openOffBoardEmployeeModal}
                    handleCancel={() => setOpenOffBoardEmployeeModal(false)}
                    employeeData={selectedEmployee}
                    setOffboardReload={setOffboardReload}
                />
            )}
        </Row>
    );
};

export default EmployeesTable;
