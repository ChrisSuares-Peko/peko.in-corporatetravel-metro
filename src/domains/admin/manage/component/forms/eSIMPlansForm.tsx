import React, { useEffect, useState } from 'react';

import { Flex, Form, Skeleton, Typography } from 'antd';
import { useFormikContext } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';

import useEsimPlanForm from '../../hooks/useEsimPlanForm';
import { Country, DropDown } from '../../types/eSIM';

type Props = {
    coverageData: DropDown | undefined;
    setSearchCountry: (val: string) => void;
    isEdit?: boolean;
};

const EsimPlanForm = ({ coverageData, setSearchCountry, isEdit = false }: Props) => {
    const [selectedCoverage, setSelectedCoverage] = useState<string | undefined>();
    const [, setFilteredCountryData] = useState<string | undefined>();
    const [, setAmount] = useState<number | undefined>();
    const [dataMBs, setDataMBs] = useState<number | undefined>();
    const [countryList, setCountryList] = useState<Country[] | undefined>(undefined);

    const [esimPrice, setEsimPrice] = useState<number | undefined>();
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const { fetchEsimPrice } = useEsimPlanForm();
    const { setFieldValue } = useFormikContext();

    useEffect(() => {
        if (dataMBs && esimPrice) {
            const expectedAmount = (dataMBs * esimPrice) / 1024;
            setAmount(expectedAmount);
            setValidationMessage(`Vendor price for this plan: ₹ ${expectedAmount.toFixed(2)}`);
        } else {
            setValidationMessage(null);
        }
    }, [esimPrice, dataMBs]);

    const fetchPrice = async (
        coverageId: any,
        countryIso2: string,
        indicator: string,
        label: string
    ) => {
        if (!coverageId) return;

        const response = await fetchEsimPrice(coverageId, countryIso2, indicator, label);
        if (response && response.pricePlan) {
            const price = Number(response.pricePlan);
            setEsimPrice(price);
        }
    };

    const mappedCountryOptions =
        countryList?.map((c: any) => ({
            label: c.name,
            value: c.iso2,
            indicator: c.indicator,
        })) || [];

    return (
        <Flex vertical className="w-full ">
            <Form layout="vertical">
                {isEdit && (
                    <TextInput
                        name="name"
                        label="Name"
                        type="text"
                        placeholder="Enter Plan Name"
                        isRequired
                        classes=" rounded-sm"
                        maxLength={30}
                        isDisabled
                    />
                )}
                {coverageData ? (
                    <SelectInput
                        isRequired
                        name="coverage"
                        options={coverageData}
                        placeholder="Select Country and Network Operator"
                        label="Network Coverage (Country & Operator)"
                        allowClear
                        filterOption={false}
                        showSearch
                        isDisabled={isEdit}
                        onSearch={setSearchCountry}
                        handleChange={selectedValue => {
                            setSelectedCoverage(selectedValue);
                            setFieldValue('dataMBs', '');
                            setFieldValue('amount', '');
                            setFieldValue('country', undefined);
                            setValidationMessage(null);
                            if (!selectedValue) {
                                setSearchCountry('');
                                setFilteredCountryData('');
                                return;
                            }

                            // Find the full coverage object
                            const selectedProfile = coverageData?.find(
                                item => item.value === selectedValue
                            );

                            setCountryList(selectedProfile?.countries);
                            setFilteredCountryData(selectedProfile?.label?.split(',')[0] || '');
                        }}
                    />
                ) : (
                    <Skeleton.Input active block />
                )}
                {coverageData ? (
                    <SelectInput
                        isDisabled={!selectedCoverage}
                        isRequired
                        name="country"
                        placeholder="Select Country"
                        label="Country"
                        options={mappedCountryOptions}
                        handleChange={countryIso2 => {
                            const selectedCountry = countryList?.find(c => c.iso2 === countryIso2);
                            if (!selectedCountry || !selectedCoverage) return;

                            setFilteredCountryData(selectedCountry.name);

                            const selectedProfile = coverageData?.find(
                                item => item.value === selectedCoverage
                            );
                            if (!selectedProfile) return;

                            // Call price API only after country is selected
                            fetchPrice(
                                selectedProfile.value,
                                selectedCountry.iso2,
                                selectedCountry.indicator,
                                selectedProfile.provider
                            );
                        }}
                    />
                ) : (
                    <Skeleton.Input active block />
                )}

                <TextInput
                    name="dataMBs"
                    label="Data Pack (MB's)"
                    type="text"
                    placeholder="Enter Plan Data Pack"
                    isRequired
                    classes="rounded-sm"
                    maxLength={6}
                    allowDecimalsOnly
                    handleChange={e => {
                        const value = Number(e);
                        setDataMBs(value);
                    }}
                />

                <TextInput
                    name="periodDays"
                    label="Plan Validity (Days)"
                    type="text"
                    placeholder="Enter Plan validity"
                    classes="rounded-sm"
                    maxLength={10}
                    allowNumbersOnly
                    isRequired
                />
                <TextInput
                    name="amount"
                    label="Plan Amount (₹)"
                    type="text"
                    isRequired
                    placeholder="Enter Plan Amount"
                    classes="rounded-sm"
                    maxLength={10}
                    allowTwoDecimalsOnly
                />
                {validationMessage && <Typography color="danger">{validationMessage}</Typography>}
            </Form>
        </Flex>
    );
};
export default EsimPlanForm;
