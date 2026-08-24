import React, { useEffect, useMemo } from 'react';

import { Form, Skeleton } from 'antd';
import { FormikProps, useFormikContext } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import SearchSelectInput from '@src/domains/dashboard/billPayments/components/CustomSelectSearch';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { accessKeys } from '@utils/accessKeys';

import useServiceProviderApi from '../../hooks/useServiceProviderApi';
import { setFormInitialValues } from '../../slices/beneficiary';
import {
    BeneficiaryFormProps,
    CustomerParam,
    CustomerValuesType,
    UserEnteredFormValues,
} from '../../types/index';
import { billPayments, isMobileLikeParam } from '../../utils/data';

// Build minimal field definitions from a beneficiary's saved customerParams so the inputs can render
// (and show their saved values) even when the provider isn't on the currently-loaded biller page.
// Loose validation here is acceptable: the values were already valid when saved, and the real
// definitions take over the moment the user re-selects a provider.
const deriveParamsFromSaved = (saved?: CustomerValuesType[]): CustomerParam[] =>
    (saved ?? [])
        .map(param => {
            const paramName = param.name ?? param.paramName;
            if (!paramName) return null;
            return {
                paramName,
                values: param.value ?? param.paramValue ?? null,
                isOptional: 'true',
                maxLength: 0,
                minLength: 0,
                dataType: '',
                regEx: '',
                visibility: true,
            } as CustomerParam;
        })
        .filter((param): param is CustomerParam => param !== null);

