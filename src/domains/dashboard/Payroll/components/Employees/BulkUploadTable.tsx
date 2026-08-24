import { useEffect, useState } from 'react';

import { Col, Row, Typography, Table, Button, Pagination } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import moment from 'moment';
import '../../assets/styles.css';

import { useAppSelector } from '@src/hooks/store';

import { EmployeeDisplayType } from '../../types/employeeOnboarding';
import BulkUploadCreateModal from '../modals/BulkUploadCreateModal';

type InitialStateDataType = {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    mobileNo: string;
    email: string;
    country: string;
    state: string | null;
    addressLine1: string;
    addressLine2: string;
    pinCode: string;
    emergencyContactNumber: string | null;
    emergencyContactName: string | null;
    emergencyContactRelation: string | null;
    employeeId: string;
    department: string;
    workingHours: number;
    dateOfJoin: string;
    designation: string;
    workEmailId: string;
    workingDays: string;
    contractType: string;
    reportingStaff: string | null;
    timeSchedule: string;
    employeeStatus: string;
    probationPeriod: string | null;
    accountHolderName: string | null;
    accountNumber: string | null;
    bankName: string | null;
    ifscCode: string | null;
    validated: boolean;
    errors: string[];
    corporateUser?: string;
};
const BulkEmployeesTable = ({ onCountChange }: any) => {
    const jsonData = useAppSelector(state => state.reducer.BulkUpload);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const errorCount = jsonData.filter(item => item.errors.length > 0).length;

        const successCount = jsonData.filter(item => item.errors.length === 0).length;
        onCountChange(jsonData.length, errorCount, successCount);
    }, [jsonData, onCountChange]);

    const employeeTypeData: EmployeeDisplayType[] = jsonData.map(item => ({
        id: item.employeeId,
        fullName: item.fullName,
        errors: item.errors,
        status: item.validated,
        joinDate: item.dateOfJoin,
        role: item.designation,
        employeeId: item.employeeId,
    }));

    const [isModalVisible, setIsModalVisible] = useState(false);
    // const [selectedEmployee, setSelectedEmployee] = useState<InitialStateDataType | undefined>(
    //     undefined
    // );
    const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState<{
        data: InitialStateDataType | undefined;
        index: number;
    }>();
    const handleClick = (id: any) => {
        const index = jsonData.findIndex(item => item.employeeId === id);
        const employee = jsonData[index];
        if (employee) {
            setIsModalVisible(true);
            // setSelectedEmployee(employee);
            setSelectedEmployeeInfo({ data: employee, index });
            // You can do something with the employee data here
        }
        setIsModalVisible(true);
    };

    const columns: TableColumnsType<EmployeeDisplayType> = [
        {
            title: '#',
            key: 'serial',
            render: (text, record, index) => (current - 1) * pageSize + index + 1,
        },
        {
            title: 'Employee ID',
            dataIndex: 'employeeId',
            render: (employeeId: string) => <Typography.Text>{employeeId}</Typography.Text>,
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',

            render: (fullName: string) => <Typography.Text>{fullName}</Typography.Text>,
        },
        {
            title: 'Designation',
            dataIndex: 'role',
            render: (role: string) => <Typography.Text>{role}</Typography.Text>,
        },
        {
            title: 'Joining Date',
            dataIndex: 'joinDate',
            render: (joinDate: string) => (
                <Typography.Text>{moment(joinDate).format('MMMM DD, YYYY')}</Typography.Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'errors',
            render: (errors: string[]) => (
                <Typography.Text style={{ color: errors.length === 0 ? 'green' : 'red' }}>
                    {errors.length === 0 ? 'Success' : `Error (${errors.length})`}
                </Typography.Text>
            ),
        },
        {
            title: 'Message',
            dataIndex: 'errors',
            render: (errors: string[]) => (
                <ul style={{ color: 'red' }}>
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            ),
        },

        {
            title: 'Actions',
            dataIndex: 'id',
            width: '10%',
            render: (id: number) => (
                <Button type="link" onClick={() => handleClick(id)} style={{ color: 'red' }}>
                    View and Edit
                </Button>
            ),
        },
    ];

    const handleTableChange: TableProps<EmployeeDisplayType>['onChange'] = (
        pagination,
        filters,
        sorter,
        extra
    ) => {
        if (pagination.current) setCurrent(pagination.current);
        if (pagination.pageSize) setPageSize(pagination.pageSize);
    };
    // const titleStyle = {
    //     backgroundColor: '#42526D',
    //     color: 'white',
    // };

    return (
        <>
            <Row className="mt-4" gutter={[0, 20]}>
                <Col span={24}>
                    <Table
                        rowKey={record => record.id}
                        columns={columns}
                        scroll={{ x: 992 }}
                        dataSource={employeeTypeData}
                        onChange={handleTableChange}
                        pagination={false}
                    />
                </Col>
                <Col span={24}>
                    <div className="flex xs:justify-center md:justify-end xs:mt-4">
                        <Pagination
                            current={current}
                            pageSize={pageSize}
                            total={jsonData.length}
                            showSizeChanger={false}
                            onChange={(page, size) => {
                                setCurrent(page);
                                setPageSize(size);
                            }}
                        />
                    </div>
                </Col>
            </Row>
            {isModalVisible && (
                <BulkUploadCreateModal
                    open={isModalVisible}
                    handleCancel={() => setIsModalVisible(false)}
                    // employeeData={selectedEmployee} // Pass the selected employee data as a prop
                    employeeData={selectedEmployeeInfo?.data}
                    employeeIndex={selectedEmployeeInfo?.index}
                />
            )}
        </>
    );
};

export default BulkEmployeesTable;
