import React, { useEffect, useState } from 'react';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Modal, Typography } from 'antd';

import useAddBeneficiaryApi from '@src/domains/dashboard/Payouts/hooks/useAddBeneficiaryApi';
import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import AddBeneficiaryModal from './AddBeneficiaryModal';
import { useInvoice } from '../../hooks/useInvoice';

const { Title, Text } = Typography;

interface InvoiceRow {
    id?: number;
    invoiceNumber?: string;
    amount?: string | number;
    accountNumber?: string | null;
    ifscCode?: string | null;
    purchaseOrder?: {
        refNumber?: string;
        vendor?: {
            businessName?: string;
            bankName?: string | null;
            payoutBeneficiaryId?: string | number | null;
        };
    };
    [key: string]: any;
}

interface Props {
    open: boolean;
    invoice: InvoiceRow | null;
    onConfirm: () => void;
    onCancel: () => void;
}

const SummaryRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <Flex justify="space-between" align="center" gap={8} wrap="wrap">
        <Text style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: '#a9acb4', fontWeight: 400 }}>{label}</Text>
        <Text style={{ fontSize: 'clamp(13px, 2.5vw, 18px)', color: '#292d32', fontWeight: 500 }}>{value ?? '-'}</Text>
    </Flex>
);

const PayInvoiceModal: React.FC<Props> = ({ open, invoice, onConfirm, onCancel }) => {
    const { pay, isSubmitting } = useInvoice();
    const { addBeneficiary, isLoading: isAddingBeneficiary } = useAddBeneficiaryApi();
    const dispatch = useAppDispatch();
    const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);

    useEffect(() => { if (open) setShowBeneficiaryModal(false); }, [open]);

    const vendorName = invoice?.purchaseOrder?.vendor?.businessName ?? 'This vendor';

    const handleConfirm = async () => {
        if (!invoice?.id) return;

        const isBeneficiary = !!invoice?.purchaseOrder?.vendor?.payoutBeneficiaryId;
        if (!isBeneficiary) {
            setShowBeneficiaryModal(true);
            return;
        }

        const success = await pay(invoice.id);
        if (success) onConfirm();
    };

    const handleAddBeneficiary = async () => {
        const { accountNumber, ifscCode } = invoice ?? {};
        if (!accountNumber || !ifscCode) {
            dispatch(showToast({ variant: 'error', description: 'Vendor bank details are incomplete. Please update the vendor profile first.' }));
            return;
        }

        const res = await addBeneficiary({
            type: 'BUSINESS',
            name: vendorName,
            accountNumber,
            ifscCode,
            bankName: invoice?.purchaseOrder?.vendor?.bankName ?? invoice?.bankName ?? undefined,
            paymentCategory: 'VENDOR_PAYMENT',
        });

        if (res) {
            dispatch(showToast({ variant: 'success', description: `${vendorName} added as beneficiary.` }));
            setShowBeneficiaryModal(false);
            if (!invoice?.id) return;
            const success = await pay(invoice.id);
            if (success) onConfirm();
        }
    };

    return (
        <>
            <Modal
                open={open}
                onCancel={onCancel}
                footer={null}
                width="min(700px, 95vw)"
                title={
                    <Flex vertical gap={4} style={{ marginBottom: 'clamp(10px, 2vw, 18px)' }}>
                        <Title level={3} style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 24px)' }}>Pay Invoice</Title>
                        <Text style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: '#a9acb4', fontWeight: 500 }}>
                            Confirm payment for this approved invoice.
                        </Text>
                    </Flex>
                }
                styles={{ content: { borderRadius: 26, padding: 'clamp(16px, 4vw, 32px)' } }}
            >
                <Flex vertical className='border rounded-[26px]' style={{ padding: 'clamp(12px, 3vw, 33px)', gap: 'clamp(24px, 5vw, 50px)' }}>
                    <Flex vertical gap={16}>
                        <Text style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#898b93', fontWeight: 500 }}>Invoice Summary</Text>
                        <Flex vertical gap={16}>
                            <SummaryRow label="Vendor"    value={invoice?.purchaseOrder?.vendor?.businessName} />
                            <SummaryRow label="Invoice"   value={invoice?.invoiceNumber} />
                            <SummaryRow label="PO Number" value={invoice?.purchaseOrder?.refNumber} />
                            <SummaryRow label="Amount"    value={invoice?.amount ? `₹ ${Number(invoice.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'} />
                        </Flex>
                    </Flex>

                    <Flex vertical gap={16}>
                        <Text style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#898b93', fontWeight: 500 }}>Payout Details</Text>
                        <Flex vertical gap={16}>
                            <SummaryRow label="Bank"      value={invoice?.purchaseOrder?.vendor?.bankName ?? invoice?.bankName} />
                            <SummaryRow label="Account"   value={invoice?.accountNumber} />
                            <SummaryRow label="IFSC Code" value={invoice?.ifscCode} />
                        </Flex>
                    </Flex>

                    <Flex gap={9}>
                        <Button
                            type="primary"
                            danger
                            icon={<CheckCircleOutlined />}
                            style={{ flex: 1, borderRadius: 8 }}
                            loading={isSubmitting}
                            onClick={handleConfirm}
                        >
                            Confirm Payment
                        </Button>
                        <Button
                            danger
                            variant="outlined"
                            style={{ flex: 1, borderRadius: 8 }}
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    </Flex>
                </Flex>
            </Modal>

            <AddBeneficiaryModal
                open={showBeneficiaryModal}
                vendorName={vendorName}
                isLoading={isAddingBeneficiary || isSubmitting}
                onConfirm={handleAddBeneficiary}
                onCancel={() => setShowBeneficiaryModal(false)}
            />
        </>
    );
};

export default PayInvoiceModal;
