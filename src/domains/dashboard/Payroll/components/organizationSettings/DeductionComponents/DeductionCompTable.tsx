import React, { useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Input, Row, Typography } from 'antd';

import GenericTable from '@components/atomic/GenericTable';
import ConfirmationModal from '@components/molecular/modals/ConfirmationModal';

import DeductionCompModal from './DeductionCompModal';
import { useDeductionActions } from '../../../hooks/OrganizationSettings/useDeductionComponentApi';
import { useGetAllDeductions } from '../../../hooks/OrganizationSettings/useGetDeductionComponentApi';
import { filterState } from '../../../types/organizationSettings';
import useFilter from '../../../utils/general/useFilter';
import { deductionCompColumn } from '../../../utils/orgSettings/data';

interface Props {
    setActiveTabKey?: (key: any) => void;
    isWelcomePage?: any;
}
const DeductionCompTable: React.FC<Props> = ({ setActiveTabKey, isWelcomePage }) => {
    const [openDeductionCompModal, setOpenDeductionCompModal] = useState(false);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [selectedRecordData, setSelectedRecordData] = useState<any | null>(null);
    const [reloadTable, setReloadTable] = useState(false);

    const initialValues = {
        searchText: '',
        page: 1,
        limit: 10,
    };

    const [filter, setFilter] = useState<filterState>(initialValues);
    const { handlePageChange, handleSearch } = useFilter({
        setFilter,
    });

    const { data, count, tableLoading } = useGetAllDeductions(
        filter.page,
        filter.limit,
        filter.searchText,
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
        <Row>
            {/* <Col md={20} className="mb-5">
                {!hasBasicSalaryComponent && (
                    <Alert
                        message="Note: Please ensure that the Basic Salary component is added before proceeding with other components."
                        type="warning"
                        showIcon
                    />
                )}
            </Col> */}

            <Col
                span={24}
                className={` ${isWelcomePage ? 'xs:p-4 md:p-8 border rounded-2xl  border-[#EAEAEA]' : ''}`}
            >
                {isWelcomePage ? (
                    <Flex justify="space-between" align="center" className="mb-4">
                        <Flex align="center" justify="center">
                            <Typography.Text className="font-medium text-[1.25rem]">
                                Deduction Components
                            </Typography.Text>
                        </Flex>

                        <Flex>
                            <Button
                                className=""
                                type="primary"
                                danger
                                onClick={() => {
                                    setOpenDeductionCompModal(true);
                                    setSelectedRecordData(null);
                                }}
                            >
                                Add New Component
                            </Button>
                        </Flex>
                    </Flex>
                ) : (
                    <Flex justify="space-between">
                        <Col md={20}>
                            <Input
                                placeholder="Search by name"
                                suffix={<SearchOutlined />}
                                allowClear
                                value={filter.searchText}
                                onChange={e => {
                                    const value = e.target.value.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
                                    handleSearch({ ...e, target: { ...e.target, value } });
                                }}
                            />
                        </Col>
                        <Col>
                            <Flex className="justify-end">
                                <Button
                                    className=""
                                    type="primary"
                                    danger
                                    onClick={() => {
                                        setOpenDeductionCompModal(true);
                                        setSelectedRecordData(null);
                                    }}
                                >
                                    Add New Deductions
                                </Button>
                            </Flex>
                        </Col>
                    </Flex>
                )}
                <GenericTable
                    rowKey={record => record.id}
                    columns={deductionCompColumn(handleEdit, handleDelete)?.map(x => {
                        if (x.key === 'action') {
                            x.width = '';
                        }
                        return x;
                    })}
                    dataSource={data || []}
                    loading={tableLoading}
                    pagination={{
                        current: filter.page,
                        pageSize: filter.limit,
                        total: count,
                        onChange: handlePageChange,
                    }}
                />
                {/* {count && count > 0 && (
                    <Flex className="mt-4" justify="end">
                        <Pagination
                            current={filter.page}
                            onChange={handlePageChange}
                            size="default"
                            total={count}
                        />
                    </Flex>
                )} */}
                {openDeductionCompModal && (
                    <DeductionCompModal
                        open={openDeductionCompModal}
                        handleCancel={() => setOpenDeductionCompModal(false)}
                        selectedRecordData={selectedRecordData}
                        reloadTable={setReloadTable}
                        isEmployeeSpecific={false}
                    />
                )}
                <ConfirmationModal
                    isOpen={openConfirmationModal}
                    handleCancel={() => setOpenConfirmationModal(false)}
                    title="Are you sure you want to delete this deduction component?"
                    handleSubmit={handleDeleteDeductionComp}
                    isLoading={deleteLoader}
                />
            </Col>
            {isWelcomePage && (
                <Flex justify="space-between" align="center" gap={10} className="w-full mt-6">
                    <Button
                        onClick={() => setActiveTabKey && setActiveTabKey('2')}
                        className="px-8"
                    >
                        <Typography.Text className="text-textRed">Back</Typography.Text>
                    </Button>
                    <Button
                        className="px-12"
                        type="primary"
                        danger
                        onClick={() => setActiveTabKey && setActiveTabKey('4')}
                    >
                        Next
                    </Button>
                </Flex>
            )}
        </Row>
    );
};

export default DeductionCompTable;
