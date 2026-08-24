import { useState } from 'react';

import { Flex, Typography, Card, Row, Col, Button } from 'antd';
import Image from 'antd/es/image';
import { GoArrowUpRight } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';

import logo from '@assets/mainLogo/Logo.png';
import signupFreelancer from '@assets/Signup/business-man.png';
import signupRocket from '@assets/Signup/companySetup.svg';
import signupCompliance from '@assets/Signup/complianceHealth.svg';
import complianceIllustration from '@assets/Signup/complianceHealthIllustration.png';
import signupRegister from '@assets/Signup/pekoAccount.svg';
import registerSteps from '@assets/svg/registerSteps.png';
import { useAppDispatch } from '@src/hooks/store';

import { nextStep, setSignupType } from '../../slices/registerSlice';

const { Text } = Typography;

const GetStartedSignup = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [showComingSoon, setShowComingSoon] = useState(false);

    if (showComingSoon) {
        return (
            <Flex
                vertical
                className="min-h-svh bg-white px-10"
            >
                <Image src={logo} alt="Peko" preview={false} width={130} className="mt-4 ml-5" />
                <Flex
                    vertical
                    align="center"
                    justify="center"
                    gap={20}
                    className="flex-1 pb-24"
                >
                    <Image
                        src={complianceIllustration}
                        preview={false}
                        width={140}
                        height={140}
                        style={{ objectFit: 'contain' }}
                    />
                    <Flex vertical align="center" gap={10} style={{ maxWidth: 560 }}>
                        <Text className="text-center font-medium" style={{ fontSize: 22, color: 'rgba(0,0,0,0.85)', lineHeight: '1.3' }}>
                            Company Compliance Health — Coming Soon
                        </Text>
                        <Text className="text-center" style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', lineHeight: '22px' }}>
                            We&apos;re currently working on this feature. It&apos;s designed to simplify your compliance tracking. You&apos;ll get clear insights and actionable updates. Built to keep your business 100% safe and secure. Stay tuned for the launch.
                        </Text>
                    </Flex>
                    <Button
                        onClick={() => setShowComingSoon(false)}
                        style={{
                            borderColor: '#FF3A3A',
                            color: '#FF3A3A',
                            borderRadius: 8,
                            height: 40,
                            width: 140,
                            fontSize: 15,
                            fontWeight: 500,
                        }}
                    >
                        Go back
                    </Button>
                </Flex>
            </Flex>
        );
    }

    return (
        <Row className="relative">
            <Row className="w-full">
                <Col
                    xs={{ span: 24, order: 2 }}
                    sm={{ span: 24, order: 2 }}
                    md={{ span: 24, order: 2 }}
                    lg={{ span: 12, order: 1 }}
                    xl={{ span: 12, order: 1 }}
                    className="flex items-center justify-center"
                >
                    <Flex
                        className="min-h-svh px-4 sm:px-8 md:px-10 pt-4"
                        align="center"
                        justify="flex-start"
                        style={{ backgroundColor: '#ffffff' }}
                    >
                        <Flex
                            vertical
                            align="flex-start"


                        >
                            <Image src={logo} alt="Peko" preview={false} width={130} />

                            <Flex vertical align="flex-start" >

                                <Text className='text-lg ml-1'>Get Started with Peko</Text>
                            </Flex>

                            <Flex vertical gap={20} className='mt-5' style={{ width: '100%' }}>
                                <SignupOptionCard
                                    icon={signupRocket}
                                    title="I want to start a new company"
                                    description="Start your business setup journey with end-to-end incorporation support."
                                    onClick={() => {
                                        dispatch(setSignupType('NEW_COMPANY'));
                                        dispatch(nextStep());
                                    }}
                                />
                                <SignupOptionCard
                                    icon={signupRegister}
                                    title="Already have a company? Register on Peko"
                                    description="Sign up your existing business to manage payments, compliance, payroll and more."
                                    onClick={() => {
                                        dispatch(setSignupType('EXISTING_COMPANY'));
                                        dispatch(nextStep());
                                    }}
                                />
                                <SignupOptionCard
                                    icon={signupFreelancer}
                                    title="Are you an influencer/freelancer? Get on Peko"
                                    description="Manage your invoicing, payments, and taxes as an independent professional."
                                    onClick={() => {
                                        dispatch(setSignupType('FREELANCER'));
                                        dispatch(nextStep());
                                    }}
                                />
                                <SignupOptionCard
                                    icon={signupCompliance}
                                    title="Check my company compliance health"
                                    description="Review your company's compliance status for tax, GST, and regulatory requirements."
                                    onClick={() => setShowComingSoon(true)}
                                />
                            </Flex>

                            <Text className="flex items-center justify-center w-full mt-7 text-sm font-medium text-textBlack">
                                Already have an account?
                                <Text
                                    className="inline-flex items-center text-sm font-semibold text-red-500 underline cursor-pointer ms-1"
                                    onClick={() => navigate('/auth/login')}
                                >
                                    <span>Sign in</span> <GoArrowUpRight />
                                </Text>
                            </Text>
                        </Flex>
                    </Flex>
                </Col>
                <Col
                    xs={{ span: 0, order: 1 }}
                    sm={{ span: 0, order: 1 }}
                    md={{ span: 0, order: 1 }}
                    lg={{ span: 12, order: 2 }}
                    xl={{ span: 12, order: 2 }}
                >
                    <Flex
                        className="h-[50vh] md:h-svh flex"
                        style={{
                            backgroundImage: `url(${registerSteps})`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                        }}
                    >
                        <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-transparent to-black/70 " />
                        <Text className=" text-sm md:text-3xl xxl:text-4xl text-white px-4 pb-5 font-light self-end p-0 md:p-10 max-w-[19rem] sm:max-w-4xl z-10 xxl:leading-[56px] md:leading-[40px]">
                            All-in-one platform for SMBs to manage all their payments, expenses,
                            travel, insurance, and automate operations
                        </Text>
                    </Flex>
                </Col>
            </Row>
        </Row>

    )
};

interface SignupOptionCardProps {
    icon: string;
    title: string;
    description: string;
    onClick?: () => void;
}

const SignupOptionCard = ({ icon, title, description, onClick }: SignupOptionCardProps) => (
    <Card
        hoverable
        bodyStyle={{ padding: '10px 10px' }}
        style={{
            borderRadius: 24,
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        }}
        onClick={onClick}
    >
        <Flex align="center" gap={20}>
            <Flex
                align="center"
                justify="center"
                style={{
                    width: 90,
                    height: 90,
                    borderRadius: 24,
                    backgroundColor: '#F5F2EC',
                }}
            >
                <Image
                    src={icon}
                    preview={false}
                    width={44}
                />
            </Flex>

            <Flex vertical gap={4}>
                <Text className="text-lg font-medium">{title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {description}
                </Text>
            </Flex>
        </Flex>
    </Card>
);

export default GetStartedSignup;

