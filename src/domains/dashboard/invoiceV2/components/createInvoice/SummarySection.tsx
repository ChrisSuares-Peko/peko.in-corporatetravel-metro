import { Flex } from 'antd';
import { useFormikContext } from 'formik';

import TextInput from '@components/atomic/inputs/TextInput';

import SummaryRow from './SummaryRow';
import { CreateInvoiceFormValues } from '../../types/createInvoice';
import {
    calcAmountDue,
    calcDiscount,
    calcSubtotal,
    calcTax,
    calcTotal,
} from '../../utils/invoiceCalculations';

interface SummarySectionProps {
    businessState: string;
    isCreditNoteMode?: boolean;
}

const SummarySection = ({ businessState, isCreditNoteMode }: SummarySectionProps) => {
    const { values } = useFormikContext<CreateInvoiceFormValues>();

    const subtotal = calcSubtotal(values.items);
    const tax = calcTax(values.items);
    const discount = calcDiscount(values.items);
    const total = calcTotal(values.items, values.additional.shippingCost);
    const amountDue = calcAmountDue(total, values.additional.amountPaid);

    const isInternational = values.invoice.type === 'INTERNATIONAL';
    const isInterState =
        !isInternational &&
        !!businessState &&
        !!values.buyer.state &&
        values.buyer.state.toLowerCase() !== businessState.toLowerCase();

    const taxNum = parseFloat(tax) || 0;
    const halfTax = (taxNum / 2).toFixed(2);

    return (
        <Flex vertical className="w-full xl:max-w-[420px] px-0 sm:px-3 bg-white">
            <SummaryRow label="Subtotal" amount={subtotal} />

            {isInternational && <SummaryRow label="Tax" amount={tax} />}
            {!isInternational && isInterState && <SummaryRow label="IGST" amount={tax} />}
            {!isInternational && !isInterState && (
                <>
                    <SummaryRow label="CGST" amount={halfTax} />
                    <SummaryRow label="SGST" amount={halfTax} />
                </>
            )}

            <SummaryRow label="Discount" amount={discount} />

            <SummaryRow label="Shipping Cost">
                <TextInput
                    name="additional.shippingCost"
                    placeholder="Enter Amount"
                    type="text"
                    size="middle"
                    formItemClass="m-0"
                    allowNumbersOnly
                    maxLength={10}
                />
            </SummaryRow>

            <SummaryRow label="Total Amount" amount={total} />

            {!isCreditNoteMode && (
                <SummaryRow label="Amount Paid">
                    <TextInput
                        name="additional.amountPaid"
                        placeholder="Enter Amount"
                        type="text"
                        formItemClass="m-0"
                        allowTwoDecimalsOnly
                    />
                </SummaryRow>
            )}

            <SummaryRow label="Amount Due" amount={amountDue} />

        </Flex>
    );
};

export default SummarySection;
