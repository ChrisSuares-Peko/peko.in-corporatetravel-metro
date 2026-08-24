import React, { useEffect, useState } from 'react';

import { Steps, Flex, Typography } from 'antd';

import { useAppSelector } from '@src/hooks/store';

import { usePaymentLinkOnboarding } from '../../paymentLinks/hooks/usePaymentLinkOnboarding';
import WelcomeAddEmployee from '../components/WelcomePage/WelcomeAddEmployee';
import WelcomeCompanyDetailsForm from '../components/WelcomePage/WelcomeCompanyDetailsForm';
import WelcomeDeductionComponents from '../components/WelcomePage/WelcomeDeductionComponents';
import WelcomePayrollCycleForm from '../components/WelcomePage/WelcomePayrollCycleForm';
import WelcomeSalaryComponents from '../components/WelcomePage/WelcomeSalaryComponents';
import WelcomeSalaryRolloutSetup from '../components/WelcomePage/WelcomeSalaryRolloutSetup';

const WelcomePage = ({ setRefresh }: { setRefresh: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { onBoardStatus } = useAppSelector(state => state.reducer.payrollAuth);
    const [current, setCurrent] = useState(Number(onBoardStatus ?? 0));
    const { record: salaryRolloutRecord, fetchStatus: fetchSalaryRolloutStatus } =
        usePaymentLinkOnboarding();

    useEffect(() => {
        fetchSalaryRolloutStatus();
    }, [fetchSalaryRolloutStatus]);

    const isSalaryRolloutActive = salaryRolloutRecord?.status === 'active';

    const steps = [
        {
            title: 'Company Profile',
            content: (
                <WelcomeCompanyDetailsForm setActiveTabKey={setCurrent} setRefresh={setRefresh} />
            ),
            subtitleText:
                'By default, we have configured your HR and leave settings in compliance with Indian labor laws. You can retain these settings or customize them to align with your company policies.',
        },
        {
            title: 'Payroll Cycle',
            content: <WelcomePayrollCycleForm setActiveTabKey={setCurrent} />,
            subtitleText: "Select your payroll cycle to align with your company's schedule",
        },
        {
            title: 'Salary Components',
            content: <WelcomeSalaryComponents setActiveTabKey={setCurrent} />,
            subtitleText:
                'Configure salary components that will be included in payroll processing. You can edit the defaults or add new components specific to your company.',
        },
        {
            title: 'Deduction Components',
            content: <WelcomeDeductionComponents setActiveTabKey={setCurrent} />,
            subtitleText:
                'Add and manage deductions such as Provident Fund, ESI, Professional Tax, or company-specific deductions.',
        },
        {
            title: 'Add Employees',
            content: (
                <WelcomeAddEmployee
                    setActiveTabKey={setCurrent}
                    setRefresh={setRefresh}
                    isSalaryRolloutActive={isSalaryRolloutActive}
                />
            ),
            subtitleText:
                'By default, we have configured your HR and leave settings in compliance with Indian labor laws. You can retain these settings or customize them to align with your company policies.',
        },
        ...(isSalaryRolloutActive
            ? []
            : [
                  {
                      title: 'Salary Rollout Setup',
                      content: (
                          <WelcomeSalaryRolloutSetup
                              setActiveTabKey={setCurrent}
                              setRefresh={setRefresh}
                          />
                      ),
                      subtitleText:
                          'Set up your salary rollout account to start disbursing employee salaries securely.',
                  },
              ]),
    ];
    const safeCurrent = Math.min(Number(current), steps.length - 1);
    const CurrentComponent = steps[safeCurrent].content;

    return (
        <>
            <Flex vertical justify="center" align="center" gap={25}>
                <Typography.Text className="text-[#000000] text-[1.75rem] font-medium text-center">
                    Let’s help you to setup your HR Dashboard
                </Typography.Text>
                <Typography.Text className="text-[#595959] text-[1rem] text-center w-2/3">
                    {steps[safeCurrent].subtitleText}
                </Typography.Text>
            </Flex>
            <Flex justify="center">
                <Steps current={safeCurrent} className="my-6 w-[90%] ">
                    {steps.map(item => (
                        <Steps.Step key={item.title} title={item.title} />
                    ))}
                </Steps>
            </Flex>
            <div className="step-content">{CurrentComponent}</div>
        </>
    );
};

export default WelcomePage;
