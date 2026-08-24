import { useState, useMemo, useEffect } from 'react';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Form, Radio, Row, Skeleton, Typography } from 'antd';
import { Formik } from 'formik';
import Lottie from 'react-lottie';

import loadingLottie from '@assets/animation/add-Employee-Loader.json';
import TextInput from '@components/atomic/inputs/TextInput';
import { useAppSelector } from '@src/hooks/store';
import { formatNumberWithLocalStringWithoutDecimalPoint } from '@utils/priceFormat';

import { createEmployeeSalaryComponent } from '../../api/organizationSettings/index';
import { useGetAllEmployeeSalaryComp } from '../../hooks/employeeHooks/useGetSalaryComponentApi';
import useEmployeeInfoApi from '../../hooks/employeeOnboardingHooks/useUpdateEmployeeApi';
import { useSalaryCompActions } from '../../hooks/OrganizationSettings/useSalaryComponentApi';
import { editSalaryEmployeeSchema } from '../../schema/employeeProfile';
import { numberToIndianWords } from '../../utils/employeeDetails/utils';
import SalaryCompModal from '../organizationSettings/SalaryComponents/SalaryCompModal';


type Props = {
    nextTab: (key: string) => void;
};
interface SalaryFields {
    name: any;
    label: any;
    placeholder: any;
    type: string;
    allowTwoDecimalsOnly: boolean;
    maxLength: number;
    isRequired: any;
    amountPercentage: any;
    calculatedAmount: any;
    calculationType: any;
    status: any;
    calculationBasedOn: any;
    category: any;
    componentName: any;
    id: any;
    isGlobal: any;
    isDsiabled: boolean;
}
const SalaryInfo = ({ nextTab }: Props) => {
    const { createEmployee } = useEmployeeInfoApi();
    // const { data, tableLoading,totalDeduction } = useGetAllEmployeeSalaryComp();
    const { data, tableLoading } = useGetAllEmployeeSalaryComp();
    const [loading,setLoading]=useState(false)
    const {deleteSalaryCompAction} = useSalaryCompActions()
    const { employeeInformation, personalInformation } = useAppSelector(
        state => state.reducer.employeeSettings
    );
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: loadingLottie,
    };
    const profileImage = useAppSelector(state => state.reducer.employee.imageDetails);
    const [openSalaryCompModal, setOpenSalaryCompModal] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<any | null>(null);
    const [salaryFields,setSalaryFields]=useState<SalaryFields[]>([])
    const [taxRegime, setTaxRegime] = useState<string>('')

    useEffect(()=>{
 const mappedFields = data.map((component: any) => ({
        name: component.componentName.replace(/\s+/g, ''),
        label: component.componentName,
        placeholder: component.calculatedAmount||'',
        type: 'text',
        allowTwoDecimalsOnly: true,
        maxLength: 7,
        isRequired: component.isGlobal,
        amountPercentage: component.amountPercentage || '',
        calculatedAmount: component.calculatedAmount || '',
        calculationType: component.calculationType || '',
        status: component.status || '',
        calculationBasedOn: component.calculationBasedOn || '',
        category: component.category || '',
        componentName: component.componentName || '',
        id: component.id || '',
        isGlobal: component.isGlobal,
        isDsiabled:true

    }));
    setSalaryFields(mappedFields)
    },[data])

    const calculateOnChange = (componentId:string,value:string | number,tempSalaryFields = salaryFields,calculated:string[] = []) => {
        tempSalaryFields.find((item)=>item.id === componentId)
        const filtered = tempSalaryFields.filter((item)=>item.calculationBasedOn === componentId)
        filtered.forEach((item)=>{
            if(calculated.includes(item.id)){
                return
            }
            const valueNum = Number(value)
            calculated.push(item.id)
            tempSalaryFields = calculateOnChange(item.id,valueNum * (item.amountPercentage / 100),tempSalaryFields,calculated)
        })
         tempSalaryFields = tempSalaryFields.map((item)=>{
            if(item.calculationBasedOn === componentId){
                const valueNum = Number(value)
                return {
                    ...item,
                    calculatedAmount: valueNum * (item.amountPercentage / 100)
                }
            }if(item.id === componentId){
                return {
                    ...item,
                    calculatedAmount: value
                }
            }
            return item
        })
        return tempSalaryFields

    }
    const initialValues = (data || []).reduce((acc: any, component: any) => {
        acc[component.componentName.replace(/\s+/g, '')] = component.calculatedAmount || '';
        return acc;
    }, {});
   
    const validationSchema = useMemo(() => editSalaryEmployeeSchema(salaryFields), [salaryFields]);
    const grossSalary = useMemo(() => salaryFields
            .filter(field => field.status === "ACTIVE")
            .reduce((total, field) => total + Number(field.calculatedAmount || 0), 0), [salaryFields]);
    const netSalary = grossSalary *12;
    const handleSalaryInfoSubmit = async (_values: any) => {
        setLoading(true);

        const customComponents = salaryFields.filter(field => {
            const defaultAmount = data.find((d: any) => d.id === field.id)?.calculatedAmount;
            return Number(field.calculatedAmount) !== Number(defaultAmount);
        });

        if (customComponents.length > 0) {
            await Promise.all(
                customComponents.map(field =>
                    createEmployeeSalaryComponent({
                        globalComponentId: field.id,
                        componentName: field.componentName,
                        calculationType: 'FIXED',
                        amountPercentage: Number(field.calculatedAmount),
                        status: 'ACTIVE',
                        employeeEmail: personalInformation.email,
                        isGlobal: false,
                        userId,
                        userType,
                    } as any)
                )
            );
        }

        const payload = {
            profileImage: profileImage?.profileImage,
            personalInformation,
            employeeInformation: {
                ...employeeInformation,
                taxRegime,
            },
        };
        await createEmployee(payload);
        setLoading(false);
    };

    const handleDeleteIconClick = async(field: any) => {
        setLoading(true)
      await deleteSalaryCompAction(field.id)
      setLoading(false)

    };

    
    const isEmployeeSpecific = true;
    return tableLoading ? (
        <Skeleton />
    ) : (
        <Flex vertical className="my-8">
            <Formik
                initialValues={initialValues}
                onSubmit={values => handleSalaryInfoSubmit(values)}
                validationSchema={validationSchema}
            >
                {({ handleSubmit, values }) => (
                    <Form layout="vertical" onFinish={handleSubmit} className="w-full">
                        <Flex justify="center">
                            <Col span={16}>
                                <Row>
                                    {salaryFields.map(field => (
                                        <Col xs={24} sm={12} key={field.name}>
                                            <Flex align="center">
                                                {/* Input */}
                                                <div style={{ flex: 1 }}>
                                                    <TextInput
                                                        isRequired={field.isRequired}
                                                        label={field.label}
                                                        name={field.name}
                                                        placeholder={field.placeholder}
                                                        type={field.type}
                                                        values={field.calculatedAmount}
                                                        allowTwoDecimalsOnly={
                                                            field.allowTwoDecimalsOnly
                                                        }
                                                        handleChange={(e)=>{
                                                          const val =  calculateOnChange(field.id,e)
                                                          setSalaryFields(val)
                                                        }}
                                                        maxLength={field.maxLength}
                                                    />
                                                </div>

                                                {/* Icon space (does NOT push layout down) */}
                                                <div
                                                    style={{
                                                        width: 32,
                                                        marginLeft: 12,
                                                        alignSelf: 'center',
                                                        lineHeight: 0,
                                                    }}
                                                >
                                                    
                                                     {!field.isGlobal &&<DeleteOutlined
                                                        style={{
                                                            fontSize: '16px',
                                                            cursor: 'pointer',
                                                            color: '#f35656ff',
                                                        }}
                                                        onClick={() => handleDeleteIconClick(field)}
                                                    />}
                                                </div>
                                            </Flex>
                                        </Col>
                                    ))}

                                    <Col xs={24} sm={10} className="mx-auto" />
                                    <Col md={24} className="mx-auto">
                                        <Button
                                            onClick={() => {
                                                setSelectedComponent(null);
                                                setOpenSalaryCompModal(true);
                                            }}
                                            type="primary"
                                            danger
                                            className=" font-semibold "
                                        >
                                            Add New Component
                                        </Button>
                                    </Col>

                                        <Col md={24} className="mx-auto">
                                            <Flex
                                                justify="center"
                                                align="center"
                                                // vertical 
                                                className="py-3 mx-auto mt-5 bg-bgGrayF8 min-h-8"
                                                style={{ paddingInline: '1rem' }}
                                            >
                                                <Typography.Text
                                                    className="font-bold"
                                                    style={{ fontSize: '1rem' }}
                                                >
                                                    Gross Monthly Salary: ₹ {' '}
                                                    {formatNumberWithLocalStringWithoutDecimalPoint(grossSalary)} (
                                                    {numberToIndianWords(grossSalary)
                                                        .toLowerCase()
                                                        .split(' ')
                                                        .map(
                                                            word =>
                                                                word.charAt(0).toUpperCase() +
                                                                word.slice(1)
                                                        )
                                                        .join(' ')}{' '}
                                                    Only)
                                                </Typography.Text>
                                            </Flex>
                                            <Flex
                                                justify="center"
                                                align="center"
                                                // vertical 
                                                className="py-3 mx-auto mt-5 bg-bgGrayF8 min-h-8"
                                                style={{ paddingInline: '1rem' }}
                                            >
                                                <Typography.Text
                                                    className="font-bold"
                                                    style={{ fontSize: '1rem' }}
                                                >
                                                    Salary Per Annum: ₹ {' '}
                                                    {formatNumberWithLocalStringWithoutDecimalPoint(netSalary)} (
                                                    {numberToIndianWords(netSalary)
                                                        .toLowerCase()
                                                        .split(' ')
                                                        .map(
                                                            word =>
                                                                word.charAt(0).toUpperCase() +
                                                                word.slice(1)
                                                        )
                                                        .join(' ')}{' '}
                                                    Only)
                                                </Typography.Text>


                                            </Flex>
                                        </Col>

                                    <Col md={24} className="mx-auto mt-6">
                                        <Typography.Text className="font-medium">
                                            Select tax regime{' '}
                                            <Typography.Text className="text-textGrey font-normal">
                                                (optional)
                                            </Typography.Text>
                                        </Typography.Text>
                                        <div className="mt-2">
                                            <Radio.Group
                                                value={taxRegime}
                                                onChange={e => setTaxRegime(e.target.value)}
                                                className="flex gap-6"
                                            >
                                                <Radio value="New Tax Regime">New Tax Regime</Radio>
                                                <Radio value="Old Tax Regime">Old Tax Regime</Radio>
                                            </Radio.Group>
                                        </div>
                                    </Col>

                                    <Col md={24} className="mx-auto">
                                        <Flex justify="space-between" className=" mt-11">
                                            <Button
                                                onClick={() => nextTab('2')}
                                                type="default"
                                                danger
                                                className=" font-semibold w-[8rem] "
                                            >
                                                Back
                                            </Button>

                                            <Button
                                                htmlType="submit"
                                                type="primary"
                                                danger
                                                className=" font-semibold w-[8rem] "
                                            >
                                                Create
                                            </Button>
                                        </Flex>
                                    </Col>
                                </Row>
                            </Col>
                        </Flex>

                        {openSalaryCompModal && (
                            <SalaryCompModal
                                isEmployeeSpecific={isEmployeeSpecific}
                                open={openSalaryCompModal}
                                handleCancel={() => setOpenSalaryCompModal(false)}
                                selectedRecordData={selectedComponent}
                                reloadTable={undefined}
                            />
                        )}
                    </Form>
                )}
            </Formik>
            {loading && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        zIndex: 1000,
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <Lottie options={defaultOptions} height={120} width={120} />
                    </div>
                </div>
            )}
        </Flex>
    );
};

export default SalaryInfo;
