import { Button, Col, Flex, Form, Row, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { Field, FieldProps, Formik } from 'formik';
import moment from 'moment';

import DatePickerInput from '@components/atomic/inputs/DatePickerInput';
import SelectInput from '@components/atomic/inputs/SelectInput';
import SelectInputWithSearch from '@components/atomic/inputs/SelectInputWithSearch';
import TextInput from '@components/atomic/inputs/TextInput';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';


import { useGetDepartmentList } from '../../hooks/employeeHooks/useGetDepartment';
import { useValidateEmployeeApi } from '../../hooks/employeeHooks/useGetValidateEmployeeInfoApi';
import useReportingStaffApi from '../../hooks/employeeHooks/useReportingStaffApi';
import { employeeSchema } from '../../schema/employeeProfile';
import { setEmployeeInformation } from '../../slices/employeeSettings';
import { contractTypeOptions, probationOptions, statusOptions } from '../../utils/employeeDetails/utils';
import '../../assets/styles.css';

type Props = {
    nextTab: (key: string) => void;
};

const EmployeeInfo = ({ nextTab }: Props) => {
    const { tableData } = useGetDepartmentList();
    const { validateEmployee, isLoading } = useValidateEmployeeApi();
    const { numberOfDaysWorking } = useAppSelector(state => state.reducer.payrollAuth);

    const { employeeInformation } = useAppSelector(state => state.reducer.employeeSettings);
    const { personalInformation } = useAppSelector(state => state.reducer.employeeSettings);

    const { data } = useReportingStaffApi('');
    const dispatch = useAppDispatch();


   
   

    const handleEmployeeInfoSubmit = async (values: any) => {
        const validationPayload = {
            employeeId: values.employeeId,
            dateOfJoin: values.dateOfJoin,
            workEmailId: values.workEmailId,
            email: personalInformation.email,
        };
        const result = await validateEmployee(validationPayload);

        if (result?.data?.status) {
            dispatch(setEmployeeInformation(values));
            nextTab('3');
        }
    };
    return (
        <Flex vertical className=" my-8">
            <Formik
                initialValues={{
                    dateOfJoin: employeeInformation.dateOfJoin
                        ? moment(employeeInformation.dateOfJoin).format('YYYY-MM-DD')
                        : dayjs().format('YYYY-MM-DD'),
                    employeeId: employeeInformation.employeeId || '',
                    reportingStaff: employeeInformation.reportingStaff || null,
                    department: employeeInformation.department?.departmentName || '',
                    workingHours: employeeInformation.workingHours || 1,
                    workingDays: numberOfDaysWorking,
                    contractType: employeeInformation.contractType || '',
                    designation: employeeInformation.designation || '',
                    employeeStatus: employeeInformation.employeeStatus || '',
                    timeSchedule: employeeInformation.timeSchedule || '',
                    probationPeriod: employeeInformation.probationPeriod || '',
                    workEmailId: employeeInformation.workEmailId || '',
                }}
                onSubmit={handleEmployeeInfoSubmit}
                validationSchema={employeeSchema}
            >
                {({ handleSubmit, values }) => (
                    <Form layout="vertical" onFinish={handleSubmit} className="w-full">
                        <Flex justify="center">
                            <Col span={16}>
                                <Row>
                                    <Col xs={24} sm={10} className="mx-auto">
                                        <DatePickerInput
                                            label="Date of Joining"
                                            name="dateOfJoin"
                                            placeholder="Select Date"
                                            classes="rounded-sm w-full"
                                            maxDate={dayjs(new Date())}
                                            isRequired
                                        />
                                    </Col>
                                    <Col xs={24} sm={10} className="mx-auto">
                                        <TextInput
                                            label="Employee ID"
                                            name="employeeId"
                                            placeholder="Enter Employee ID"
                                            type="text"
                                            maxLength={10}
                                            minLength={4}
                                            isRequired
                                            allowAlphabetsAndNumbersOnly
                                        />
                                    </Col>
                                    <Col xs={24} sm={10} className="mx-auto">
                                        <SelectInputWithSearch
                                            label="Department"
                                            name="department"
                                            placeholder={
                                                tableData.length > 0
                                                    ? 'Select Department'
                                                    : 'No data available'
                                            }
                                            options={tableData}
                                        />
                                    </Col>
                                    <Col xs={24} sm={10} className="mx-auto">
                                        <TextInput
                                            label="Designation"
                                            name="designation"
                                            placeholder="Enter Designation"
                                            classes="rounded-sm"
                                            type="string"
                                            allowAlphabetsAndSpaceOnly
                                            maxLength={50}
                                            isRequired
                                        />
                                    </Col>
                                    <Col xs={24} sm={10} className="mx-auto">
                                        <SelectInput
                                            label="Reporting Staff"
                                            name="reportingStaff"
                                            placeholder={
                                                data.length > 0
                                                    ? 'Select Reporting Staff'
                                                    : 'No data available'
                                            }
                                            options={data}
                                            allowClear
                                        />
                                    </Col>
                                    <Col xs={24} sm={10} className="mx-auto">
                                        <TextInput
                                            label="Work Email ID"
                                            name="workEmailId"
                                            placeholder="Enter Work Email ID"
                                            type="email"
                                        />
                                    </Col>
                                   
                                    <Col xs={24} sm={10} className="mx-auto">
                                        <Flex vertical gap={8}>
                                            <Field name="timeSchedule">
                                                {({
                                                    field,
                                                    form: { touched, errors, setFieldValue },
                                                }: FieldProps) => (
                                                    <Form.Item
                                                        name="timeSchedule"
                                                        validateStatus={
                                                            touched.timeSchedule &&
                                                            errors.timeSchedule
                                                                ? 'error'
                                                                : ''
                                                        }
                                                        help={
                                                            touched.timeSchedule &&
                                                            errors.timeSchedule
                                                                ? (errors.timeSchedule as React.ReactNode)
                                                                : undefined
                                                        }
                                                        required
                                                        label="Time Schedule"
                                                    >
                                                        <TimePicker.RangePicker
                                                            format="h:mm A"
                                                            use12Hours
                                                            minuteStep={30}
                                                            className="w-full"
                                                            placeholder={['Start Time', 'End Time']}
                                                            onChange={range => {
                                                                if (range) {
                                                                    const [start, end] = range;
                                                                    const formattedRange =
                                                                        start && end
                                                                            ? `${start.format('h:mm A')} - ${end.format('h:mm A')}`
                                                                            : '';
                                                                    setFieldValue(
                                                                        'timeSchedule',
                                                                        formattedRange
                                                                    );
                                                                    if (start && end) {
                                                                        const hours = end.diff(
                                                                            start,
                                                                            'hour',
                                                                            true
                                                                        ); // difference in decimal hours
                                                                        setFieldValue(
                                                                            'workingHours',
                                                                            Number(hours.toFixed(2))
                                                                        ); // set calculated hours
                                                                    } else {
                                                                        setFieldValue(
                                                                            'workingHours',
                                                                            0
                                                                        );
                                                                    }
                                                                } else {
                                                                    // Handle the case where no time is selected
                                                                    setFieldValue(
                                                                        'timeSchedule',
                                                                        ''
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </Form.Item>
                                                )}
                                            </Field>
                                        </Flex>
                                    </Col>
                                    
                                    <Col xs={24} sm={10} className="mx-auto">
                                        <SelectInput
                                            label="Contract Type"
                                            name="contractType"
                                            placeholder="Select Contract Type"
                                            classes="rounded-sm"
                                            options={contractTypeOptions}
                                            isRequired
                                        />
                                    </Col>
                                    <Col xs={24} sm={10} className="mx-auto">
                                        <SelectInput
                                            label="Employee Status"
                                            name="employeeStatus"
                                            placeholder="Select Employee Status"
                                            classes="rounded-sm"
                                            options={statusOptions?.slice().sort((a, b) =>
                                                a.label.localeCompare(b.label)
                                            )}
                                            isRequired
                                        />
                                    </Col>
                                    {values.employeeStatus === 'INPROBATION' && (
                                        <Col xs={24} sm={10} className="mx-auto">
                                            <SelectInput
                                                label="Probation Period"
                                                name="probationPeriod"
                                                placeholder="Probation Period"
                                                classes="rounded-sm"
                                                options={probationOptions}
                                                isRequired
                                            />
                                        </Col>
                                    )}
                                    <Col xs={24} sm={10} className="hidden md:block mx-auto" />
                                </Row>
                                <Flex justify="space-between" className="mt-4 mx-8">
                                    <Button
                                        onClick={() => nextTab('1')}
                                        type="default"
                                        danger
                                        className="font-semibold w-[8rem]"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        loading={isLoading}
                                        htmlType="submit"
                                        type="primary"
                                        danger
                                        className="font-semibold w-[8rem]"
                                    >
                                        Next
                                    </Button>
                                </Flex>
                            </Col>
                        </Flex>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
};

export default EmployeeInfo;
