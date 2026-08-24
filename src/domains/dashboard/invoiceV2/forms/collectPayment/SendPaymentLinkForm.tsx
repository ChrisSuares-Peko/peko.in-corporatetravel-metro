import React from 'react';

import { Form } from 'antd';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';


const LINK_EXPIRY_OPTIONS = [
    { label: '5 minutes', value: '5m' },
    { label: '10 minutes', value: '10m' },
    { label: '1 hour', value: '1h' },
    { label: '6 hours', value: '6h' },
    { label: '12 hours', value: '12h' },
    { label: '24 hours', value: '24h' },
];

const SendPaymentLinkForm: React.FC = () => (
        <Form layout="vertical">
            <TextInput
                name="amount"
                label="Amount"
                placeholder="Enter amount"
                type="text"
                allowDecimalsOnly
                isRequired
                isDisabled
            />

            <TextInput
                name="customerName"
                label="Customer Name (Optional)"
                placeholder="Enter Customer Name (Optional)"
                type="text"
            />

            <TextInput
                name="customerPhone"
                label="Customer Phone (Optional)"
                placeholder="Enter Customer Phone (Optional)"
                type="text"
                allowNumbersOnly
            />

            <SelectInput
                name="linkExpiry"
                label="Link Expiry"
                placeholder="Select Expiry Duration"
                options={LINK_EXPIRY_OPTIONS}
            />
        </Form>
    );

export default React.memo(SendPaymentLinkForm);
