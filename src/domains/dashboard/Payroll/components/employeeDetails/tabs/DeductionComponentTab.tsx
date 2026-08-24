import React, { useState } from 'react';

import { Col, Row } from 'antd';
import { useLocation } from 'react-router-dom';

import ConfirmationModal from '@components/molecular/modals/ConfirmationModal';

import { useDeductionActions } from '../../../hooks/employeeProfileHooks/useEmployeeDeductionApi';
import { useGetAllDeduction } from '../../../hooks/employeeProfileHooks/useGetEmployeeDeductionApi';
import { EmployeeProfile } from '../../../types/employeeprofile/type';
import { filterState } from '../../../types/salaryProfileTypes/employeeSalaryTable';
import useFilter from '../../../utils/general/useFilter';
import DeductionDetails from '../DeductionDetails';
import DetailsHeader from '../DetailsHeader';
import EmployeeDeductionModal from '../modals/EmployeeDeductionModal';

type Props = {
    employeeData: EmployeeProfile | false | undefined;
    setRefState: (num: number) => void;
    isLoading: boolean;
};

const DeductionComponentTab = ({ employeeData, setRefState, isLoading }: Props) => {
    const location = useLocation();
    const [openDeductionCompModal, setOpenDeductionCompModal] = useState(false);
    const [selectedRecordData, setSelectedRecordData] = useState<any | null>(null);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);

    const { month, year } = location.state;
    const employeeId =
        employeeData && typeof employeeData !== 'boolean' ? employeeData.id : undefined;

    const [reloadTable, setReloadTable] = useState(false);

    const initialYear = year;
    const initialMonth = month;
    const initialValues = {
        searchText: '',
        sort: 'ASC',
        page: 1,
        limit: 10,
        filter: '',
        year: initialYear,
        month: initialMonth,
    };
    const [filter, setFilter] = useState<filterState>(initialValues);
    const { handlePageChange } = useFilter({
        setFilter,
    });
    const { data, count, amount, tableLoading } = useGetAllDeduction(
        employeeId || '',
        filter.page,
        filter.limit,
        filter.year,
        filter.month,
        reloadTable
    );

    const { deleteDeductionAction, isLoading: deleteLoader } = useDeductionActions(() =>
        setOpenConfirmationModal(false)
    );

    const handleEdit = async (selectedRowData: any) => {
        setSelectedRecordData(selectedRowData);
        setOpenDeductionCompModal(true);
    };
    const handleDelete = (selectedRowData: any) => {
        setSelectedRecordData(selectedRowData);
        setOpenConfirmationModal(true);
    };
    const handleDeleteDeductionComp = async () => {
        await deleteDeductionAction(selectedRecordData?.id!);
        setSelectedRecordData(null);
        setReloadTable(p => !p);
    };

    return (
        <Row className="">
            <Col span={24}>
                <DetailsHeader
                    onAddComponent={() => {
                        setSelectedRecordData(null);
                        setOpenDeductionCompModal(true);
                    }}
                    amount={amount}
                    tableLoading={tableLoading}
                />
                <DeductionDetails
                    data={data}
                    page={filter.page}
                    totalCount={count}
                    handlePageChange={handlePageChange}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleDeleteDeductionComp={handleDeleteDeductionComp}
                    tableLoading={tableLoading}
                />

                {openDeductionCompModal && (
                    <EmployeeDeductionModal
                        employeeId={employeeId || ''}
                        open={openDeductionCompModal}
                        handleCancel={() => setOpenDeductionCompModal(false)}
                        selectedRecordData={selectedRecordData}
                        reloadTable={setReloadTable}
                    />
                )}

                {openConfirmationModal && (
                    <ConfirmationModal
                        isOpen={openConfirmationModal}
                        handleCancel={() => setOpenConfirmationModal(false)}
                        title="Are you sure you want to delete this deduction component?"
                        handleSubmit={handleDeleteDeductionComp}
                        isLoading={deleteLoader}
                    />
                )}
            </Col>
        </Row>
    );
};

export default DeductionComponentTab;
