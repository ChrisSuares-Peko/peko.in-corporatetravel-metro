import { useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Row } from 'antd';

import GovtServicesModal from './GovtServicesModal';
import { refreshState, RolePermissionAccessData } from '../../types/govtServicesTypes';

type Props = {
    handleSearch: (e: any) => void;
    searchText: string;
    accessPermission: RolePermissionAccessData | undefined;
};

const GovtServicesHeader = ({
    searchText,
    handleSearch,
    setRefresh,
    accessPermission,
}: Props & refreshState) => {
    const [openModal, setOpenModal] = useState(false);

    return (
        <Row justify="space-between" className="w-full gap-5">
            <Flex className="flex-col justify-end w-full gap-3 px-0 md:flex-row md:w-auto ml-auto">
                {accessPermission?.write && (
                    <Button
                        type="primary"
                        danger
                        className="w-full sm:w-fit"
                        onClick={() => setOpenModal(true)}
                    >
                        Add New Service
                    </Button>
                )}
                <Input
                    value={searchText}
                    placeholder="Search services"
                    suffix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                    type="text"
                    variant="outlined"
                    maxLength={100}
                />
            </Flex>
            {openModal && (
                <GovtServicesModal
                    open={openModal}
                    handleCancel={() => setOpenModal(false)}
                    setRefresh={setRefresh}
                />
            )}
        </Row>
    );
};

export default GovtServicesHeader;
