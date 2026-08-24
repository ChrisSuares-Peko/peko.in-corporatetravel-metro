import React, { useEffect } from 'react';

import { Col, Collapse, Flex, Row, Skeleton, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import { paths } from '@src/routes/paths';

import useFaqApi from '../hooks/useGetFaq';

const useQuery = () => new URLSearchParams(useLocation().search);

const FAQ = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const faqCategory = query.get('faqCategory');
    if (!faqCategory) {
        navigate(paths.dashboard.needHelp);
    }

    const { data, isLoading, getAllFaqs } = useFaqApi();

    useEffect(() => {
        if (faqCategory) {
            getAllFaqs(faqCategory);
        }
    }, [faqCategory, getAllFaqs]);

    if (isLoading) {
        return <Skeleton active avatar />;
    }

    return (
        <Row gutter={24}>
            <Col span={24}>
                <Typography.Paragraph className="text-2xl font-medium text-valueText">
                    Frequently Asked Questions for {faqCategory}
                </Typography.Paragraph>
            </Col>
            <Col xs={24} lg={12} className="px-4 mt-6">
                {data &&
                    data.map((item, index) => (
                        <Flex vertical className="mb-2" key={index}>
                            <Collapse
                                className="bg-transparent sm:mt-3 md:mr-5 custom-collapse-panel"
                                size="small"
                                bordered={false}
                                expandIconPosition="end"
                            >
                                <Collapse.Panel
                                    header={
                                        <Typography.Text className="text-base font-medium text-faqText">
                                            {item.question}
                                        </Typography.Text>
                                    }
                                    key={index} // Use index for keys
                                    className="text-faqText faq-collapse-panel"
                                >
                                    <Typography.Text
                                        className="text-faqText"
                                        style={{ whiteSpace: 'pre-line' }}
                                    >
                                        {item.answer}
                                    </Typography.Text>
                                </Collapse.Panel>
                            </Collapse>
                        </Flex>
                    ))}
            </Col>
        </Row>
    );
};

export default FAQ;
