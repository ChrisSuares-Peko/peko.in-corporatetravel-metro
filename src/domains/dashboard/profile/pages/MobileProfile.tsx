import { Suspense, type FC, useState, lazy } from 'react';

import { RightOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { paths } from '@src/routes/paths';
import { handleLogout } from '@src/services/handleLogout';

import Footer from '../components/Footer';
import ProfileInfo from '../components/ProfileInfo';
import useGetPasswordPolicies from '../hooks/useGetPasswordPolicies';
import usePasswordPolicyValidation from '../hooks/usePasswordPolicyValidation';

const AddressMobileModalModal = lazy(
    () => import('../components/MobileProfile/AddressMobileModal')
);
const BankAccountMobileModal = lazy(
    () => import('../components/MobileProfile/BankAccountMobileModal')
);
const ReferralMobileModal = lazy(() => import('../components/MobileProfile/ReferralMobileModal'));
const ChangerPasswordModal = lazy(() => import('../components/ChangePasswordModal'));
const SecurityMobileModal = lazy(() => import('../components/MobileProfile/SecurityMobileModal'));
const BasicInfoModal = lazy(() => import('../components/BasicInfoModal'));
const CompanyInfoModal = lazy(() => import('../components/CompanyInfoModal'));

interface MobileProfileProps {}

const MobileProfile: FC<MobileProfileProps> = () => {
    const [openBasicInfoModal, setOpenBasicInfoModal] = useState(false);
    const [openCompanyInfoModal, setOpenCompanyInfoModal] = useState(false);
    const [openSecurityMobileModal, setOpenSecurityMobileModal] = useState(false);
    const [openReferralMobileModal, setOpenReferralMobileModal] = useState(false);
    const [openBankAccountMobileModal, setOpenBankAccountMobileModal] = useState(false);
    const [openAddressMobileModalModal, setOpenAddressMobileModalModal] = useState(false);
    const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
    const authChannel = new BroadcastChannel('authChannel');
    const navigate = useNavigate();

    const { respData } = useGetPasswordPolicies();
    const { validatePassword } = usePasswordPolicyValidation(respData);
    return (
        <>
            <Flex vertical gap={20} className="w-full">
                <Typography.Text className=" font-semibold text-sm text-black">
                    My Profile
                </Typography.Text>
                <ProfileInfo />

                <Card
                    size="small"
                    className="rounded-[3px] border-neutralGray500 cursor-pointer"
                    onClick={() => setOpenBasicInfoModal(true)}
                >
                    <Flex justify="space-between">
                        <Typography.Text>Basic Information</Typography.Text>
                        <RightOutlined className="text-[lightGray!important]" />
                    </Flex>
                </Card>
                <Card
                    size="small"
                    className="rounded-[3px] border-neutralGray500 cursor-pointer"
                    onClick={() => setOpenCompanyInfoModal(true)}
                >
                    <Flex justify="space-between">
                        <Typography.Text>Company Information</Typography.Text>
                        <RightOutlined className="text-[lightGray!important]" />
                    </Flex>
                </Card>
                <Card
                    size="small"
                    className="rounded-[3px] border-neutralGray500 cursor-pointer"
                    onClick={() => setOpenReferralMobileModal(true)}
                >
                    <Flex justify="space-between">
                        <Typography.Text>Referral</Typography.Text>
                        <RightOutlined className="text-[lightGray!important]" />
                    </Flex>
                </Card>
                <Card
                    size="small"
                    className="rounded-[3px] border-neutralGray500 cursor-pointer"
                    onClick={() => setOpenBankAccountMobileModal(true)}
                >
                    <Flex justify="space-between">
                        <Typography.Text>Bank Accounts</Typography.Text>
                        <RightOutlined className="text-[lightGray!important]" />
                    </Flex>
                </Card>
                <Card
                    size="small"
                    className="rounded-[3px] border-neutralGray500 cursor-pointer"
                    onClick={() => setOpenAddressMobileModalModal(true)}
                >
                    <Flex justify="space-between">
                        <Typography.Text>Address</Typography.Text>
                        <RightOutlined className="text-[lightGray!important]" />
                    </Flex>
                </Card>
                <Card
                    size="small"
                    className="rounded-[3px] border-neutralGray500 cursor-pointer"
                    onClick={() => navigate(paths.dashboard.settings)}
                >
                    <Flex justify="space-between">
                        <Typography.Text>Settings</Typography.Text>
                        <RightOutlined className="text-[lightGray!important]" />
                    </Flex>
                </Card>
                <Card
                    size="small"
                    className="rounded-[3px] border-neutralGray500 cursor-pointer"
                    onClick={() => setOpenChangePasswordModal(true)}
                >
                    <Flex justify="space-between">
                        <Typography.Text>Change Password</Typography.Text>
                        <RightOutlined className="text-[lightGray!important]" />
                    </Flex>
                </Card>
                <Card
                    size="small"
                    className="rounded-[3px] border-brandColor cursor-pointer"
                    onClick={() => {
                        authChannel.postMessage('logout');
                        handleLogout();
                    }}
                >
                    <Flex justify="space-between" className="text-brandColor">
                        <Typography.Text className="text-brandColor">Log out</Typography.Text>
                        <RightOutlined />
                    </Flex>
                </Card>
                <Footer />
            </Flex>

            <Suspense>
                <BasicInfoModal
                    open={openBasicInfoModal}
                    handleCancel={() => setOpenBasicInfoModal(false)}
                />
                <CompanyInfoModal
                    open={openCompanyInfoModal}
                    handleCancel={() => setOpenCompanyInfoModal(false)}
                />
                <SecurityMobileModal
                    open={openSecurityMobileModal}
                    handleCancel={() => setOpenSecurityMobileModal(false)}
                />
                <ReferralMobileModal
                    open={openReferralMobileModal}
                    handleCancel={() => setOpenReferralMobileModal(false)}
                />
                <BankAccountMobileModal
                    open={openBankAccountMobileModal}
                    handleCancel={() => setOpenBankAccountMobileModal(false)}
                />
                <AddressMobileModalModal
                    open={openAddressMobileModalModal}
                    handleCancel={() => setOpenAddressMobileModalModal(false)}
                />
                {openChangePasswordModal && (
                    <ChangerPasswordModal
                        validatePassword={validatePassword}
                        open={openChangePasswordModal}
                        handleCancel={() => setOpenChangePasswordModal(false)}
                    />
                )}
            </Suspense>
        </>
    );
};

export default MobileProfile;
