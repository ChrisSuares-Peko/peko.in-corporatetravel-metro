import { useState } from 'react';

import { Flex, Form, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { Field, FieldProps } from 'formik';
import moment from 'moment';

import SelectInputWithSearch from '@components/atomic/inputs/SelectInputWithSearch';
import TextInput from '@components/atomic/inputs/TextInput';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';

import CustomModalWithForm from './CustomModalWithForm';
import { useBulkValidateApi } from '../../hooks/employeeHooks/useBulkValidateApi';
import useGeneralApi from '../../hooks/employeeHooks/useGetCountry';
import useReportingStaffApi from '../../hooks/employeeHooks/useReportingStaffApi';
import { bulkUploadSchema } from '../../schema/bulkUploadSchema';
import { updateEmployeeDetails } from '../../slices/jsonSlice';
import { probationOptions, stateOptions, statusOptions } from '../../utils/employeeDetails/utils';
import DatePickerInput from '../EmployeeProfile/DatePickerInput';
import SelectInput from '../EmployeeProfile/SelectInput';

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
    salaryComponentValues?: Record<string, number | null>;
    deductionComponentValues?: Record<string, number | null>;
};
type EmployeeModalProps = {
    open: boolean;
    handleCancel: () => void;
    employeeData: InitialStateDataType | undefined;
    employeeIndex: number | undefined;
};

