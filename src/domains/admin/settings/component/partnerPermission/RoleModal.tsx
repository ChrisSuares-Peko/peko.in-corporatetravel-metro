import React from 'react';

import { Button, Col, Flex, Modal, Row, Skeleton, Typography } from 'antd';
import { Formik } from 'formik';

import CheckboxInput from '@components/atomic/inputs/CheckboxInput';
import CustomSelectSearch from '@components/atomic/inputs/CustomSelectSearch';
import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';
import { toTitleCase } from '@utils/wordFormat';

import SwitchInput from './SwitchInput';
import usePartnersForCorporate from '../../hooks/usePartnersForCorporate';
import useUpdateRoles from '../../hooks/useUpdateRoles';
import rolesSchema from '../../schema/roles';
import { Permission, refresh, Role } from '../../types/partnerPermission';

type RoleModalProps = {
    open: boolean;
    handleCancel: () => void;
    data?: Role;
};
const RoleModal = ({ open, handleCancel, data, setRefresh }: RoleModalProps & refresh) => {
    const { partnerData } = usePartnersForCorporate('');
    const dispatch = useAppDispatch();
    const { permissionData, updateRoleApi, createNewRoles, isloading } = useUpdateRoles();

    const updateMockService = (mockServices: Permission[], existingServices: Permission[]) =>
        mockServices.map(mockServiceCategory => {
            const matchingExistingCategory = existingServices?.find(
                existingServiceCategory =>
                    existingServiceCategory.label === mockServiceCategory.label
            );

            if (matchingExistingCategory) {
                // Update hasAccess for the service category
                mockServiceCategory.hasAccess = matchingExistingCategory.hasAccess;

                // Update hasAccess for each service within the category
                if (mockServiceCategory?.subServices?.length > 0) {
                    mockServiceCategory.subServices = mockServiceCategory.subServices.map(
                        mockServiceItem => {
                            const matchingExistingService =
                                matchingExistingCategory?.subServices?.find(
                                    existingServiceItem =>
                                        existingServiceItem.label === mockServiceItem.label
                                );

                            if (matchingExistingService) {
                                mockServiceItem.hasAccess = matchingExistingService.hasAccess;
                            }

                            return mockServiceItem;
                        }
                    );
                }
            }

            return mockServiceCategory;
        });

    let updatedMockService: Permission[] = [];
    if (data && permissionData) {
        updatedMockService = updateMockService(permissionData, data.permissions);
    } else if (permissionData) {
        updatedMockService = permissionData;
    }

    const partnerOptions = (partnerData || []).map(d => ({
        oValue: d.value === null ? 'Default' : Number(d.value),
        oName: d.label,
    }));
    if (
        data?.registeredBy &&
        !partnerOptions.some(o => o.oValue === Number(data.registeredBy))
    ) {
        partnerOptions.unshift({
            oValue: Number(data.registeredBy),
            oName: data.partnerName ?? 'N/A',
        });
    }
    return (
        <Formik
            initialValues={{
                id: data?.id,
                registeredBy: data?.registeredBy ? Number(data?.registeredBy) : 'Default',
                permissions: updatedMockService,
            }}
            onSubmit={async values => {
                let res: any;
                if (data) {
                    res = await updateRoleApi({
                        ...values,
                        registeredBy:
                            values.registeredBy && values.registeredBy !== 'Default' ? Number(values.registeredBy) : null,
                    });
                } else {
                    res = await createNewRoles({
                        ...values,
                    });
                }
                if (res.status === true) {
                    setRefresh(true);
                    if (data)
                        dispatch(
                            showToast({
                                description: res.message,
                                variant: 'success',
                            })
                        );
                    else
                        dispatch(
                            showToast({
                                description: res.message,
                                variant: 'success',
                            })
                        );
                    handleCancel();
                }
                if (res.status === false) {
                    dispatch(
                        showToast({
                            description: `${res.message}`,
                            variant: 'error',
                        })
                    );
                }
            }}
            validationSchema={rolesSchema}
            enableReinitialize
        >
            {({ values, handleSubmit, setFieldValue }) => {
                const onClickSubmit: React.MouseEventHandler<HTMLElement> = e => {
                    e.preventDefault();
                    handleSubmit();
                };
                const updateParentAccess = (permissions: Permission[], index: number) =>
                    permissions.map((permission, i) => {
                        if (i === index) {
                            if (permission.subServices && permission.subServices.length > 0) {
                                // Check if any subService hasAccess is true
                                const anySubServiceAccess = permission.subServices.some(
                                    subService => subService.hasAccess
                                );

                                // Set parent's hasAccess based on subServices
                                permission.hasAccess = anySubServiceAccess;
                                return setFieldValue(
                                    `permissions[${index}].hasAccess`,
                                    permission.hasAccess
                                );
                            }
                        }
                        return permission;
                    });
                const disablePermissionAndSubServices = (
                    permissions: Permission[],
                    index: number
                ) =>
                    permissions.map((permission, i) => {
                        if (i === index) {
                            // Set the permission's `hasAccess` to false
                            permission.hasAccess = false;

                            // If there are subServices, update their `hasAccess` as well
                            if (permission.subServices && permission.subServices.length > 0) {
                                const subService = permission.subServices.map(item => {
                                    if (item.hasAccess) {
                                        return { ...item, hasAccess: false };
                                    }
                                    return item;
                                });
                                // Update the subServices in the form state
                                setFieldValue(`permissions[${index}].subServices`, subService);
                            }

                            // Update the permission's `hasAccess` in the form state
                            return setFieldValue(
                                `permissions[${index}].hasAccess`,
                                permission.hasAccess
                            );
                        }
                        return permission;
                    });
                return (
                    <Modal
                        width={1000}
                        centered
                        title={data?.id ? 'Edit Partner Permissions' : 'Add Partner Permissions'}
                        footer={[
                            <Flex className="w-full " justify="flex-end" gap={10} key="">
                                <Button
                                    key="submit"
                                    type="primary"
                                    danger
                                    loading={isloading}
                                    onClick={onClickSubmit}
                                    className="px-5"
                                >
                                    Submit
                                </Button>
                                <Button
                                    key="back"
                                    onClick={() => {
                                        handleCancel();
                                    }}
                                    className="px-5"
                                >
                                    Cancel
                                </Button>
                            </Flex>,
                        ]}
                        open={open}
                        onCancel={handleCancel}
                    >
                        {updatedMockService.length > 0 ? (
                            <>
                                {partnerData ? (
                                    <CustomSelectSearch
                                        name="registeredBy"
                                        options={partnerOptions}
                                        placeholder=""
                                        label="Partner"
                                        isRequired
                                    />
                                ) : (
                                    <Skeleton.Input active block />
                                )}
                                <Typography.Title level={5} className="pb-5">
                                    Permissions
                                </Typography.Title>
                                {values.permissions?.map(
                                    (permission, index) => (
                                            <div key={index}>
                                                <SwitchInput
                                                    labelClasses="text-sm text-end font-normal"
                                                    name={`permissions[${index}].hasAccess`}
                                                    label={toTitleCase(permission.label)}
                                                    onChange={checked => {
                                                        if (permission?.subServices?.length > 0) {
                                                            const updatedVal = values.permissions[
                                                                index
                                                            ].subServices.some(
                                                                subService => subService.hasAccess
                                                            );
                                                            if (!checked) {
                                                                disablePermissionAndSubServices(
                                                                    values.permissions,
                                                                    index
                                                                );
                                                            }
                                                            if (!updatedVal && checked) {
                                                                setFieldValue(
                                                                    `permissions[${index}].hasAccess`,
                                                                    false
                                                                );
                                                                dispatch(
                                                                    showToast({
                                                                        description:
                                                                            'Please enable at least one sub-service to activate this service',
                                                                        variant: 'warning',
                                                                    })
                                                                );
                                                            } else {
                                                                setFieldValue(
                                                                    `permissions[${index}].hasAccess`,
                                                                    checked
                                                                );
                                                            }
                                                        } else {
                                                            setFieldValue(
                                                                `permissions[${index}].hasAccess`,
                                                                checked
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Row>
                                                    {permission?.subServices?.map(
                                                        (service, serviceIndex) => (
                                                            <Col
                                                                xs={24}
                                                                sm={12}
                                                                md={6}
                                                                key={serviceIndex}
                                                            >
                                                                <CheckboxInput
                                                                    key={serviceIndex}
                                                                    name={`permissions[${index}].subServices[${serviceIndex}].hasAccess`}
                                                                    children={
                                                                        <Typography.Text>
                                                                            {toTitleCase(
                                                                                service.label
                                                                            )}
                                                                        </Typography.Text>
                                                                    }
                                                                    onChange={checked => {
                                                                        // Update the form values
                                                                        const updatedVal =
                                                                            values.permissions;
                                                                        updatedVal[
                                                                            index
                                                                        ].subServices[
                                                                            serviceIndex
                                                                        ].hasAccess =
                                                                            checked.target.checked;
                                                                        updateParentAccess(
                                                                            values.permissions,
                                                                            index
                                                                        );
                                                                    }}
                                                                    isRequired
                                                                />
                                                            </Col>
                                                        )
                                                    )}
                                                </Row>
                                            </div>
                                        )
                                )}
                            </>
                        ) : (
                            <Skeleton active paragraph={{ rows: 10 }} />
                        )}
                    </Modal>
                );
            }}
        </Formik>
    );
};

export default RoleModal;
