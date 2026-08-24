import { DownloadOutlined, EyeOutlined, InfoCircleFilled, InfoCircleOutlined, MailOutlined } from '@ant-design/icons';
import { TableColumnsType, Flex, Avatar, Typography, Tooltip, Badge, Space, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { NavigateFunction } from 'react-router-dom';

import { paths } from '@src/routes/paths';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import { filterState, SalaryInfo, SalaryItem, salarytableType } from '../../types/salaryProfileTypes/employeeSalaryTable';

const { Text } = Typography;

function getInitials(name: string): string {
    const words = name.split(' ');
    const initials = words
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 3)
        .toUpperCase();
    return initials;
}

const formatDate = (date: any) => new Date(date).toISOString().split('T')[0];

export const employeeSalaryColumns = (filter: filterState, navigate: NavigateFunction): TableColumnsType<salarytableType> => {
    console.log(filter,"filter");
    
    return [
    {
        title: 'Name & Employee ID',
        dataIndex: 'name',

        render: (text: string, record: salarytableType) => (
            <Flex gap={10} className='cursor-pointer' onClick={()=>navigate(paths.payroll.employeeSalaryProfile,{
                state:{
                    month: filter.month,
                    year: filter.year,
                    eid:record.eId
                }
            })}>
                <Flex align="center">
                    {record.image ? (
                        <Avatar
                            src={record.image}
                            style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}
                        />
                    ) : (
                        <Avatar style={{ backgroundColor: '#fde3cf', color: 'red' }}>
                            {getInitials(text)}
                        </Avatar>
                    )}
                </Flex>
                <Flex vertical justify="center">
                    <Typography.Text className="text-gray-900 text-base ">
                        {/* <Link
                            style={{ color: '#101828', textDecoration: 'none' }}
                            to={`/${paths.payroll.index}/${paths.payroll.employeesSalary}/${paths.payroll.salaryProfile}`}
                            state={{
                                eId: record.eId,
                                salaryId: record.salaryId,
                                month: filter.month,
                                year: filter.year,
                            }}
                        > */}
                        {text}
                        {/* </Link> */}
                        {record?.employeeStatus === 'RESIGNED' ||
                        record?.employeeStatus === 'SUSPENDED' ? (
                            <Tooltip
                                title={`This employee is under notice period. Last working day: ${formatDate(record?.lastWorkingDay)}`}
                            >
                                <InfoCircleFilled
                                    style={{
                                        marginLeft: '8px',
                                        color: '#1890ff',
                                        cursor: 'pointer',
                                    }}
                                />
                            </Tooltip>
                        ) : null}
                    </Typography.Text>

                    <Typography.Text className="text-slate-500 text-sm font-normal">
                        {record?.employeeId}
                    </Typography.Text>
                </Flex>
            </Flex>
        ),
    },

    {
        title: 'Designation & Department',
        dataIndex: 'role',
        // key: Math.random().toString(36).substring(2, 11),
        render: (text: string, record: salarytableType) => (
            <Flex gap={10}>
                <Flex vertical justify="center">
                    <Typography.Text className="  text-gray-900 text-base font-medium">
                        {text}
                    </Typography.Text>
                    <Typography.Text className="text-slate-500 text-sm font-normal">
                        {record.department}
                    </Typography.Text>
                </Flex>
            </Flex>
        ),
    },
    {
        title:'Email ID',
        dataIndex:'email',
        render: (text: string,record ) => {
            console.log(text,"text",record);
           return (<Typography.Text>{text}</Typography.Text>)},
    },
    {
        title: 'Basic Salary',
        dataIndex: 'basicSalary',
        // key: Math.random().toString(36).substring(2, 11),
    },
    {
        title: 'Total Earning',
        dataIndex: 'monthlySalary',
    },
    {
        title: 'Total Deduction',
        dataIndex: 'totalDeduction',
    },
    {
        title: 'Net Salary',
        dataIndex: 'totalPayable',
        // key: Math.random().toString(36).substring(2, 11),
    },
    // {
    //     title: <Typography.Text>Total Salary</Typography.Text>,
    //     dataIndex: 'totalSalary',
    //     // key: Math.random().toString(36).substring(2, 11),
    // },

    {
        title: 'Status',
        dataIndex: 'status',
        // key: Math.random().toString(36).substring(2, 11),
        render: text => {
            if (text === 'PAID') {
                return (
                    <Badge
                        status="success"
                        text="Paid"
                        className="px-2 rounded-2xl"
                        style={{ backgroundColor: '#ECFDF3', color: '#027A48' }}
                    />
                );
            }
            if (text === 'PENDING') {
                return (
                    <Badge
                        status="error"
                        text="Pending"
                        className="px-2 rounded-2xl"
                        style={{ backgroundColor: '#FFFDD4', color: '#B78912' }}
                    />
                );
            }
            if (text === 'APPROVED') {
                return (
                    <Badge
                        status="success"
                        text="Approved"
                        className="px-1 rounded-2xl"
                        style={{ backgroundColor: '#ECFDF3', color: '#027A48' }}
                    />
                );
            }
            if (text === 'FAILD') {
                return (
                    <Badge
                        status="error"
                        text="Pending"
                        className="px-2 rounded-2xl"
                        style={{ backgroundColor: '#FFF2EA', color: '#F15046' }}
                    />
                );
            }
            if (text === 'UPCOMING') {
                return (
                    <Badge
                        status="warning"
                        text="Upcoming"
                        className="rounded-2xl"
                        // style={{ color: '#FAAD14' }}
                        style={{
                            color: '#FAAD14',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '12px', // Adjust text size
                            padding: '0 4px', // Adjust padding
                        }}
                    />
                );
            }
            return <Badge status="default" text={text} className="px-2 rounded-2xl" />;
        },
        // filters: [
        //     { text: 'PENDING', value: 'PENDING' },
        //     { text: 'PAID', value: 'PAID' },
        //     // { text: 'UPCOMING', value: 'UPCOMING' },
        //     // { text: 'FAILD', value: 'FAILD' },
        // ],
        // onFilter: (value, record) => record.status === value,
    },
]}

