import React, { useEffect, useState } from 'react';

import { InboxOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Form, Row, Typography, Upload } from 'antd';
import { RcFile, UploadFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import { Formik, useFormikContext } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';

import DatePickerInput from '@components/atomic/inputs/DatePickerInput';
import SelectInputWithSearch from '@components/atomic/inputs/SelectInputWithSearch';
import TextAreaInput from '@components/atomic/inputs/TextAreaInput';
import TextInput from '@components/atomic/inputs/TextInput';
import invoiceDetails from '@src/domains/dashboard/Procure/assets/icons/invoiceUploadIcon.svg';
import invoicingDocumentIcon from '@src/domains/dashboard/Procure/assets/icons/invoicingDocumentIcon.svg';
import linkToPurchase from '@src/domains/dashboard/Procure/assets/icons/linkToPurchase.svg';
import newRFQImage from '@src/domains/dashboard/Procure/assets/images/newRFQImage.svg';
import { paths } from '@src/routes/paths';

import ScrollToError from '../components/ScrollToError';
import { useInvoice } from '../hooks/useInvoice';
import { usePurchaseOrder } from '../hooks/usePurchaseOrder';
import { uploadInvoiceSchema } from '../schema';
import { INVOICE_ALLOWED_FILE_TYPES, PO_STEPS, PO_TIPS } from '../utils/data';

const { Title, Text } = Typography;

const SectionHeader: React.FC<{ icon: string; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
    <Flex gap={14} align="center" style={{ marginBottom: 18 }}>
        <Flex align="center" justify="center" style={{ background: '#fff4f4', borderRadius: 10, width: 37, height: 37, flexShrink: 0 }}>
            <img src={icon} alt={title} style={{ width: 24, height: 24 }} />
        </Flex>
        <Flex vertical gap={2}>
            <Text style={{ fontSize: 14, fontWeight: 500, color: '#000' }}>{title}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{subtitle}</Text>
        </Flex>
    </Flex>
);

const InvoiceDragger: React.FC = () => {
    const { setFieldValue } = useFormikContext<any>();
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const beforeUpload = (file: RcFile) => {
        if (!INVOICE_ALLOWED_FILE_TYPES.includes(file.type)) return Upload.LIST_IGNORE;
        if (file.size / 1024 > 5120) return Upload.LIST_IGNORE;
        return true;
    };

    const customRequest = ({ file, onSuccess }: any) => {
        const f = file as File;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setFieldValue('invoiceFile', reader.result.split(',')[1]);
                setFieldValue('invoiceFileFormat', f.type.split('/')[1]);
                setFieldValue('invoiceFileName', f.name);
                setFileList([{ uid: '-1', name: f.name, status: 'done' }]);
            }
        };
        reader.readAsDataURL(f);
        onSuccess?.('ok');
    };

    const onRemove = () => {
        setFieldValue('invoiceFile', '');
        setFieldValue('invoiceFileFormat', '');
        setFieldValue('invoiceFileName', '');
        setFileList([]);
        return true;
    };

    return (
        <Upload.Dragger
            accept={INVOICE_ALLOWED_FILE_TYPES.join(',')}
            maxCount={1}
            fileList={fileList}
            beforeUpload={beforeUpload}
            customRequest={customRequest}
            onRemove={onRemove}
            style={{ borderRadius: 12, background: '#fafafa', border: '1px solid #d9d9d9' }}
        >
            <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#ff4f4f', fontSize: 32 }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 13, color: 'rgba(0,0,0,0.85)' }}>
                Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint" style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', width: 395, margin: '0 auto' }}>
                Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files
            </p>
        </Upload.Dragger>
    );
};

const UploadInvoicePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const defaultPoId = location.state?.defaultPoId;
    const { create, isSubmitting } = useInvoice();

    const initialValues = {
        purchaseOrder: defaultPoId ? String(defaultPoId) : '',
        accountNumber: '',
        ifscCode: '',
        invoiceNumber: '',
        amount: '',
        invoiceDate: '',
        receivedDate: '',
        dueDate: '',
        notes: '',
        invoiceFile: '',
        invoiceFileFormat: '',
        invoiceFileName: '',
    };
    const { dropdownData: purchaseOrders, fetchDropdownData } = usePurchaseOrder();

    useEffect(() => { fetchDropdownData(); }, [fetchDropdownData]);

    const handleCancel = () =>
        navigate(`${paths.dashboard.procure}/${paths.procure.invoicing.index}`);

    const handleSubmit = async (values: typeof initialValues) => {
        const selectedPO = purchaseOrders.find(po => po.id === Number(values.purchaseOrder));
        const result = await create({
            purchaseOrderId: Number(values.purchaseOrder),
            vendorId: selectedPO?.vendorId ?? 0,
            invoiceNumber: values.invoiceNumber,
            amount: Number(values.amount),
            invoiceDate: values.invoiceDate,
            receivedDate: values.receivedDate || undefined,
            dueDate: values.dueDate || undefined,
            accountNumber: values.accountNumber || undefined,
            ifscCode: values.ifscCode || undefined,
            notes: values.notes || undefined,
            attachments: values.invoiceFileName
                ? [{ fileName: values.invoiceFileName, fileBase64: values.invoiceFile, fileFormat: values.invoiceFileFormat }]
                : undefined,
        });
        if (result) handleCancel();
    };

    const poOptions = purchaseOrders.map(po => ({
        value: String(po.id),
        label: po.refNumber + (po.vendor?.businessName ? ` — ${po.vendor.businessName}` : ''),
    }));

    return (
        <Formik initialValues={initialValues} validationSchema={uploadInvoiceSchema} onSubmit={handleSubmit}>
            {({ values, handleSubmit: formikSubmit }) => {
                const selectedPO = purchaseOrders.find(po => po.id === Number(values.purchaseOrder));
                return (
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            <Card className="rounded-3xl w-full !border-gray-100" styles={{ body: { padding: 32 } }}>
                                <Title level={4} className="text-center" style={{ marginBottom: 4 }}>Upload Invoice</Title>
                                <Text className="text-[#000000] text-xs block mb-10 text-center">
                                    Capture a vendor invoice manually and match it to the correct purchase order
                                </Text>

                                <Form layout="vertical" onFinish={formikSubmit}>
                                    <ScrollToError />
                                    {/* Link to Purchase Order */}
                                    <Card className="rounded-3xl border border-gray-100 mb-4 mt-4" styles={{ body: { padding: '20px 24px'  } }}>
                                        <SectionHeader
                                            icon={linkToPurchase}
                                            title="Link to Purchase Order"
                                            subtitle="Choose the PO this invoice belongs to and confirm the vendor context"
                                        />
                                        <SelectInputWithSearch
                                            name="purchaseOrder"
                                            label="Purchase Order"
                                            placeholder="Select a purchase order"
                                            options={poOptions}
                                            isRequired
                                            isDisabled={!!defaultPoId}
                                        />
                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <TextInput
                                                    name="accountNumber"
                                                    label="Account Number"
                                                    type="text"
                                                    placeholder="Enter Account Number"
                                                    formItemClass="!mb-0"
                                                    allowNumbersOnly
                                                />
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <TextInput
                                                    name="ifscCode"
                                                    label="IFSC Code"
                                                    type="text"
                                                    placeholder="Enter IFSC Code"
                                                    formItemClass="!mb-0"
                                                    allowAlphabetsAndNumbersOnly
                                                    convertToUppercase
                                                    maxLength={11}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={24} style={{ marginTop: 16 }}>
                                            <Col xs={24} sm={12}>
                                                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                                                    <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', display: 'block' }}>Vendor</Text>
                                                    <Text style={{ fontSize: 12, color: '#000', display: 'block', fontWeight: 500, marginTop: 4 }}>
                                                        {selectedPO?.vendor?.businessName ?? 'Select a PO first'}
                                                    </Text>
                                                    <Text style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)', display: 'block', marginTop: 4 }}>
                                                        Vendor details will auto-fill from the linked PO
                                                    </Text>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                                                    <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', display: 'block' }}>Vendor</Text>
                                                    <Text style={{ fontSize: 12, color: '#000', display: 'block', fontWeight: 500, marginTop: 4 }}>
                                                        {selectedPO?.vendor?.businessName ?? 'Select a PO first'}
                                                    </Text>
                                                    <Text style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)', display: 'block', marginTop: 4 }}>
                                                        Vendor details will auto-fill from the linked PO
                                                    </Text>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>

                                    {/* Invoice Details */}
                                     <Card className="rounded-3xl border border-gray-100 mb-4" styles={{ body: { padding: '20px 24px'  } }}>
                                        <SectionHeader
                                            icon={invoiceDetails}
                                            title="Invoice Details"
                                            subtitle="Capture the metadata exactly as received from the vendor"
                                        />
                                        <Row gutter={16} style={{ marginBottom: 16 }}>
                                            <Col xs={24} sm={12}>
                                                <TextInput
                                                    name="invoiceNumber"
                                                    label="Invoice Number"
                                                    type="text"
                                                    placeholder="Enter Invoice number"
                                                    isRequired
                                                    formItemClass="!mb-0"
                                                    maxLength={18}
                                                    allowAlphabetsNumberAndSpecialCharacters={['-', '_', '/']}
                                                />
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <TextInput
                                                    name="amount"
                                                    label="Amount"
                                                    type="text"
                                                    placeholder="Enter Amount"
                                                    isRequired
                                                    allowTwoDecimalsOnly
                                                    formItemClass="!mb-0"
                                                    maxLength={8}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col xs={24} sm={8}>
                                                <DatePickerInput
                                                    name="invoiceDate"
                                                    label="Invoice Date"
                                                    placeholder="Select date"
                                                    isRequired
                                                    needConfirm={false}
                                                    formItemClass="!mb-0"
                                                    classes="w-full"
                                                    maxDate={dayjs()}
                                                />
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <DatePickerInput
                                                    name="receivedDate"
                                                    label="Received Date"
                                                    placeholder="Select date"
                                                    isRequired
                                                    needConfirm={false}
                                                    formItemClass="!mb-0"
                                                    classes="w-full"
                                                    maxDate={dayjs()}
                                                />
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <DatePickerInput
                                                    name="dueDate"
                                                    label="Due Date"
                                                    placeholder="Select date"
                                                    needConfirm={false}
                                                    formItemClass="!mb-0"
                                                    classes="w-full"
                                                    minDate={dayjs()}
                                                />
                                            </Col>
                                        </Row>
                                    </Card>

                                    {/* Invoice Documents */}
                                     <Card className="rounded-3xl border border-gray-100 mb-4" styles={{ body: { padding: '20px 24px'  } }}>
                                        <SectionHeader
                                            icon={invoicingDocumentIcon}
                                            title="Invoice Documents"
                                            subtitle="Upload the invoice plus any supporting delivery or approval documents"
                                        />
                                        <Form.Item label="Attachment" style={{ marginBottom: 8 }}>
                                            <InvoiceDragger />
                                        </Form.Item>
                                        <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', display: 'block', textAlign: 'center' }}>
                                            Simulated upload. Filenames are stored in session storage and shown in the invoice detail view.
                                        </Text>
                                    </Card>

                                    {/* Notes & Intake Context */}
                                     <Card className="rounded-3xl border border-gray-100 mb-4" styles={{ body: { padding: '20px 24px 8px'  } }}>
                                        <SectionHeader
                                            icon={invoicingDocumentIcon}
                                            title="Notes & Intake Context"
                                            subtitle="Capture anything procurement or finance should know before payment"
                                        />
                                        <TextAreaInput
                                            name="notes"
                                            label="Notes"
                                            placeholder="Enter notes"
                                            minRows={4}
                                            showCount
                                            maxLength={250}
                                        />
                                    </Card>

                                    <Flex gap={10} style={{ marginTop: 0 }}>
                                        <Button
                                            type="primary"
                                            danger
                                            htmlType="submit"
                                            loading={isSubmitting}
                                        >
                                            Upload Invoice
                                        </Button>
                                        <Button
                                            danger
                                            onClick={handleCancel}
                                            disabled={isSubmitting}
                                            style={{ borderColor: '#ff4f4f', color: '#ff4f4f', background: '#fff' }}
                                        >
                                            Cancel
                                        </Button>
                                    </Flex>
                                </Form>
                            </Card>
                        </Col>

                        {/* Right Sidebar */}
                        <Col xs={24} lg={8}>
                            <>
        <Card className="rounded-3xl border border-gray-100 mb-4" styles={{ body: { padding: 24 } }}>
            <Card
                className="mb-4 rounded-xl !bg-[#FAF9F6] !border-0"
                styles={{ body: { padding: '20px 16px', display: 'flex', justifyContent: 'center' } }}
            >
                <img src={newRFQImage} alt="tips" style={{ width: 160, opacity: 0.9 }} />
            </Card>
            <Text strong className="block !mb-1" style={{ fontWeight: 500, fontSize: 18 }}>Tips</Text>
            <Flex vertical gap={28} className="mb-4 mt-6">
                {PO_TIPS.map((tip, i) => (
                    <Flex key={i} gap={10} align="flex-start">
                        <span className="shrink-0 w-[10px] h-[10px] rounded-full mt-1 block" style={{ background: '#ff4f4f' }} />
                        <Text style={{ fontSize: 14, color: '#7d7d7d', lineHeight: '22px' }}>{tip}</Text>
                    </Flex>
                ))}
            </Flex>
        </Card>

        <Card className="rounded-3xl border border-gray-100" styles={{ body: { padding: 24 } }}>
            <Text strong className="block !mb-5" style={{ fontWeight: 500, fontSize: 18 }}>
                What happens next?
            </Text>
            <Flex vertical gap={12} className="mt-6">
                {PO_STEPS.map((step, i) => (
                    <Card
                        key={i}
                        size="small"
                        className="!rounded-[28px] !bg-[#faf9f6] !border-0"
                        styles={{ body: { padding: '30px 21px' } }}
                    >
                        <Flex gap={21} align="center">
                            <Flex
                                align="center"
                                justify="center"
                                style={{
                                    flexShrink: 0,
                                    width: 47,
                                    height: 47,
                                    minWidth: 47,
                                    minHeight: 47,
                                    borderRadius: 23.5,
                                    background: '#fff',
                                    border: '1px solid #f0f0f0',
                                    fontWeight: 600,
                                    fontSize: 22,
                                    color: 'rgba(0,0,0,0.85)',
                                }}
                            >
                                {i + 1}
                            </Flex>
                            <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', lineHeight: '22px' }}>
                                {step}
                            </Text>
                        </Flex>
                    </Card>
                ))}
            </Flex>
        </Card>
    </>
                        </Col>
                    </Row>
                );
            }}
        </Formik>
    );
};

export default UploadInvoicePage;
