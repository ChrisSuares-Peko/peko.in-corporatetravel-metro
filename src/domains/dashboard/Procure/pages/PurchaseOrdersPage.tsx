import React, { useEffect, useState } from 'react';

import { Card, Col, Pagination, Row, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import GenericTable from '@components/atomic/GenericTable';
import { paths } from '@src/routes/paths';

import PurchaseOrdersHeader from '../components/PurchaseOrder/PurchaseOrdersHeader';
import useFilter from '../hooks/useFilter';
import { usePurchaseOrder } from '../hooks/usePurchaseOrder';
import { purchaseOrdersColumns } from '../utils/PurchaseOrderColumns';

const { Title, Text } = Typography;

const initialFilters = {
    search: '',
    status: undefined as string | undefined,
    page: 1,
    limit: 10,
};

const PurchaseOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [filters, setFilters] = useState(initialFilters);

    const { isLoading, tableData, count, fetchPurchaseOrders } = usePurchaseOrder(undefined, filters);
    const { handleSearch, handlePageChange } = useFilter({ setFilter: setFilters });

    useEffect(() => {
        if (location.state?.created) {
            fetchPurchaseOrders();
            navigate('.', { replace: true, state: null });
        }
    }, [location.state?.created, fetchPurchaseOrders, navigate]);

    const columns = purchaseOrdersColumns(id =>
        navigate(`${paths.dashboard.procure}/${paths.procure.purchaseOrders.index}/${id}`)
    );

    return (
       <Card className="rounded-3xl w-full !border-gray-100" styles={{ body: { padding: 32 }  }}>
        <Row gutter={[0, 16]}>
            <Col span={24}>
                <Row justify="space-between" align="middle">
                    <Col className="mb-2 mr-10">
                         <Title level={4} style={{ fontWeight: 600, marginBottom: 0 }}>Purchase Orders</Title>
                        <Text type="secondary">Manage your issued POs — from draft to delivered, and paid.</Text>
                    </Col>
                    <Col flex="auto">
                        <PurchaseOrdersHeader
                            search={filters.search}
                            onSearch={handleSearch}
                        />
                    </Col>
                </Row>
            </Col>

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
        </Row>
        </Card>
    );
};

export default PurchaseOrdersPage;
