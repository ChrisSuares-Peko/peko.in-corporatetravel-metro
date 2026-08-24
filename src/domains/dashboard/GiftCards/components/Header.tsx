import React from 'react';

import { Col, Row, Button, Flex, Typography } from 'antd';
import '../styles/Style.css';
import { Link } from 'react-router-dom';

import useScreenSize from '@src/hooks/useScreenSize';

type Props = {
    searchText: string;
    setSearchText: (value: any) => void;
    category: string;
    setCategory: (value: any) => void;
};

const Header = ({ searchText, setSearchText, category, setCategory }: Props) => {
    const screens = useScreenSize();

    return (
        <Row gutter={12} justify="space-between" align="middle">
            <Col xs={10} md={5} lg={5} xl={4}>
                <Typography.Text className="font-medium text-lg sm:text-xl">
                    Gift Cards
                </Typography.Text>
            </Col>

            <Col xs={14} md={6} lg={7} xl={4}>
                <Flex gap={5} className=" justify-end">
                    <Link to="order-history">
                        <Button
                            type="default"
                            danger
                            size={screens.sm ? 'middle' : 'small'}
                            className="md:px-5 text-xs md:text-sm"
                        >
                            Order History
                        </Button>
                    </Link>
                </Flex>
            </Col>
        </Row>
    );
};

export default Header;
