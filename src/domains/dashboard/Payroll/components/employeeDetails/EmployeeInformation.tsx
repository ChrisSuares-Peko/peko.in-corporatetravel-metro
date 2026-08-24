/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';

import { Badge, Button, Col, Flex, Row, Skeleton, Typography } from 'antd';
import dayjs from 'dayjs';

import EmployeeInformationsDrawer from './forms/EmployeeInformationsDrawer';
import PanAndAdharSection from './PanAndAdharSection';
import { EmployeeProfile } from '../../types/employeeprofile/type';
import { formatText } from '../../utils/employeeDetails/utils';
import { retrieveEmployeeData } from '../../utils/RetrieveEmployeeData';

type Props = {
    employeeData: EmployeeProfile;
    setRefState: (num: number) => void;
    isLoading: boolean;
};
type InfoItem = {
    title: string | number;
    subTitle: string;
};

const EmployeeInformation = ({ employeeData, setRefState, isLoading }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const officialEmail = employeeData?.personalInformation?.email;

    const dataLeft = [
        {
            title: retrieveEmployeeData(employeeData?.employeeInformation?.designation),
            subTitle: 'Designation',
        },
        {
            title: retrieveEmployeeData(employeeData?.employeeInformation?.employeeId),
            subTitle: 'Employee ID',
        },

        {
            title: retrieveEmployeeData(employeeData?.employeeInformation?.workingDays),
            subTitle: 'Working Days',
        },


        {
            title: retrieveEmployeeData(employeeData?.employeeInformation?.workEmailId),
            subTitle: 'Work Email',
        },

        {
            title: retrieveEmployeeData(
                formatText(employeeData?.employeeInformation?.contractType)
            ),
            subTitle: 'Contract Type',
        },
        {
            title: retrieveEmployeeData(
                formatText(employeeData?.employeeInformation?.taxRegime)
            ),
            subTitle: 'Tax Regime',
        },
        {
            title: retrieveEmployeeData(employeeData?.employeeInformation?.reportingStaffName),
            subTitle: 'Reporting Staff',
        },
    ];

    const dataRight: InfoItem[] = [
        {
            title: retrieveEmployeeData(
                employeeData?.employeeInformation?.department?.departmentName || 'N/A'
            ),
            subTitle: 'Department',
        },
        {
            title: retrieveEmployeeData(
                dayjs(new Date(employeeData?.employeeInformation?.dateOfJoin)).format('DD-MM-YYYY')
            ),
            subTitle: 'Joining Date',
        },
        {
            title: retrieveEmployeeData(employeeData?.employeeInformation?.timeSchedule),
            subTitle: 'Time Schedule',
        },

        {
            title:
                employeeData?.employeeInformation?.employeeStatus === 'INPROBATION'
                    ? 'In Probation'
                    : 'Active',
            subTitle: 'Employee Status',
        },

        employeeData?.employeeInformation?.employeeStatus === 'INPROBATION' && {
            title: `${retrieveEmployeeData(employeeData?.employeeInformation?.probationPeriod)} ${
                retrieveEmployeeData(employeeData?.employeeInformation?.probationPeriod) === 1
                    ? 'Month'
                    : 'Months'
            }`,
            subTitle: 'Probation Period',
        },
    ].filter(Boolean) as InfoItem[];

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <Flex vertical className="ml-[2rem] mr-[2rem]">
            <Flex className="mt-6" justify="space-between">
                <Typography.Text className="font-medium text-lg text-textBlack">
                    Employee Information
                </Typography.Text>
                <Flex justify="end">
                    <Button
                        danger
                        className="text-iconRed cursor-pointer"
                        onClick={() => toggleModal()}
                    >
                        Edit
                    </Button>
                </Flex>
            </Flex>
            <Row className="mt-6 md:w-full ">
                <Col span={12}>
                    <Flex vertical gap={20} className="mt-6">
                        {dataLeft.map((item, index) => (
                            <Flex vertical>
                                {isLoading ? (
                                    <Skeleton active avatar />
                                ) : (
                                    <Flex className="w-full" vertical align="start">
                                        <Skeleton active avatar loading={isLoading}>
                                            <Typography.Text className="text-textBlack font-medium">
                                                {item.title}
                                            </Typography.Text>
                                            <Typography.Text className="text-textGrey">
                                                {item.subTitle}
                                            </Typography.Text>
                                        </Skeleton>
                                    </Flex>
                                )}
                            </Flex>
                        ))}
                    </Flex>
                </Col>
                <Col span={12}>
                    <Flex vertical gap={20} className="mt-6">
                        {dataRight.map((item, index) => (
                            <Flex vertical key={index}>
                                <Flex className="w-full" vertical align="start">
                                    <Skeleton active avatar loading={isLoading}>
                                        {item.subTitle === 'Employee Status' ? (
                                            <>
                                                <Badge
                                                    status={
                                                        item.title === 'Active'
                                                            ? 'success'
                                                            : item.title === 'Resigned'
                                                              ? 'processing'
                                                              : 'default'
                                                    }
                                                    text={item.title}
                                                    style={{ color: '#027A48' }}
                                                />
                                                <Typography.Text className="text-textGrey">
                                                    {item.subTitle}
                                                </Typography.Text>
                                            </>
                                        ) : (
                                            <>
                                                <Typography.Text className="text-textBlack font-medium">
                                                    {item.title}
                                                </Typography.Text>
                                                <Typography.Text className="text-textGrey">
                                                    {item.subTitle}
                                                </Typography.Text>
                                            </>
                                        )}
                                    </Skeleton>
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                </Col>
            </Row>
            <PanAndAdharSection
                employeeId={employeeData?.id}
                panNumber={employeeData?.panNumber}
                aadhaarNumber={employeeData?.aadhaarNumber}
                setRefState={setRefState}
            />
            <EmployeeInformationsDrawer
                handleCancel={toggleModal}
                isLoading={isLoading}
                officialEmail={officialEmail}
                open={isModalOpen}
                setRefState={setRefState}
                initialValues={{
                    id: employeeData?.id,
                    joinDate: employeeData?.employeeInformation?.dateOfJoin,
                    department: employeeData?.employeeInformation?.department?._id,
                    workingHours: employeeData?.employeeInformation?.workingHours,
                    workingDays: employeeData?.employeeInformation?.workingDays,
                    contractType: employeeData?.employeeInformation?.contractType,
                    taxRegime: employeeData?.employeeInformation?.taxRegime,
                    reportingStaff: employeeData?.employeeInformation?.reportingStaff,
                    employeeId: employeeData?.employeeInformation?.employeeId,
                    employeeStatus: employeeData?.employeeInformation?.employeeStatus,
                    designation: employeeData?.employeeInformation?.designation,
                    timeSchedule: employeeData?.employeeInformation?.timeSchedule,
                    probationPeriod: employeeData?.employeeInformation?.probationPeriod ?? "",
                    workEmailId: employeeData?.employeeInformation?.workEmailId || "",
                }}
            />
        </Flex>
    );
};

export default EmployeeInformation;