export const payslipColumns = (handleDownload:(year:string,month:string)=>Promise<void>, handleEmail:(year:string,month:string)=>Promise<void>) => [
    {
        title: <Text style={{ fontSize: 13, fontWeight: 700 }}>Payrun</Text>,
        dataIndex: 'payrun',
        key: 'payrun',
        render: (text:string) => <Text >{text}</Text>
    },
    {
        title: <Text  style={{ fontSize: 13, fontWeight: 700 }}>Payrun Mode</Text>,
        dataIndex: 'payrunMode',
        key: 'payrunMode',
        render: (text:string) => <Text >{text}</Text>
    },
    {
        title: <Text style={{ fontSize: 13, fontWeight: 700 }}>Status</Text>,
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
            <Badge
                status={
                    // eslint-disable-next-line no-nested-ternary
                    status?.toLowerCase() === "approved"
                        ? "success"
                        : status?.toLowerCase() === "pending"
                            ? "error"
                            : "warning"
                }
                text={status}
                style={{
                    backgroundColor:
                        // eslint-disable-next-line no-nested-ternary
                        status?.toLowerCase() === "approved"
                            ? '#ECFDF3'
                            : status?.toLowerCase() === "pending"
                                ? '#FFF1F0'
                                : '#FFF6EA',
                    color:
                        // eslint-disable-next-line no-nested-ternary
                        status?.toLowerCase() === "approved"
                            ? '#12B76A'
                            : status?.toLowerCase() === "pending"
                                ? '#ff4d4f'
                                : '#FFA940',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontWeight: 500,
                }}
                className="m-1"
            />
        )
    },
    {
        title: <Text style={{ fontSize: 13, fontWeight: 700 }}>Total Paid</Text>,
        dataIndex: 'totalPaid',
        key: 'totalPaid',
        render: (text:string) => <Text >{text}</Text>
    },
    {
        title: <Text style={{ fontSize: 13, fontWeight: 700 }}>Action</Text>,
        key: 'action',
        render: (_:any,record:any) => (
            <Space size="middle">
                <Button type="text" onClick={() => {
                    const [, monthStr, yearStr] = record.payrun.split('-');
                    handleEmail(yearStr, monthStr);
                }} icon={<MailOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />} style={{ padding: 0 }} />
                <Button type="text" onClick={()=>{
                    // payrun is in dd-mm-yyyy format, so parse accordingly
                    const [, monthStr, yearStr] = record.payrun.split('-');
                    handleDownload(yearStr, monthStr);
                    }} icon={<DownloadOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />} style={{ padding: 0 }} />
            </Space>
        )
    },
];

