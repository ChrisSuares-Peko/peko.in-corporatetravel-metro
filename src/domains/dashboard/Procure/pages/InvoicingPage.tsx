import React, { useState } from 'react';

import { ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Input, Pagination, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import GenericTable from '@components/atomic/GenericTable';
import useNupayMerchants from '@src/domains/dashboard/Payouts/hooks/useNupayMerchants';
import { paths } from '@src/routes/paths';

import InvoicingHeader from '../components/Invoicing/InvoicingHeader';
import PayInvoiceModal from '../components/Invoicing/PayInvoiceModal';
import useFilter from '../hooks/useFilter';
import { useInvoice } from '../hooks/useInvoice';
import { invoicingColumns } from '../utils/InvoicingColumns';

const { Title, Text } = Typography;

const initialFilters = {
    searchText: '',
    page: 1,
    limit: 10,
};

const InvoicingPage: React.FC = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(initialFilters);
    const [payingInvoice, setPayingInvoice] = useState<any | null>(null);
    const { statusData } = useNupayMerchants();
    const isVirtualAccountReady = statusData?.onboardingStatus === 'SUCCESS';

    const { handlePageChange } = useFilter({ setFilter: setFilters });
    const { tableData, total: count, isLoading } = useInvoice(filters);

    const columns = invoicingColumns(
        (id, invoiceNumber) => navigate(`${paths.dashboard.procure}/${paths.procure.invoicing.index}/${id}`, { state: { invoiceNumber } }),
        (row) => setPayingInvoice(row),
        isVirtualAccountReady,
    );

    return (
       <Card className="rounded-3xl w-full !border-gray-100" styles={{ body: { padding: 32 }  }}>
        <Row gutter={[0, 16]}>
            <Col span={24}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} lg={14}>
                        <Title level={4} style={{ fontWeight: 600, marginBottom: 0 }}>Invoicing</Title>
                        <Text type="secondary">Track vendor invoices, link them to purchase orders, and keep payments moving.</Text>
                    </Col>
                    <Col xs={24} lg={10}>
                        <Flex gap={8} align="center" justify="flex-end" wrap="wrap">
                            <Input
                                placeholder="Search"
                                suffix={<SearchOutlined />}
                                allowClear
                                value={filters.searchText}
                                onChange={e => setFilters(prev => ({ ...prev, searchText: e.target.value.replace(/\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic})*/gu, ''), page: 1 }))}
                                maxLength={100}
                                className="w-full lg:w-[240px]"
                            />
                            <InvoicingHeader />
                        </Flex>
                    </Col>
                </Row>
            </Col>

            {!isVirtualAccountReady && (
                <Col span={24}>
                    <Row gutter={[12, 12]} align="middle" className="bg-[#F8FAFC] rounded-2xl px-6 py-4">
                        <Col xs={24} sm={18}>
                            <Flex align="center" gap={12}>
                                <ExclamationCircleFilled style={{ color: '#fa8c16', fontSize: 20 }} />
                                <div>
                                    <Text strong style={{ color: '#101828', display: 'block' }}>Payouts Not Activated</Text>
                                    <Text style={{ color: '#595959', fontSize: 13 }}>Activate payouts to enable invoice payments.</Text>
                                </div>
                            </Flex>
                        </Col>
                        <Col xs={24} sm={6} className="flex sm:justify-end">
                            <Button
                                className="w-full sm:w-auto h-9 px-5 border-[#FF4F4F] text-[#FF4F4F] font-medium text-sm rounded-lg"
                                onClick={() => navigate(paths.procure.onboarding)}
                            >
                                Activate Now
                            </Button>
                        </Col>
                    </Row>
                </Col>
            )}

            <Col span={24}>
                <GenericTable
                    columns={columns}
                    dataSource={tableData}
                    rowKey="id"
                    loading={isLoading}
                    className="w-full"
                    bordered={false}
                    pagination={false}
                />
            </Col>

            <Col span={24}>
                <Pagination
                    current={filters.page}
                    size="default"
                    className="text-end"
                    onChange={handlePageChange}
                    total={count}
                    pageSize={filters.limit}
                    showSizeChanger={false}
                />
            </Col>

            <PayInvoiceModal
                open={!!payingInvoice}
                invoice={payingInvoice}
                onConfirm={() => setPayingInvoice(null)}
                onCancel={() => setPayingInvoice(null)}
            />

        </Row>
        </Card>
    );
};

export default InvoicingPage;
