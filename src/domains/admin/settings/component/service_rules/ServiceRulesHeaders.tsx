import React, { useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Row } from 'antd';

import { DownloadType } from '@customtypes/general';

import ServiceRulesModal from './ServiceRulesModal';

type Props = {
    handleSearch: (e: any) => void;
    searchText: string;
    downloadReport: (type: string) => void;
    accessPermission: any;
    rowCount: string;
};
const ServiceRulesHeaders = ({
    searchText,
    handleSearch,
    setRefresh,
    downloadReport,
    rowCount,
    accessPermission,
}: Props & any) => {
    const [openModal, setOpenModal] = useState(false);
    return (
        <Row justify="space-between" className="w-full gap-5">
            <Flex className="flex justify-start gap-3">
                <Button danger onClick={() => downloadReport(DownloadType.Excel)}>
                    Excel
                </Button>
                <Button danger onClick={() => downloadReport(DownloadType.Csv)}>
                    CSV
                </Button>
                <Button danger onClick={() => downloadReport(DownloadType.Pdf)}>
                    PDF
                </Button>
            </Flex>
            <Flex className="flex-col justify-end w-full gap-3 px-0 md:flex-row md:w-auto">
                {accessPermission && accessPermission.write && (
                    <Button
                        type="primary"
                        className="w-full sm:w-fit"
                        danger
                        onClick={() => setOpenModal(true)}
                    >
                        Add Service Rule
                    </Button>
                )}
                <Input
                    value={searchText}
                    placeholder="Search "
                    suffix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                    type="text"
                    variant="outlined"
                    maxLength={100}
                />
            </Flex>
            {openModal && (
                <ServiceRulesModal
                    open={openModal}
                    handleCancel={() => setOpenModal(false)}
                    setRefresh={setRefresh}
                />
            )}
        </Row>
    );
};
export default ServiceRulesHeaders;
