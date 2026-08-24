import React from 'react';

import { Row, Col, Button, Tag, Skeleton } from 'antd';

import { BoldText } from '@src/domains/dashboard/logistics/components/CustomText';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import { amountToWords, parseSalaryAmount } from '../../utils/employeeDetails/utils';

type DetailsHeaderProps = {
    onAddComponent: () => void;
    amount?: number | string;
    tableLoading: boolean;
};

const DetailsHeader = ({ onAddComponent, amount, tableLoading }: DetailsHeaderProps) => {
    const safeAmount: number = parseSalaryAmount(amount);
    return tableLoading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
    ) : (
        <Row gutter={[12, 15]}>
            <Col span={21}>
                <Tag
                    style={{
                        width: '100%',
                        textAlign: 'start',
                        height: '40px',
                        alignItems: 'center',
                        lineHeight: '40px',
                        fontSize: '13px',
                        backgroundColor: '#F6FFED',
                        border: 'none',
                        borderRadius: '4px',
                    }}
                >
                    <BoldText
                        text={`Total Deduction: ₹ ${formatNumberWithLocalString(
                            safeAmount
                        )} (${amountToWords(safeAmount)} only)`}
                    />
                </Tag>
            </Col>
            <Col>
                <Button
                    style={{ color: 'textRed' }}
                    className="add-component-btn"
                    onClick={onAddComponent}
                    danger
                >
                    Add Component
                </Button>
            </Col>
        </Row>
    );
};

export default DetailsHeader;
