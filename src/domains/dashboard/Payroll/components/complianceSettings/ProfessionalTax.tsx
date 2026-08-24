import React, { useState } from 'react';

import { EditOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';

import AddProfessionalTax from './AddProfessionalTax';
// import useUpdateComplianceSettingsApi from '../../hooks/complianceSettings/useUpdateComplianceSettingsApi';

const ProfessionalTax = ({ onEdit, complianceData, settingsId }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    console.log('proff tax', complianceData);
    const professionalTaxData = complianceData?.professionalTax;
    const hasPTNumber = professionalTaxData?.ptNumber;
    // const { handleSettingsUpdate } = useUpdateComplianceSettingsApi();
    return (
        <Flex vertical gap={20} className="pt-6">
            {!isEditing && hasPTNumber && (
                <>
                    <Flex vertical>
                        <Typography.Text className="font-medium">Professional Tax</Typography.Text>
                        <Typography.Text className="text-[#595959] mt-1">
                            This tax is levied on an employee’s income by the State Government. Tax
                            slabs differ in each state.
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
                                Professional Tax
                            </Typography.Text>
                            <Button className="border-0" onClick={() => setIsEditing(true)}>
                                <EditOutlined className="text-[#E30000]" />
                            </Button>
                        </Flex>
                        <Flex justify="space-between" className="mb-3 mt-3">
                            <Typography.Text>PT Number</Typography.Text>
                            <Typography.Text>
                                {complianceData?.professionalTax?.ptNumber}
                            </Typography.Text>
                        </Flex>
                        <Flex justify="space-between" className="mb-3">
                            <Typography.Text>Deduction Cycle</Typography.Text>
                            <Typography.Text>
                                {complianceData?.professionalTax?.deductionCycle}
                            </Typography.Text>
                        </Flex>
                        {professionalTaxData?.incomeSlabs?.map((slab: any, index: number) => (
                            <Flex
                                key={index}
                                vertical
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    marginBottom: '8px',
                                }}
                            >
                                <Flex justify="space-between" className="mb-3">
                                    <Typography.Text>Income Start Range</Typography.Text>
                                    <Typography.Text>{slab.incomeStartRange}</Typography.Text>
                                </Flex>
                                <Flex justify="space-between" className="mb-3">
                                    <Typography.Text>Income End Range</Typography.Text>
                                    <Typography.Text>{slab.incomeEndRange}</Typography.Text>
                                </Flex>
                                <Flex justify="space-between" className="mb-3">
                                    <Typography.Text>Tax Amount</Typography.Text>
                                    <Typography.Text>{slab.taxAmount}</Typography.Text>
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                </>
            )}

            {(isEditing || !hasPTNumber) && (
                <>
                    <Flex vertical>
                        <Typography.Text className="font-medium text-xl">Professional Tax</Typography.Text>
                        <Typography.Text 
                        
                        className="text-[#595959] mt-1">
                            This tax is levied on an employee’s income by the State Government. Tax
                            slabs differ in each state.
                        </Typography.Text>
                    </Flex>
                    <AddProfessionalTax
                        complianceData={complianceData?.professionalTax}
                        settingsId={settingsId}
                    />
                </>
            )}
        </Flex>
    );
};

export default ProfessionalTax;