export const monthsArray = [
    // {label:'All',value:null},
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
];
let currentYear = new Date().getFullYear();
currentYear += 1;
export const yearsArray = Array.from({ length: 10 }, (_, index) => {
    const year = (currentYear - index).toString();
    return { label: year, value: year };
});
export const yearsCurrentAndNext = Array.from({ length: 2 }, (_, index) => {
    const year = (currentYear - index).toString();
    return { label: year, value: year };
});

export const years = [
    ...Array.from({ length: 5 }, (_, index) => {
        const year = (currentYear - (5 - index)).toString();
        return { label: year, value: year };
    }),
    ...Array.from({ length: 6 }, (_, index) => {
        const year = (currentYear + index).toString();
        return { label: year, value: year };
    }),
];

export const payrollHistoryDummyData = [
    {
        id: 'ph001',
        createdDate: '08-04-2023',
        month: 'Full Month',
        processedOn: '08-04-2023',
        totalEmployees: 45,
        totalAmount: '₹ 10,000',
        status: 'Paid',
    },
    {
        id: 'ph002',
        createdDate: '08-04-2023',
        month: 'Full Month',
        processedOn: '08-04-2023',
        totalEmployees: 55,
        totalAmount: '₹ 10,000',
        status: 'Paid',
    },
    {
        id: 'ph003',
        createdDate: '08-04-2023',
        month: 'Full Month',
        processedOn: '08-04-2023',
        totalEmployees: 28,
        totalAmount: '₹ 10,000',
        status: 'Paid',
    },
    {
        id: 'ph004',
        createdDate: '08-04-2023',
        month: 'Full Month',
        processedOn: '08-04-2023',
        totalEmployees: 36,
        totalAmount: '₹ 10,000',
        status: 'Paid',
    },
];

export const getPayrollHistoryColumns = (
    handleView: (record: any) => void,
    handleDownload: (record: any) => void,
    downloadingId: string | null = null
): TableColumnsType<any> => [
    {
        title: 'Created Date',
        dataIndex: 'createdDate',
    },
    {
        title: 'Month',
        dataIndex: 'month',
    },
    {
        title: 'Processed On',
        dataIndex: 'processedOn',
        render: (val: string) => val || 'N/A',
    },
    {
        title: 'Total Employees',
        dataIndex: 'totalEmployees',
    },
    {
        title: 'Total Amount',
        dataIndex: 'totalAmount',
    },
    {
        title: 'Salary Status',
        dataIndex: 'status',
        render: (status: string) => (
            <Badge
                status={
                    // eslint-disable-next-line no-nested-ternary
                    status.toLowerCase() === "approved"
                        ? "success"
                        : status.toLowerCase() === "pending"
                        ? "error"
                        : "warning"
                }
                text={status}
                style={{
                    backgroundColor:
                        // eslint-disable-next-line no-nested-ternary
                        status.toLowerCase() === "approved"
                            ? '#ECFDF3'
                            : status.toLowerCase() === "pending"
                            ? '#FFF1F0'
                            : '#FFF6EA',
                    color:
                        // eslint-disable-next-line no-nested-ternary
                        status.toLowerCase() === "approved"
                            ? '#12B76A'
                            : status.toLowerCase() === "pending"
                            ? '#ff4d4f'
                            : '#FFA940',
                    padding: '4px 10px',
                    borderRadius: '10px',
                }}
            />
        ),
    },
    {
        title: 'Action',
        key: 'action',
        render: (_: any, record: any) => (
            <Space size="middle">
                <Tooltip title="View">
                    <Button
                        type="text"
                        icon={<EyeOutlined className="text-[#E30000]" />}
                        onClick={() => handleView(record)}
                    />
                </Tooltip>
                <Tooltip title="Download">
                    <Button
                        type="text"
                        icon={<DownloadOutlined className="text-[#E30000]" />}
                        loading={downloadingId === record.id}
                        onClick={() => handleDownload(record)}
                    />
                </Tooltip>
            </Space>
        ),
    },
];