const BeneficiaryForm = ({
    service,
    setService,
    accessKeyName,
    selectedBillerData,
    setSelectedBillerData,
    editValues,
}: BeneficiaryFormProps) => {
    const dispatch = useAppDispatch();
    const allPayments = [...billPayments];
    const formik = useFormikContext<UserEnteredFormValues>();
    const bbpsServiceCategory = allPayments.find(
        obj => obj.accessKey === service
    )?.BBPSCategoryName;
    const [isServiceChanging, setIsServiceChanging] = React.useState(false);

    // LPG beneficiary: any mobile-like customer-param must be pinned to the Peko account holder's
    // registered mobile (pre-filled, non-editable, with a tooltip) — same rule as the LPG payment form.
    const userMobile = useAppSelector(state => state.reducer.user.user?.mobileNo) || '';
    const isLpg = service === accessKeys.lpg;
    const [hasInitializedEdit, setHasInitializedEdit] = React.useState(false);

    const {
        serviceProviderData,
        isLoading,
        isLoadingMore,
        hasMore,
        loadMoreServiceProviders,
        handleServiceProviderSearch,
        resetSearchIfDirty,
    } = useServiceProviderApi(bbpsServiceCategory);
    const handleChange = (value: string, labelName: any) => {
        setIsServiceChanging(false);
        setHasInitializedEdit(true); // User has picked — stop the edit-resolution effect from overwriting.
        const selectedOption =
            serviceProviderData && serviceProviderData.find(opt => opt.value === value);
        setSelectedBillerData(selectedOption?.customerParams!);
        dispatch(
            setFormInitialValues({
                accessKey: formik.values.accessKey,
                name: formik.values.name,
                billerId: value,
                serviceProvider: labelName?.label,
            })
        );
    };

    const beneficiaryOptions = allPayments
        .map(payment => ({
            value: payment.accessKey,
            label: payment.title,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    const formatLabel = (text: string) =>
        text
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
            .replace(/^./, (str: string) => str.toUpperCase()) // Capitalize first letter
            .replace(/\b(id)\b/i, 'ID'); // Make 'id' into 'ID'

    useEffect(() => {
        setHasInitializedEdit(false);
        setSelectedBillerData([]);
    }, [editValues?.id, setSelectedBillerData]);

    // The saved provider may not be on the currently-loaded biller page (the list is paginated), so
    // the Select would otherwise display the raw billerId. Surface a synthetic option carrying the
    // saved provider name until the real option is loaded.
    const mergedProviderOptions = useMemo(() => {
        const options = serviceProviderData || [];
        if (!editValues?.billerId || options.some(opt => opt.value === editValues.billerId)) {
            return options;
        }
        return [
            {
                value: editValues.billerId,
                label: editValues.serviceProvider || editValues.billerId,
                customerParams: [],
            },
            ...options,
        ];
    }, [serviceProviderData, editValues?.billerId, editValues?.serviceProvider]);

    useEffect(() => {
        if (accessKeyName) setService(accessKeyName);
        if (editValues) {
            setService(editValues?.accessKey);
            setIsServiceChanging(false);
        }
        // Resolve the saved provider's input fields once the provider list settles. Prefer the matched
        // biller's real param definitions; if it isn't on the loaded page, derive them from the saved
        // customerParams so the fields still render and populate without a manual re-select.
        if (editValues && !hasInitializedEdit && !isLoading) {
            const selectedOption = serviceProviderData?.find(
                opt => opt.value === editValues.billerId
            );
            setSelectedBillerData(
                selectedOption
                    ? selectedOption.customerParams ?? []
                    : deriveParamsFromSaved(editValues.customerParams)
            );
            setHasInitializedEdit(true);
        }
    }, [accessKeyName, editValues, serviceProviderData, hasInitializedEdit, isLoading, setSelectedBillerData, setService]);
    const { setFieldValue, validateField }: FormikProps<any> = useFormikContext() ?? {};

    // Force Formik state to the current user mobile for every mobile-like LPG param. This runs after
    // selectedBillerData populates AND after edit-mode pre-fill, so a saved beneficiary's old mobile
    // is overwritten by the current account holder's mobile before submission.
    useEffect(() => {
        if (!isLpg || !userMobile || !selectedBillerData?.length) return;
        selectedBillerData.forEach(input => {
            if (isMobileLikeParam(input.paramName)) {
                setFieldValue(input.paramName, userMobile);
            }
        });
    }, [isLpg, userMobile, selectedBillerData, setFieldValue]);

    return (
        <Form layout="vertical">
            {!accessKeyName && (
                <SelectInput
                    name="accessKey"
                    label="Select Service"
                    placeholder="Select Service"
                    options={beneficiaryOptions}
                    isRequired
                    showSearch
                    filterOption={(input, option) => {
                        const label = option?.children?.toString().toLowerCase() || '';
                        return label.includes(input.toLowerCase());
                    }}
                    handleChange={e => {
                        setIsServiceChanging(true);
                        setService(e);
                        formik.setFieldValue('accessKey', e);
                        formik.setFieldValue('billerId', '');
                        setFieldValue('accessKey', e);
                        setTimeout(() => {
                            validateField('accessKey');
                        }, 0);
                    }}
                />
            )}
            <TextInput
                name="name"
                label="Beneficiary Name"
                type="text"
                placeholder="Example: Jhoxxx"
                isRequired
                maxLength={50}
            />
            {service && (
                isLoading && editValues && !hasInitializedEdit ? (
                    <Form.Item label="Select Service Provider" required>
                        <Skeleton.Input active block />
                    </Form.Item>
                ) : (
                    <SearchSelectInput
                        name="billerId"
                        label="Select Service Provider"
                        options={mergedProviderOptions}
                        placeholder="Select Service Provider"
                        handleChange={handleChange}
                        isLoading={isLoading || isLoadingMore}
                        isRequired
                        filterOption={false}
                        onSearch={handleServiceProviderSearch}
                        onDropdownVisibleChange={open => {
                            if (open) resetSearchIfDirty();
                        }}
                        onPopupScroll={event => {
                            const target = event.target as HTMLDivElement;
                            const reachedBottom =
                                target.scrollTop + target.clientHeight >= target.scrollHeight - 20;
                            if (reachedBottom && hasMore) {
                                loadMoreServiceProviders();
                            }
                        }}
                    />
                )
            )}
            {!isServiceChanging &&
                selectedBillerData?.map((input, i) => {
                    const shouldLockToUserMobile = isLpg && isMobileLikeParam(input.paramName);
                    return (
                        <TextInput
                            label={formatLabel(input.paramName)}
                            name={input.paramName}
                            placeholder={`Enter ${formatLabel(input.paramName)}`}
                            type="text"
                            key={i}
                            allowNumbersOnly={input.dataType === 'NUMERIC'}
                            isRequired={input.isOptional === 'false'}
                            maxLength={input.maxLength || 20}
                            isDisabled={shouldLockToUserMobile}
                            values={shouldLockToUserMobile ? userMobile : undefined}
                            showToolTip={shouldLockToUserMobile}
                            tooltipText={shouldLockToUserMobile ? 'Only your registered mobile number can be used here.' : undefined}
                        />
                    );
                })}
        </Form>
    );
};

export default BeneficiaryForm;
