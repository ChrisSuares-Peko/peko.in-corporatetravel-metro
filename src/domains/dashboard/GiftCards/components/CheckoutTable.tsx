import { Flex, Image, Table, TableColumnsType, Typography } from 'antd';

import '../assets/styles/styles.css';

import { useAppSelector } from '@src/hooks/store';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import CheckoutTableTextRow from './CheckoutTableTextRow';
import defaultImage from '../assets/images/default.png';
import { CheckoutTableData } from '../utils/data';

function CheckoutTable() {
    interface DataType {
        key: React.Key;
        name: string;
        age: number;
        address: string;
    }

    const product = useAppSelector(state => state.reducer.giftcardCheckout.productDetails);
    const formDetails = useAppSelector(state => state.reducer.giftcardCheckout.formDetails);

    const columns: TableColumnsType<DataType> = [
        {
            title: 'Gift Card',
            dataIndex: 'name',
            key: 'name',

            // Add inline style to the title cell

            render: (text: any, record: any) => (
                <Flex justify="flex-start" align="center" className="md:flex-row flex-col gap-2">
                    <Flex className="w-28 h-16 block">
                        <Image
                            fallback={defaultImage}
                            preview={false}
                            src={product.product_image}
                            style={{ width: '70%', height: '70%' }}
                        />
                    </Flex>
                    <Flex vertical>
                        <CheckoutTableTextRow text={product.product_name} />
                    </Flex>
                </Flex>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'age',
            key: 'age',
            render: (text: any, record: any) => (
                <Flex justify="flex-start">
                    <Typography.Text className="text-neutral-600 md:text-sm text-xs font-normal">
                        ₹ {formatNumberWithLocalString(formDetails.amount)}
                    </Typography.Text>
                </Flex>
            ),
            responsive: ['md'],
        },
        {
            title: 'Quantity',
            dataIndex: 'address',
            key: 'address',
            render: (text: any, record: any) => (
                <Flex className="ml-4">{formDetails.quantity}</Flex>
            ),
        },
        {
            title: 'Total',
            dataIndex: 'address',
            key: 'address',
            render: (text: any, record: any) => (
                <Flex>
                    <Typography.Text className="text-neutral-600 md:text-sm text-xs font-normal">
                        ₹ {formatNumberWithLocalString(formDetails.product)}
                    </Typography.Text>
                </Flex>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={CheckoutTableData}
            pagination={false}
            className="custom-table-row"
        />
    );
}

export default CheckoutTable;
