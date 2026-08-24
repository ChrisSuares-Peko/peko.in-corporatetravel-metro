import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Row } from 'antd';
import { Form, Formik } from 'formik';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import UsageSection from '../components/forms/UsageSection';
import ValuationIntentSection from '../components/forms/ValuationIntentSection';
import VehicleInformationSection from '../components/forms/VehicleInformationSection';
import ReportPageHeader from '../components/shared/ReportPageHeader';
import ReportSummaryCard from '../components/shared/ReportSummaryCard';
import VehicleStripCard from '../components/shared/VehicleStripCard';
import useReportPayment from '../hooks/useReportPayment';
import useValuationEstimate from '../hooks/useValuationEstimate';
import { valuationSchema } from '../schema/index';
import { ValuationFormValues } from '../types/index';
import { reportMeta, vehicleReportsRoot } from '../utils/reportMeta';

const meta = reportMeta.valuation;

const emptyValues: ValuationFormValues = {
    purpose: '',
    counterparty: '',
    vehicleCategory: '',
    make: '',
    model: '',
    manufacturingYear: '',
    variant: '',
    kilometresDriven: '',
    city: '',
};

// Valuation Report form: intent + vehicle information + usage, with the priced
// summary rail on the right.
//
// Paying fetches Droom's fair-market-value bands and carries them into the payment, so
// the order is recorded against the price quoted at that moment. The bands themselves
// are never shown here — they are the paid product, and the user first sees them on the
// order detail. If Droom can't price the vehicle, the payment does not go ahead.
const ValuationReportPage = () => {
    const navigate = useNavigate();
    const { pay, isLoading } = useReportPayment();
    const { isLoading: isValuing, fetchEstimate } = useValuationEstimate();
    const { selectedVehicle, drafts } = useAppSelector(state => state.reducer.vehicleReport);

    // Reached without picking a vehicle (deep link, or a refresh that cleared the
    // slice) — send the user back to the picker rather than showing an empty form.
    if (!selectedVehicle) {
        return <Navigate to={`${vehicleReportsRoot}/valuation/${paths.turbo.selectVehicle}`} replace />;
    }

    // Nothing is prefilled from the fleet vehicle: RC data carries the legal entity
    // ("HYUNDAI MOTOR INDIA LTD"), which matches no dropdown option — the select would
    // render empty while still submitting that raw string. Only a saved draft seeds
    // the form.
    const initialValues: ValuationFormValues = { ...emptyValues, ...drafts.valuation };

    return (
        <Flex vertical gap={24}>
            <ReportPageHeader title={meta.title} subtitle={meta.subtitle} />

            <Formik
                initialValues={initialValues}
                validationSchema={valuationSchema}
                onSubmit={async values => {
                    // Price the vehicle first. On failure the ApiClient interceptor has
                    // already explained why — stay on the form rather than charging for
                    // a report Droom just told us it cannot produce.
                    const bands = await fetchEstimate(values);
                    if (!bands) return;

                    await pay({
                        reportType: 'valuation',
                        vehicle: selectedVehicle,
                        reportPrice: meta.price,
                        formValues: values,
                        priceBands: bands,
                    });
                }}
            >
                {({ handleSubmit }) => (
                    <Form>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={15} xl={16}>
                                <Flex vertical gap={20}>
                                    <VehicleStripCard
                                        vehicle={selectedVehicle}
                                        actions={
                                            <Button
                                                danger
                                                size="large"
                                                onClick={() =>
                                                    navigate(
                                                        `${vehicleReportsRoot}/valuation/${paths.turbo.selectVehicle}`
                                                    )
                                                }
                                            >
                                                Change vehicle <ArrowRightOutlined />
                                            </Button>
                                        }
                                    />
                                    <ValuationIntentSection />
                                    <VehicleInformationSection
                                        categoryFieldName="vehicleCategory"
                                        categoryLabel="Vehicle category"
                                    />
                                    <UsageSection />
                                </Flex>
                            </Col>
                            <Col xs={24} lg={9} xl={8}>
                                <ReportSummaryCard
                                    title={meta.summaryTitle}
                                    features={meta.features}
                                    price={meta.price}
                                    isLoading={isLoading || isValuing}
                                    onPay={() => handleSubmit()}
                                />
                            </Col>
                        </Row>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
};

export default ValuationReportPage;
