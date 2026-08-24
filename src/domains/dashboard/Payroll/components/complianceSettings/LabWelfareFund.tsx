import React, { useState } from 'react';

import { EditOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';

import AddLabWelfare from './AddLabWelfare';

const LabWelfareFund = ({ data }: any) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <Flex vertical gap={20} className="pt-6">
            {/* If we are in editing mode, always show AddLabWelfare */}
            {isEditing ? (
                <AddLabWelfare data={data} />
            ) : (
                <>
                    {/* Case when data exists and we are not in editing mode */}
                    {!isEditing && data && Object.keys(data).length !== 0 ? (
                        <>
                            <Flex vertical>
                                <Typography.Text className="font-medium">
                                    Labor Welfare Fund
                                </Typography.Text>
                                <Typography.Text className="text-[#595959] mt-1">
                                    Labor Welfare Fund act ensures social security and improves working
                                    conditions for employees.
                                </Typography.Text>
                            </Flex>

                            <Flex
                                vertical
                                style={{
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '8px',
                                }}
                                className="w-1/3 p-3"
                            >
                                <Flex justify="space-between" align="center">
                                    <Typography.Text className="font-semibold">
                                        Labor Welfare Fund
                                    </Typography.Text>
                                    <Button className="border-0" onClick={() => setIsEditing(true)}>
                                        <EditOutlined className="text-[#E30000]" />
                                    </Button>
                                </Flex>

                                <Flex justify="space-between" className="mb-3">
                                    <Typography.Text>Deduction Cycle</Typography.Text>
                                    <Typography.Text>{data.deductionCycle}</Typography.Text>
                                </Flex>
                                <Flex justify="space-between" className="mb-3">
                                    <Typography.Text>Employee’s Contribution</Typography.Text>
                                    <Typography.Text>₹{data.employeeContribution}</Typography.Text>
                                </Flex>
                                <Flex justify="space-between" className="mb-3">
                                    <Typography.Text>Employer’s Contribution</Typography.Text>
                                    <Typography.Text>₹{data.employerContribution}</Typography.Text>
                                </Flex>
                            </Flex>
                        </>
                    ) : (
                        /* Case when no data exists, show AddLabWelfare component */
                        <AddLabWelfare data={data} />
                    )}
                </>
            )}
        </Flex>
    );
};

export default LabWelfareFund;