export const monthNames = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                ];


export const salaryProfileColumns: ColumnsType<SalaryItem> = [
    {
        title: <Text className='text-[13px] font-[700]'>Component Name</Text>,
        dataIndex: 'componentName',
        key: 'componentName',
        render: (text) => <Text  >{text}</Text>
    },
    {
        title: <Text className='text-[13px] font-[700]'>Category</Text>,
        dataIndex: 'category',
        key: 'category',
        render: (text) => <Text >{text}</Text>
    },
    {
        title: <Text  className='text-[13px] font-[700]'>Amount/Percentage</Text>,
        dataIndex: 'amount',
        key: 'amount',
        render: (text) => <Text >{text}</Text>
    },
];


export const allowanceKeys: (keyof SalaryInfo)[] = [
    'hraAmount',
    'daAmount',
    'bonus',
    'incentiveAmount',
    'increamentAmount',
    'overtimeAmount',
    'other',
];

export const salaryProfileNewColumns = (filter: { month: number; year: number }, navigate: NavigateFunction): ColumnsType<any> => [
        {
            title: 'Name & Employee ID',
            dataIndex: 'name',
            key: 'name',
            render: (_: any, record: any) => (
                <Space
                    size="middle"
                    align="center"
                    className="cursor-pointer"
                    onClick={() =>
                        navigate(
                            `/${paths.payroll.index}/${paths.payroll.employeesSalary}/${paths.payroll.employeeSalaryProfile}`,
                            {
                                state: {
                                    month: filter.month,
                                    year: filter.year,
                                    eid:record.id
                                },
                            }
                        )
                    }
                >
                    <Avatar
                        style={{
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            fontWeight: 500,
                            fontSize: '14px',
                        }}
                        size="large"
                    >
                        {record.initials}
                    </Avatar>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: '14px', color: '#1f2937' }}>
                            {record.name}
                            {record.bankDetails.length<1 ? (
                    <Tooltip title="Bank details missing">
                         <InfoCircleOutlined style={{ color: 'red', marginLeft: 4 }} />
                    </Tooltip>
                ) : null}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                            {record.employeeId}
                        </Text>
                
                    </div>
                </Space>
            ),
        },
        {
            title: 'Designation & Department',
            dataIndex: 'designation',
            key: 'designation',
            render: (_: any, record: any) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: '14px', color: '#4b5563' }}>{record.designation}</Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        {record.department}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Basic Salary',
            dataIndex: 'basicSalary',
            key: 'basicSalary',
            render: (text: any) => <Text style={{ color: '#4b5563', fontSize: '14px' }}>{text}</Text>,
        },
        {
            title: 'Total Allowance',
            dataIndex: 'totalAllowance',
            key: 'totalAllowance',
            render: (text: any) => <Text style={{ color: '#4b5563', fontSize: '14px' }}>{text}</Text>,
        },
        {
            title: 'Total Deductions',
            dataIndex: 'totalDeductions',
            key: 'totalDeductions',
            render: (text: any) => <Text style={{ color: '#4b5563', fontSize: '14px' }}>{text}</Text>,
        },
        {
            title: 'Net Salary',
            dataIndex: 'netSalary',
            key: 'netSalary',
            render: (text: any) => <Text style={{ color: '#4b5563', fontSize: '14px' }}>{text}</Text>,
        },
];


export const formatCurrency = (value: number) => `₹ ${formatNumberWithLocalString(value || 0)}`;
