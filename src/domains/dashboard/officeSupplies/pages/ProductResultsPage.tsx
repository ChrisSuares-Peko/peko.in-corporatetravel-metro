import { useEffect, useState, type FC } from 'react';

import { Col, Flex, Pagination, Row, Spin, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import useScreenSize from '@src/hooks/useScreenSize';

import noProductsSVG from '../assets/icons/noProducts.svg';
import FiltersSidebar from '../components/home/FiltersSidebar';
import ProductCard from '../components/home/ProductCard';
import SearchLocationBar from '../components/home/SearchLocationBar';
import ProductsSkelton from '../components/home/skeltons/ProductsSkelton';
import OfficeSuppliesTop from '../components/OfficeSuppliesTop';
import { useOfficeSuppliesCity } from '../hooks/useOfficeSuppliesCity';
import { useOfficeSupplyCategories } from '../hooks/useOfficeSupplyCategories';
import { useProductsApi } from '../hooks/useProductsApi';
import { ProductFilters } from '../types/products';
import { ALL_PRODUCTS_CATEGORY } from '../utils/officeSupplyCategories';

/**
 * Category/search results — reached by picking a category/subcategory or
 * submitting a search on the home page (OfficeSupplies.tsx), which navigate
 * here instead of showing the grid inline. Deliberately has no CategoryBar
 * (Figma). Category/subcategory/search identity travels as URL query params
 * so a direct link or refresh reproduces the same results.
 */
const ProductResultsPage: FC = () => {
    const screen = useScreenSize();
    const [searchParams, setSearchParams] = useSearchParams();

    const categoryKey = searchParams.get('category');
    const subcategoryKey = searchParams.get('subcategory');
    const searchText = searchParams.get('search') || '';

    const { categories } = useOfficeSupplyCategories();

    const selectedCategory =
        categories.find(c => c.key === categoryKey) || ALL_PRODUCTS_CATEGORY;
    const selectedSubcategory =
        selectedCategory.subGroups?.[0]?.items.find(i => i.key === subcategoryKey) || null;

    // A picked subcategory narrows the filter to its exact classified value;
    // otherwise match any of the selected category's subcategories.
    const localCategory = selectedSubcategory
        ? selectedSubcategory.localCategory
        : selectedCategory.localCategory?.join(',') || undefined;

    const { selectedCity, setSelectedCity, isLoadingCity } = useOfficeSuppliesCity();

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [filters, setFilters] = useState<ProductFilters>({});

    // Reset page + filters whenever the category/subcategory/search/city changes.
    // City matters: a stale page blocks the empty-city ONDC search (it only fires
    // on page 1) and old-city seller filters would empty out the new city.
    useEffect(() => {
        setCurrentPage(1);
        setFilters({});
    }, [localCategory, searchText, selectedCity?.code]);

    const { data, isLoading, isFetchingCity, count } = useProductsApi(
        selectedCity?.code,
        currentPage,
        pageSize,
        searchText,
        localCategory,
        filters
    );

    // Editing the search box here updates the query string in place — any
    // active category/subcategory is preserved, matching how a search and a
    // category filter already combine independently today.
    const setSearchText = (text: string) => {
        const next = new URLSearchParams(searchParams);
        if (text) next.set('search', text);
        else next.delete('search');
        setSearchParams(next);
    };

    let gridHeading = 'All Products';
    if (searchText) {
        gridHeading = `Results for "${searchText}"`;
    } else if (selectedSubcategory) {
        gridHeading = selectedSubcategory.label;
    } else if (localCategory) {
        gridHeading = selectedCategory.label;
    }

    const handleScroll = () => {
        const productsContainer = document.getElementById('myContainer');
        if (productsContainer) {
            productsContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const isBrowsingAll = !localCategory && !searchText;
    const showGrid = !!selectedCity && !isFetchingCity;
    const showSidebar = showGrid && !isBrowsingAll;
    const showSkeleton = isLoading || isFetchingCity;
    const showEmpty = showGrid && !showSkeleton && data.length === 0;

    const gridBlock = (
        <div className="flex w-full flex-col gap-4">
            <Typography.Text className="mt-2 block text-lg font-semibold text-[#19191d] lg:text-xl">
                {gridHeading}
            </Typography.Text>

            <Row
                justify="start"
                id="products_container"
                className="!mt-0 overflow-visible"
                gutter={screen.xs ? [0, 16] : [0, 24]}
            >
                <ProductsSkelton loading={showSkeleton} itemCount={12} perRow={4} />

                {showEmpty && (
                    <Flex
                        vertical
                        gap={30}
                        className="mt-18 h-96 w-full"
                        justify="center"
                        align="center"
                    >
                        <ReactSVG width={120} src={noProductsSVG} />
                        <Typography.Text className="ms-2 text-center text-base text-gray-300">
                            No products
                        </Typography.Text>
                    </Flex>
                )}

                {!showSkeleton &&
                    data?.map(product => (
                        <ProductCard key={product.id} {...product} perRow={4} />
                    ))}
            </Row>

            {data.length !== 0 && !showSkeleton && (
                <Pagination
                    className="mt-10 text-center sm:text-end"
                    total={count}
                    current={currentPage}
                    defaultPageSize={pageSize}
                    onChange={(page, pageSize2) => {
                        handleScroll();
                        setCurrentPage(page);
                        setPageSize(pageSize2);
                    }}
                />
            )}
        </div>
    );

    return (
        <>
            <OfficeSuppliesTop />
            <Flex className="mx-0 mt-6" vertical gap={4}>
                <SearchLocationBar
                    selectedCity={selectedCity}
                    onSelectCity={setSelectedCity}
                    isLoadingCity={isLoadingCity}
                    searchText={searchText}
                    setSearchText={setSearchText}
                />

                {/* No city chosen */}
                {!selectedCity && (
                    <Flex vertical gap={20} className="h-96 w-full" justify="center" align="center">
                        <ReactSVG width={120} src={noProductsSVG} />
                        <Typography.Text className="text-center text-base text-gray-400">
                            Select a city to view products
                        </Typography.Text>
                    </Flex>
                )}

                {/* Fetching products for the city (searching ONDC) */}
                {isFetchingCity && (
                    <Flex vertical gap={16} className="mt-6 w-full" justify="center" align="center">
                        <Spin size="large" />
                        <Typography.Text className="text-center text-base text-gray-500">
                            Fetching products for {selectedCity?.name}…
                        </Typography.Text>
                    </Flex>
                )}

                {/* Grid — with a Filters sidebar unless landing here with no category/search at all */}
                {showGrid &&
                    (showSidebar ? (
                        <Row gutter={[24, 24]} className="mt-4">
                            <Col xs={24} lg={8} xl={6}>
                                <FiltersSidebar
                                    city={selectedCity?.code}
                                    value={filters}
                                    onChange={setFilters}
                                />
                            </Col>
                            <Col xs={24} lg={16} xl={18}>
                                {gridBlock}
                            </Col>
                        </Row>
                    ) : (
                        <div className="mt-2">{gridBlock}</div>
                    ))}
            </Flex>
        </>
    );
};

export default ProductResultsPage;
