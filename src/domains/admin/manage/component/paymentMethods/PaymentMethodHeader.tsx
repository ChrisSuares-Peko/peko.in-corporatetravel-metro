import React, { useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Row } from 'antd';

import PaymentMethodsModal from './PaymentMethodsModal';

type Props = {
    handleSearch: (e: any) => void;
    searchText: string;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

const PaymentMethodHeader = ({ searchText, handleSearch, setRefresh }: Props) => {
    const [openModal, setOpenModal] = useState(false);

    return (
        <Row justify="end" className="w-full gap-5">
            <Flex className="flex-col justify-end w-full gap-3 px-0 md:flex-row md:w-auto">
                {/* {accessPermission && accessPermission.write && ( */}
                <Button type="primary" className="w-full" danger onClick={() => setOpenModal(true)}>
                    Add New Payment Method
                </Button>
                {/* )} */}

                <Input
                    value={searchText}
                    placeholder="Search "
                    suffix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                    type="text"
                    variant="outlined"
                    className="w-full md:w-auto min-w-52"
                    size="small"
                    maxLength={100}
                />
            </Flex>
            {openModal && (
                <PaymentMethodsModal
                    open={openModal}
                    handleCancel={() => setOpenModal(false)}
                    setRefresh={setRefresh}
                />
            )}
        </Row>
    );
};
export default PaymentMethodHeader;
