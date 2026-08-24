import { useState } from 'react';

import { MenuOutlined } from '@ant-design/icons';
import { Button, Flex, Image, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';

import Logo from '@assets/mainLogo/Logo.png';
import CustomBreadCrumb from '@components/molecular/breadcrumbs/CustomBreadcrumb';
import Footer from '@components/molecular/footer';
import Sidebar from '@components/molecular/nav-section/vertical/Sidebar';
import SideBarModal from '@components/molecular/nav-section/vertical/SideBarModal';
import PrivacyPolicyModal from '@src/domains/auth/components/modals/PrivacyPolicyModal';
import usePrivacyAcceptApi from '@src/domains/auth/hooks/usePrivacyAcceptApi';
import { setPrivacyModalVisible } from '@src/domains/auth/slices/loginSlice';
import EmployeeHeader from '@src/domains/employee/components/EmployeeHeader';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import useScreenSize from '@src/hooks/useScreenSize';
import { paths } from '@src/routes/paths';

const { Header, Content, Sider } = Layout;

// Matches AE's EmployeePortalLayout.tsx exactly: Sider gated by both the `lg`
// JS breakpoint (useScreenSize, same hook AE uses byte-for-byte) and antd's own
// Sider `breakpoint` prop, Headers gated by the matching Tailwind `lg:` classes.
// The desktop header's logo carries `myHamburgerClass` (hidden by default, see
// index.css) which a raw CSS media query force-shows between 990-1402px — the
// same range where antd's JS breakpoint hook is unreliable and would otherwise
// leave both the Sider and the mobile header absent at once.
type EmployeePortalLayoutProps = {
    children: React.ReactNode;
};

const EmployeePortalLayout = ({ children }: EmployeePortalLayoutProps) => {
    const { lg } = useScreenSize();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { showPrivacyPolicyModal } = useAppSelector(state => state.reducer.auth);
    const { acceptPrivacyPolicyForUser, isLoading: modalButtonLoading } = usePrivacyAcceptApi();

    return (
        <>
            <Layout className="employee-portal-root overflow-hidden bg-white min-h-svh max-h-svh">
                {lg && (
                    <Sider
                        breakpoint="lg"
                        collapsedWidth="0"
                        width={270}
                        style={{ background: '#ffffff' }}
                        className="hidden overflow-y-scroll hide-scroll lg:block myNavClass"
                    >
                        <Sidebar />
                    </Sider>
                )}
                <Layout>
                    <Header className="hidden px-0 py-2 bg-white border-b border-solid lg:block lg:py-0 lg:pr-10 lg:ps-9 h-fit myHeaderClass">
                        <Flex justify="space-between" align="center" className="h-fit min-h-[48px]">
                            <Image
                                src={Logo}
                                alt="logo"
                                className="bg-transparent cursor-pointer myHamburgerClass"
                                preview={false}
                                width={100}
                                onClick={() => navigate(paths.employee.home)}
                            />
                            <EmployeeHeader />
                        </Flex>
                    </Header>
                    {/* Mobile header */}
                    <Header className="px-4 py-2 bg-white border-b border-solid lg:hidden">
                        <Flex justify="space-between" align="center">
                            <Flex align="center" gap={5}>
                                <Button
                                    type="text"
                                    style={{ background: '#ffffff' }}
                                    icon={<MenuOutlined style={{ fontSize: 20 }} />}
                                    onClick={() => setDrawerOpen(true)}
                                />
                                <Image
                                    src={Logo}
                                    alt="logo"
                                    className="bg-transparent cursor-pointer"
                                    preview={false}
                                    width={100}
                                    onClick={() => navigate(paths.employee.home)}
                                />
                            </Flex>
                        </Flex>
                    </Header>
                    <Content
                        className="px-5 py-4 overflow-y-scroll bg-white sm:pt-8 sm:px-10"
                        id="myContainer"
                    >
                        <CustomBreadCrumb />
                        <div className="sm:my-4 dynamic-min-height">{children}</div>
                        <Footer />
                    </Content>
                </Layout>
            </Layout>
            <SideBarModal drawerOpen={drawerOpen} handleCancel={() => setDrawerOpen(false)} />
            {showPrivacyPolicyModal && (
                <PrivacyPolicyModal
                    isOpen={showPrivacyPolicyModal}
                    isLoading={modalButtonLoading}
                    onClose={() => dispatch(setPrivacyModalVisible(false))}
                    onAccept={async policyIds => {
                        const response = await acceptPrivacyPolicyForUser(policyIds);
                        if (response && response.status) {
                            dispatch(setPrivacyModalVisible(false));
                        }
                    }}
                />
            )}
        </>
    );
};

export default EmployeePortalLayout;
