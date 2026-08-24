import { useState } from 'react';

import { Flex, Pagination, Tabs, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import useDebounceSearch from '@src/hooks/useDebounceSearch';
import { paths } from '@src/routes/paths';

import OndcCategoriesTree from './OndcCategoriesTree';
import OndcProductsTable from './OndcProductsTable';
import ProductCatalogHeader from './ProductCatalogHeader';
import useOndcProducts from '../../../hooks/products/useOndcProducts';
import useFilter from '../../../hooks/useFilter';
import { AdminOndcProduct } from '../../../types/ondcProduct';

const SUBTITLE =
    'Products are published by sellers on the ONDC network and refresh automatically. Use the switches to control what corporates can see.';

const ProductsCatalog = () => {
    const initialValues = {
        searchText: '',
        page: 1,
        itemsPerPage: 10,
        sort: 'DESC',
        sortField: 'updatedAt',
        category: undefined as string | undefined,
        sellerName: undefined as string | undefined,
        visibility: undefined as string | undefined,
        availability: undefined as string | undefined,
        city: undefined as string | undefined,
    };
    const [filters, setFilters] = useState(initialValues);
    const [activeTab, setActiveTab] = useState<'catalog' | 'categories'>('catalog');
    const navigate = useNavigate();

    const { handlePageChange, handleTableChange } = useFilter({ setFilters });
    const { searchText, updateSearchText } = useDebounceSearch(setFilters);
    const { isLoading, tableData, count, filterOptions, toggleVisibility, downloadReport } =
        useOndcProducts(filters);

    const set = (patch: Partial<typeof initialValues>) =>
        setFilters(prev => ({ ...prev, ...patch, page: 1 }));

    const openDetails = (record: AdminOndcProduct) =>
        navigate(`${paths.systemUser.manage}/${paths.manage.products}/details/${record.id}`);

    return (
        <Flex vertical gap={16}>
            <ProductCatalogHeader
                handleDownloadReport={downloadReport}
                searchText={searchText}
                handleSearch={updateSearchText}
                filterOptions={filterOptions}
                category={filters.category}
                onCategoryChange={v => set({ category: v })}
                seller={filters.sellerName}
                onSellerChange={v => set({ sellerName: v })}
                visibility={filters.visibility}
                onVisibilityChange={v => set({ visibility: v })}
                availability={filters.availability}
                onAvailabilityChange={v => set({ availability: v })}
                city={filters.city}
                onCityChange={v => set({ city: v })}
            />

            <Tabs
                activeKey={activeTab}
                onChange={key => setActiveTab(key as 'catalog' | 'categories')}
                items={[
                    { key: 'catalog', label: 'Catalog' },
                    { key: 'categories', label: 'Categories' },
                ]}
            />

            {activeTab === 'catalog' ? (
                <>
                    <Typography.Text className="text-[13px] text-[#868686]">{SUBTITLE}</Typography.Text>
                    <OndcProductsTable
                        tableData={tableData}
                        isLoading={isLoading}
                        onTableChange={handleTableChange}
                        onToggleVisibility={toggleVisibility}
                        onView={openDetails}
                    />
                    <Pagination
                        current={filters.page}
                        size="default"
                        className="text-end pt-4 justify-end"
                        onChange={handlePageChange}
                        total={count}
                        showSizeChanger={false}
                    />
                </>
            ) : (
                <OndcCategoriesTree />
            )}
        </Flex>
    );
};

export default ProductsCatalog;
