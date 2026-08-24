import React, { useState } from 'react';

import { Button, Card, Col, Flex, Row, Typography } from 'antd';

import DocModal from './DocModal';
import DocUpload from './DocUpload';

const mandatoryDocs = [
    { label: 'Registration Certificate', type: 'RC' },
    { label: 'Permit Certificate', type: 'Permit' },
    { label: 'Insurance Certificate', type: 'Insurance' },
    { label: 'Pollution Under Control (PUC)', type: 'PUC' },
];

const extraDocLabels: Record<string, string> = {
    Fitness: 'Fitness',
    RoadTax: 'Road Tax',
    Other: 'Other vehicle docs',
};

const formatVehicleNumber = (number: string) => {
    if (!number) return '';

    const clean = number.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Pattern: STATE(2) + RTO(1–2 digits) + SERIES(1–3 letters) + NUMBER(4 digits)
    const match = clean.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{4})$/);
    if (!match) return number; // fallback for invalid input

    const [, state, rto, series, num] = match;
    return `${state} ${rto} ${series} ${num}`;
};

const Documents = ({ item, createDoc, deteteDoc, updateDoc }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    // Separate mandatory and extra documents
    const existingDocs = item.data || [];

    const extraDocs = existingDocs.filter(
        (doc: any) => !mandatoryDocs.some(mandatory => mandatory.type === doc.type)
    );

    return (
        <Card className="rounded-xl">
            <Flex justify="space-between">
                <Flex vertical>
                    <Typography.Text className="text-xl font-medium">{item.model}</Typography.Text>
                    <Typography.Text className="mt-1 text-base md:text-[17px] font-medium text-[#565656]">
                        {formatVehicleNumber(item.vehicleNumber)}
                    </Typography.Text>
                </Flex>

                <Button
                    type="default"
                    danger
                    size="middle"
                    className="text-xs md:px-5 md:text-sm"
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    Add Document
                </Button>
            </Flex>

            <Row gutter={[20, 10]} className="mt-5">
                {/* Render mandatory 4 documents */}
                {mandatoryDocs.map((doc, index) => (
                    <Col xs={24} xl={12} key={`mandatory-${index}`}>
                        <DocUpload
                            label={doc.label}
                            type={doc.type}
                            existingData={existingDocs.find((d: any) => d.type === doc.type)}
                            vehicleId={item.vehicleId}
                            createDoc={createDoc}
                            deteteDoc={deteteDoc}
                            updateDoc={updateDoc}
                        />
                    </Col>
                ))}

                {/* Render additional uploaded documents */}
                {extraDocs.map((doc: any, index: any) => (
                    <Col xs={24} xl={12} key={`extra-${index}`}>
                        <DocUpload
                            label={extraDocLabels[doc.type] ?? doc.type}
                            type={doc.type}
                            existingData={doc}
                            vehicleId={item.vehicleId}
                            createDoc={createDoc}
                            deteteDoc={deteteDoc}
                            updateDoc={updateDoc}
                        />
                    </Col>
                ))}
            </Row>
            {isOpen && (
                <DocModal
                    vehicleId={item.vehicleId}
                    handleCancel={() => setIsOpen(false)}
                    open={isOpen}
                    createDoc={createDoc}
                    existingDocs={existingDocs}
                />
            )}
        </Card>
    );
};

export default Documents;
