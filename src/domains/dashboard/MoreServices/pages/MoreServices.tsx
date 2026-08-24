import { Col, Row, Flex, Grid } from 'antd';
import { Content } from 'antd/es/layout/layout';

import { checkCorporateSidebar } from '@utils/checkAccess';

import Card from '../components/Card';
import {
    // ComingSoon,
    moreServices as defaultMoreServices,
    extraServicesForMobile,
} from '../utils/data';

const MoreServices = () => {
    const screens = Grid.useBreakpoint();
    // const { subCorporateId } = useAppSelector(state => state.reducer.auth);
    // const isSubUser = Boolean(subCorporateId);

    const moreServices = screens.lg
        ? defaultMoreServices
        : [...defaultMoreServices, ...extraServicesForMobile];

    const filteredItems = moreServices.filter(item => checkCorporateSidebar(item.title));

    // const filteredComingSoon = ComingSoon.filter(item => !checkCorporateSidebar(item.title));

    return (
        <Content className="px-0">
            <Flex className=" mb-[2rem] text-[1.25rem] font-medium md:px-5 px-0">
                More Services
            </Flex>

            <Row gutter={screens.xs ? [20, 20] : [20, 40]}>
                {filteredItems.map((item, i) => (
                    <Col key={i} xs={6} sm={6} md={4} lg={6} xl={4} xxl={3}>
                        <Card
                            icon={item.icon}
                            title={item.title}
                            path={item.path!}
                            status={item.status!}
                        />
                    </Col>
                ))}
            </Row>
            {/*
            <Flex className=" mb-[2rem] text-[1.25rem] font-medium md:px-5 px-0 mt-5">
                Coming Soon
            </Flex>

            <Row gutter={screens.xs ? [20, 20] : [20, 40]}>
                {filteredComingSoon.map((item, i) => (
                    <Col key={i} xs={6} sm={6} md={4} lg={6} xl={4} xxl={3}>
                        <Card
                            icon={item.icon}
                            title={item.title}
                            path={item.path!}
                            status={item.status!}
                        />
                    </Col>
                ))}
            </Row>
            */}
        </Content>
    );
};

export default MoreServices;