const EmployeeModal = ({ open, handleCancel, employeeData, employeeIndex }: EmployeeModalProps) => {
    console.log('Employee Data in Modal:', employeeData); // Debugging log to check the data being passed to the modal
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    // const [empStatus, setEmpStatus] = useState<string>('');
    const timeRange = employeeData?.timeSchedule;

    const handleCountryChange = (value: string) => {
        setSelectedCountry(value);
    };

    const parseSchedule = (schedule: any) => {
        if (!schedule) return [null, null]; // Handle the case where no schedule is provided

        const times = schedule.split(' - ');
        if (times.length === 2) {
            const [startTime, endTime] = times;
            const startMoment = moment(startTime, 'h:mm A');
            const endMoment = moment(endTime, 'h:mm A');

            if (startMoment.isValid() && endMoment.isValid()) {
                return [startMoment, endMoment];
            }
        } else {
            console.error('Schedule does not follow expected format:', schedule);
        }
        return [null, null]; // Return nulls for any parsing failures
    };

    const [initialStart, initialEnd] = parseSchedule(timeRange);
    const initialStartDayjs = initialStart ? dayjs(initialStart.format()) : undefined;
    const initialEndDayjs = initialEnd ? dayjs(initialEnd.format()) : undefined;
    const { bulkValidate, isLoading } = useBulkValidateApi();
   

    // const [searchText, setSearchText] = useState<string>('');

    const { countriesList } = useGeneralApi();
    const { data } = useReportingStaffApi('');

    const transformedData = data.map(item => ({
        ...item,
        value: item.label,
    }));

    const dispatch = useAppDispatch();
    const handleUpdateEmployee = (values: any) => {
        dispatch(updateEmployeeDetails({ index: employeeIndex!, data: values }));
        // handleCancel();
    };
    const jobTypeOptions = [
        { key: 1, id: 1, value: 'PART_TIME', label: 'Part Time' },
        { key: 2, id: 2, value: 'FULL_TIME', label: 'Full Time' },
    ];

    const allEmployees = useAppSelector(state => state.reducer.BulkUpload);

    return (
        <CustomModalWithForm
            modalTitle="Edit Employee Details"
            open={open}
            handleCancel={handleCancel}
            isLoading={isLoading}
            handleFormSubmit={async values => {
                const submissionValues = { ...values };
                dispatch(updateEmployeeDetails({ index: employeeIndex!, data: submissionValues }));

                if (!submissionValues.reportingStaff) {
                    delete submissionValues.reportingStaff;
                }
                if (!submissionValues.emergencyContactName) {
                    delete submissionValues.emergencyContactName;
                }
                if (!submissionValues.emergencyContactRelation) {
                    delete submissionValues.emergencyContactRelation;
                }
                if (!submissionValues.emergencyContactNumber) {
                    delete submissionValues.emergencyContactNumber;
                }

                handleUpdateEmployee(submissionValues);
                const allEmployeesData = [...allEmployees];

                if (employeeIndex !== undefined) {
                    allEmployeesData.splice(employeeIndex, 1, submissionValues);
                }
                const payload = {
                    jsonData: allEmployeesData,
                };

                await bulkValidate(payload); // Assuming bulkValidate takes an array of objects
                handleCancel();
            }}
            initialValues={{
                fullName: employeeData?.fullName || '',
                dateOfBirth: employeeData?.dateOfBirth || '',
                gender: employeeData?.gender || '',
                mobileNo: employeeData?.mobileNo || '',
                email: employeeData?.email || '', // Initial value for email field
                emergencyContactNumber: employeeData?.emergencyContactNumber || null, // Initial value for emergency contact number
                emergencyContactName: employeeData?.emergencyContactName || null, // Initial value for emergency contact Name
                emergencyContactRelation: employeeData?.emergencyContactRelation || null,
                country: employeeData?.country || null,
                state: employeeData?.state || null,
                addressLine1: employeeData?.addressLine1 || '',
                addressLine2: employeeData?.addressLine2 || '',
                dateOfJoin: employeeData?.dateOfJoin
                    ? moment(employeeData?.dateOfJoin).format('YYYY-MM-DD')
                    : dayjs().format('YYYY-MM-DD'),
                designation: employeeData?.designation || '',
                employeeId: employeeData?.employeeId || '',
                reportingStaff: employeeData?.reportingStaff || null,
                department: employeeData?.department || '',
                workingHours: employeeData?.workingHours || 0,
                employeeStatus: employeeData?.employeeStatus || '',
                timeSchedule: employeeData?.timeSchedule || undefined,
                contractType: employeeData?.contractType || '',
                workEmailId: employeeData?.workEmailId || '',
                workingDays: employeeData?.workingDays || '',
                pinCode: employeeData?.pinCode || '',
                probationPeriod: employeeData?.probationPeriod || '',
                accountHolderName: employeeData?.accountHolderName || '',
                accountNumber: employeeData?.accountNumber || '',
                bankName: employeeData?.bankName || '',
                ifscCode: employeeData?.ifscCode || '',
                salaryComponentValues: employeeData?.salaryComponentValues || {},
                deductionComponentValues: employeeData?.deductionComponentValues || {},
            }}
            validationSchema={bulkUploadSchema}
        >
            {({ handleSubmit, values }) => (
                <Form layout="vertical">
                    <TextInput
                        label="Full name"
                        isRequired
                        name="fullName"
                        placeholder={undefined}
                        type="text"
                        allowAlphabetsAndSpaceOnly
                        maxLength={50}
                    />
                    <DatePickerInput
                        label="Date of birth"
                        isRequired
                        name="dateOfBirth"
                        placeholder="Select Date"
                        classes=" rounded-sm w-full"
                        maxDate={dayjs().subtract(18, 'year')}
                        value={
                            employeeData?.dateOfBirth ? dayjs(employeeData.dateOfBirth) : undefined
                        } // Set initial value here
                    />

                    <TextInput
                        label="Mobile number"
                        name="mobileNo"
                        allowNumbersOnly
                        maxLength={10}
                        placeholder="Enter mobile number"
                        type="text"
                        isRequired
                    />

                    <TextInput
                        label="Personal Email"
                        name="email"
                        type="text"
                        placeholder="Enter personal email ID"
                        isRequired
                        allowEmailsOnly
                        maxLength={50}
                    />

                    <SelectInput
                        isRequired
                        label="Gender"
                        name="gender"
                        placeholder="Enter gender"
                        classes=" rounded-sm "
                        options={[
                            { value: 'MALE', label: 'Male' },
                            { value: 'FEMALE', label: 'Female' },
                        ]}
                    />
                    <TextInput
                        label="Address Line 1"
                        name="addressLine1"
                        type="text"
                        placeholder="Enter Address Line 1"
                        maxLength={50}
                        allowAlphabetsNumberAndSpecialCharacters={[
                            ' ',
                            '.',
                            ',',
                            '/',
                            ')',
                            '(',
                            '@',
                            '-',
                            '_',
                        ]}
                        isRequired
                    />

                    <TextInput
                        label="Address Line 2"
                        name="addressLine2"
                        type="text"
                        placeholder="Enter Address Line 2"
                        maxLength={50}
                        allowAlphabetsNumberAndSpecialCharacters={[
                            ' ',
                            '.',
                            ',',
                            '/',
                            ')',
                            '(',
                            '@',
                            '-',
                            '_',
                        ]}
                        isRequired
                    />

                    <TextInput
                        label="Emergency Contact Number"
                        name="emergencyContactNumber"
                        type="text"
                        placeholder="Enter emergency contact number"
                        maxLength={10}
                        allowNumbersOnly
                    />
                    <TextInput
                        label="Emergency Contact Name"
                        name="emergencyContactName"
                        type="text"
                        placeholder="Enter emergency contact name"
                        allowAlphabetsAndSpaceOnly
                        maxLength={50}
                    />
                    <TextInput
                        label="Emergency Contact Relation"
                        name="emergencyContactRelation"
                        type="text"
                        placeholder="Enter emergency contact name"
                        allowAlphabetsAndSpaceOnly
                        maxLength={50}
                    />

                    <SelectInputWithSearch
                        label="Country"
                        name="country"
                        options={countriesList ?? []}
                        placeholder="Select Country"
                        classes="rounded-sm"
                        handleChange={handleCountryChange}
                        isRequired
                    />
                    {selectedCountry === 'India' && (
                        <SelectInputWithSearch
                            isRequired
                            label="State"
                            name="state"
                            options={stateOptions ?? []}
                            placeholder="State"
                            classes="rounded-sm"
                            // onSearch={setSearchText}
                        />
                    )}
                    <TextInput
                        label="Pin Code"
                        isRequired
                        name="pinCode"
                        placeholder="Pin Code"
                        type="text"
                        maxLength={6}
                        minLength={6}
                        allowNumbersOnly
                    />

                    <DatePickerInput
                        label="Join Date"
                        isRequired
                        name="dateOfJoin"
                        placeholder="Select Date"
                        classes=" rounded-sm w-full"
                        maxDate={dayjs(new Date())}
                    />
                    <TextInput
                        label="Employee ID"
                        isRequired
                        name="employeeId"
                        placeholder="Employee ID"
                        type="text"
                        maxLength={12}
                    />
                    <TextInput
                        isRequired
                        label="Department"
                        name="department"
                        type="text"
                        maxLength={40}
                        placeholder="Select department"
                        allowAlphabetsSpaceAndNumbersOnly
                    />
                    <SelectInput
                        isRequired
                        label="Job Type"
                        name="contractType"
                        placeholder="Job Type"
                        classes=" rounded-sm "
                        options={jobTypeOptions}
                    />
                    <SelectInput
                        isRequired
                        label="Status"
                        name="employeeStatus"
                        placeholder="Select status"
                        classes=" rounded-sm "
                        options={statusOptions}
                        onChange={() => {
                            // setEmpStatus('INPROBATION');
                        }}
                    />
                    {values.employeeStatus === 'INPROBATION' && (
                        <SelectInput
                            label="Probation Period"
                            name="probationPeriod"
                            placeholder="Probation Period"
                            classes="rounded-sm"
                            options={probationOptions}
                            isRequired
                        />
                    )}

                    <SelectInput
                        label="Reporting Staff"
                        name="reportingStaff"
                        placeholder="Select Reporting Staff"
                        options={transformedData}
                        allowClear
                    />

                    <Flex vertical gap={8}>
                        <Field name="timeSchedule">
                            {({ field, form: { touched, errors, setFieldValue } }: FieldProps) => (
                                <Form.Item
                                    name="timeSchedule"
                                    validateStatus={
                                        touched.timeSchedule && errors.timeSchedule ? 'error' : ''
                                    }
                                    help={
                                        touched.schedule && errors.timeSchedule
                                            ? (errors.schedule as React.ReactNode)
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
                                        defaultValue={
                                            initialStartDayjs && initialEndDayjs
                                                ? [initialStartDayjs, initialEndDayjs]
                                                : undefined
                                        }
                                        onChange={range => {
                                            if (range) {
                                                const [start, end] = range;
                                                const formattedRange = `${start?.format('h:mm A')} - ${end?.format('h:mm A')}`;
                                                setFieldValue('timeSchedule', formattedRange);
                                                // Calculate and set working hours based on start and end times
                                                const duration = moment.duration(end?.diff(start));
                                                const hours = duration.asHours();
                                                setFieldValue('workingHours', hours);
                                            } else {
                                                // Handle the case where no time is selected
                                                setFieldValue('timeSchedule', '');
                                            }
                                        }}
                                    />
                                </Form.Item>
                            )}
                        </Field>
                    </Flex>
                    <TextInput
                        label="Work Email"
                        name="workEmailId"
                        placeholder="Work Email"
                        classes=" rounded-sm "
                        type="email"
                        allowEmailsOnly
                        maxLength={50}
                    />

                    <TextInput
                        isRequired
                        label="Designation"
                        name="designation"
                        placeholder="Designation"
                        classes=" rounded-sm "
                        type="string"
                        maxLength={30}
                    />
                    <TextInput
                        isRequired
                        label="Working Days"
                        name="workingDays"
                        placeholder="Working Days"
                        classes=" rounded-sm "
                        type='text'
                        allowNumbersOnly
                        maxLength={2}
                    />
                    <TextInput
                        isRequired
                        label="Working Hours"
                        name="workingHours"
                        placeholder="Working Hours"
                        classes=" rounded-sm "
                        isDisabled
                        type="string"
                        allowNumbersOnly
                        maxLength={2}
                    />
                    <TextInput
                        label="Account Holder Name"
                        name="accountHolderName"
                        placeholder="Enter account holder name"
                        classes=" rounded-sm "
                        type="text"
                        allowAlphabetsAndSpaceOnly
                        maxLength={100}
                    />
                    <TextInput
                        label="Account Number"
                        name="accountNumber"
                        placeholder="Enter account number"
                        classes=" rounded-sm "
                        type="text"
                        allowNumbersOnly
                        maxLength={18}
                    />
                    <TextInput
                        label="Bank Name"
                        name="bankName"
                        placeholder="Enter bank name"
                        classes=" rounded-sm "
                        type="text"
                        maxLength={50}
                    />
                    <TextInput
                        label="IFSC Code"
                        name="ifscCode"
                        placeholder="Enter IFSC code"
                        classes=" rounded-sm "
                        type="text"
                        maxLength={11}
                    />
                    {Object.entries(values.salaryComponentValues || {}).map(([compName, compValue]) => (
                        <Field key={compName} name="salaryComponentValues">
                            {({ form }: FieldProps) => (
                                <Form.Item label={compName}>
                                    <input
                                        className="ant-input w-full rounded-sm border border-gray-300 px-3 py-1"
                                        type="number"
                                        placeholder={`Enter ${compName}`}
                                        value={compValue != null ? String(compValue) : ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            form.setFieldValue('salaryComponentValues', {
                                                ...form.values.salaryComponentValues,
                                                [compName]: val !== '' ? Number(val) : null,
                                            });
                                        }}
                                    />
                                </Form.Item>
                            )}
                        </Field>
                    ))}
                    {Object.entries(values.deductionComponentValues || {}).map(([compName, compValue]) => (
                        <Field key={compName} name="deductionComponentValues">
                            {({ form }: FieldProps) => (
                                <Form.Item label={compName}>
                                    <input
                                        className="ant-input w-full rounded-sm border border-gray-300 px-3 py-1"
                                        type="number"
                                        placeholder={`Enter ${compName}`}
                                        value={compValue != null ? String(compValue) : ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            form.setFieldValue('deductionComponentValues', {
                                                ...form.values.deductionComponentValues,
                                                [compName]: val !== '' ? Number(val) : null,
                                            });
                                        }}
                                    />
                                </Form.Item>
                            )}
                        </Field>
                    ))}
                </Form>
            )}
        </CustomModalWithForm>
    );
};

export default EmployeeModal;
