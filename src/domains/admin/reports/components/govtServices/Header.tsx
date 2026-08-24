import { SearchOutlined, SwapRightOutlined } from '@ant-design/icons';
import { DatePicker, Flex, Input, Row, Select } from 'antd';
import dayjs from 'dayjs';

import useScreenSize from '@src/hooks/useScreenSize';

import { AccountInfo } from '../../types/corporates';

const dateFormat = 'YYYY-MM-DD';

const STATUS_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'In Review', value: 'IN_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Action Required', value: 'ACTION_REQUIRED' },
];

type Props = {
    searchText: string;
    handleSearch: (e: any) => void;
    from: string;
    to: string;
    handleDateChange: (dates: any, dateStrings: any) => void;
    handleFromChange: (dates: any, dateStrings: any) => void;
    handleToChange: (dates: any, dateStrings: any) => void;
    dropDownData: AccountInfo[] | undefined;
    setSearchText: (val: string) => void;
    handleChangeFilters: (val: string) => void;
    handleCategoryFilters: (val: string) => void;
};

const Header = ({
    searchText,
    handleSearch,
    from,
    to,
    handleDateChange,
    handleFromChange,
    handleToChange,
    dropDownData,
    setSearchText,
    handleChangeFilters,
    handleCategoryFilters,
}: Props) => {
    const { xs } = useScreenSize();

    return (
        <Row justify="end" className="w-full gap-3">
            <Flex className="flex-col justify-end w-full gap-3 px-0 md:flex-row md:w-auto">
                {dropDownData && (
                    <Select
                        allowClear
                        showSearch
                        options={(dropDownData || []).map(d => ({
                            value: d.credentialId,
                            label: `${d.name} - ${d.username}`,
                        }))}
                        placeholder="Select a Corporate"
                        className="w-full min-w-52"
                        onChange={handleChangeFilters}
                        defaultActiveFirstOption={false}
                        filterOption={false}
                        onSearch={setSearchText}
                    />
                )}
                <Select
                    allowClear
                    placeholder="Filter by status"
                    options={STATUS_OPTIONS}
                    className="w-full min-w-40"
                    onChange={handleCategoryFilters}
                />
                {xs ? (
                    <Flex className="w-full sm:w-fit" justify="space-between" align="center">
                        <DatePicker
                            onChange={handleFromChange}
                            format={dateFormat}
                            defaultValue={dayjs(from, dateFormat)}
                        />
                        <SwapRightOutlined />
                        <DatePicker
                            onChange={handleToChange}
                            format={dateFormat}
                            defaultValue={dayjs(to, dateFormat)}
                        />
                    </Flex>
                ) : (
                    <DatePicker.RangePicker
                        onChange={handleDateChange}
                        format={dateFormat}
                        defaultValue={[dayjs(from, dateFormat), dayjs(to, dateFormat)]}
                        className="w-full"
                    />
                )}
                <Input
                    value={searchText}
                    placeholder="Search applications"
                    suffix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                    type="text"
                    variant="outlined"
                    maxLength={100}
                />
            </Flex>
        </Row>
    );
};

export default Header;
