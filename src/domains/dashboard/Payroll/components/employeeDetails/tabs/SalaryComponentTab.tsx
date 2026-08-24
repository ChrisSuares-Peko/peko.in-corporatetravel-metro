import React, { useEffect, useState } from 'react';

import { Col, Pagination, Row } from 'antd';
import { useLocation } from 'react-router-dom';

import GenericTable from '@components/atomic/GenericTable';
import ConfirmationModal from '@components/molecular/modals/ConfirmationModal';

import { useGetEmployeeSalaryComp } from '../../../hooks/employeeProfileHooks/useGetEmployeeSalaryCompApi';
import { useGetEmployeeSalaryComponent } from '../../../hooks/OrganizationSettings/useGetEmployeeCurrentSalaryCompApi';
import { useSalaryCompActions } from '../../../hooks/OrganizationSettings/useSalaryComponentApi';
import { EmployeeProfile } from '../../../types/employeeprofile/type';
import { filterState } from '../../../types/types';
import { employeeSalaryCompColumn } from '../../../utils/employeeDetails/data';
import useFilter from '../../../utils/general/useFilter';
import EmployeeSalaryCompModal from '../../EmployeeProfile/EmployeeSalaryCompModal';
import SalaryCompHeader from '../SalaryCompHeader';

type Props = {
    employeeData: EmployeeProfile | false | undefined;
    setRefState: (num: number) => void;
    isLoading: boolean;
    setBasicSalaryAmount: (amount: number) => void;
};

const SalaryComponentTab = ({
    employeeData,
    setRefState,
    isLoading,
    setBasicSalaryAmount,
}: Props) => {
    const location = useLocation();
    const [openSalaryCompModal, setOpenSalaryCompModal] = useState(false);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [selectedRecordData, setSelectedRecordData] = useState<any | null>(null);
    const [reloadTable, setReloadTable] = useState(false);
    const { employeeId } = location.state;

    const initialValues = {
        searchText: '',
        sort: 'ASC',
        page: 1,
        limit: 10,
        filter: '',
        year: 0,
        month: '',
    };
    const [filter, setFilter] = useState<filterState>(initialValues);
    const { handlePageChange } = useFilter({
        setFilter,
    });
    const { data, count, amount, tableLoading } = useGetEmployeeSalaryComp(
        employeeId,
        filter.page,
        filter.limit,
        reloadTable
    );

    useEffect(() => {
        const basic = data?.find(item => item.componentName === 'Basic Salary');

        if (basic) {
            setBasicSalaryAmount(basic.amountPercentage);
        }
    }, [data, setBasicSalaryAmount]);
    

    const { data: data2 } = useGetEmployeeSalaryComponent();
    const calculationBasedOnMap = data2?.reduce(
        (acc, comp) => {
            acc[comp.id] = comp.componentName;
            return acc;
        },
        {} as Record<string, string>
    );

    const { deleteSalaryCompAction, isLoading: deleteLoader } = useSalaryCompActions(() =>
        setOpenConfirmationModal(false)
    );
    const handleEdit = async (selectedRowData: any) => {
        setSelectedRecordData(selectedRowData);
        setOpenSalaryCompModal(true);
    };
    const handleDelete = (selectedRowData: any) => {
        setSelectedRecordData(selectedRowData);
        setOpenConfirmationModal(true);
    };
    const handleDeleteSalaryComp = async () => {
        await deleteSalaryCompAction(selectedRecordData?.id!);
        setSelectedRecordData(null);
        setReloadTable(p => !p);
    };
    return (
        <Row>
            <Col span={24}>
                <SalaryCompHeader
                    onAddComponent={() => {
                        setSelectedRecordData(null);
                        setOpenSalaryCompModal(true);
                    }}
                    amount={amount}
                    tableLoading={tableLoading}
                />
                <GenericTable
                    className="mt-4"
                    rowKey={record => record.id}
                    dataSource={data}
                    columns={employeeSalaryCompColumn(
                        handleEdit,
                        handleDelete,
                        calculationBasedOnMap
                    )}
                    size="small"
                    pagination={false}
                    loading={tableLoading}
                />

                <Pagination
                    current={filter.page}
                    size="default"
                    className="text-end pt-7"
                    total={count}
                    onChange={handlePageChange}
                    pageSize={filter.limit}
                />
                {openSalaryCompModal && (
                    <EmployeeSalaryCompModal
                        open={openSalaryCompModal}
                        handleCancel={() => setOpenSalaryCompModal(false)}
                        selectedRecordData={selectedRecordData}
                        reloadTable={setReloadTable}
                        employeeId={employeeId}
                    />
                )}
                <ConfirmationModal
                    isOpen={openConfirmationModal}
                    handleCancel={() => setOpenConfirmationModal(false)}
                    title="Are you sure you want to delete this salary Component?"
                    handleSubmit={handleDeleteSalaryComp}
                    isLoading={deleteLoader}
                />
            </Col>
        </Row>
    );
};

export default SalaryComponentTab;
