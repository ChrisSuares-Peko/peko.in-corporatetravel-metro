import { Card, Col, Flex, Radio, Row, Skeleton, Typography } from 'antd';
import { Content } from 'antd/es/layout/layout';
import dayjs, { Dayjs } from 'dayjs';
import { Form, Formik } from 'formik';
import { useDispatch } from 'react-redux';

import DatePickerInput from '@components/atomic/inputs/DatePickerInput';
import SelectInputWithSearch from '@components/atomic/inputs/SelectInputWithSearch';
import TextInput from '@components/atomic/inputs/TextInput';
import { useAppSelector } from '@src/hooks/store';
import useServiceAccess from '@src/hooks/useSubscriptionCheck';
import { showToast } from '@src/slices/apiSlice';
import { accessKeys } from '@utils/accessKeys';

import { userDetailsSchema } from '../../schema';
import { TotalFormCount, addPassengersData, addUserData } from '../../slices/getHotelSlice';
import { employeeTypes } from '../../types/types';

const { Text } = Typography;

type Props = {
    passengerType: string;
    passengerKey: number;
    roomIndex: number;
    roomKey: string;
    formRef: React.MutableRefObject<any>;
    totalForm: string[];
    setTotalForm: any;
    childAge?: number;
    totalPassengers?: any;
    passengerCount?: number;
    data: employeeTypes[];
    isLoading?: boolean;
     generateEmployeesDropdown: (data: employeeTypes[]) => {
        fullName: string;
        value: string;
        label: string;
        dateOfBirth: string;
        gender: string;
        mobileNo: string;
        personalEmail: string;
        passportExpiryDate: string;
    }[];
    userdetails: any;
    setEnteredForm: any;
    passengervalue: any;
};

const DetailBookings = ({
    passengerType,
    passengerKey,
    roomIndex,
    roomKey,
    formRef,
    totalForm,
    setTotalForm,
    childAge,
    totalPassengers,
    passengerCount,
    data,
    generateEmployeesDropdown,
    userdetails,
    isLoading,
    setEnteredForm,
    passengervalue,
}: Props) => {
    const dispatch = useDispatch();
    const ageChild = childAge as number;

    const formKey = `${roomIndex}-${passengerType}-${passengerKey}`;

    const {  prebookResponse } = useAppSelector(
        state => state.reducer.hotels
    );

    const handleFormSubmit = async (submitForm: () => void) => {
        await submitForm();
    };

    let minDate: Dayjs | undefined;
    let maxDate: Dayjs | undefined;

    if (passengerType === 'adult') {
        minDate = undefined;
        maxDate = dayjs().subtract(18, 'year');
    }
    if (passengerType === 'child') {
        minDate = dayjs()
            .subtract(ageChild + 1, 'year')
            .add(1, 'day');
        maxDate = dayjs().subtract(ageChild, 'year');
    }

    const currentPassenger = userdetails
        ?.find((detail: any) => detail.roomIndex === roomIndex)
        ?.passengers?.find((passenger: any) => passenger.passengerKey === passengerKey);

    const isPassportRequired = prebookResponse.ValidationInfo.PassportMandatory;
    const isPanRequired = prebookResponse.ValidationInfo.PanMandatory;
   
     const isPurchased = useServiceAccess(accessKeys.payroll);

    return (
        <Content className="">
            <Card
                bodyStyle={{ padding: 25, border: '0' }}
                className={`rounded-md border border-gray-200 ${
                    roomIndex === 1 && passengerKey === 1 ? '' : 'my-4'
                }`}
            >
                <Text className="font-medium text-lg">
                    {passengerType === 'adult' ? 'Adult' : 'Child'} Guest {passengervalue}
                </Text>
                <Row className="mt-3">
                    <Formik
                        key={passengerKey}
                        initialValues={{
                            employee: '',
                            firstName: currentPassenger?.FirstName || '',
                            lastName: currentPassenger?.LastName || '',
                            dob: currentPassenger?.dob || '',
                            email: currentPassenger?.Email || '',
                            passengerType,
                            gender:
                                // eslint-disable-next-line no-nested-ternary
                                currentPassenger?.Title === 'Mr'
                                    ? 'M'
                                    : currentPassenger?.Title === 'Mrs'
                                      ? 'F'
                                      : 'M',
                            phone: currentPassenger?.Phoneno || '',
                            meal: currentPassenger?.mealPreference || false,
                            pan: currentPassenger?.PAN || null,
                            passportNo: currentPassenger?.PassportNo || null,
                            passportIssueDate: null,
                            passportExpDate: null,
                            isPassportRequired: prebookResponse.ValidationInfo.PassportMandatory,
                            isPanRequired: prebookResponse.ValidationInfo.PanMandatory,
                        }}
                        innerRef={formRef}
                        validationSchema={userDetailsSchema(
                            passengerType === 'adult' && passengerKey === 1
                        )}
                        validateOnChange
                        validateOnBlur
                        onSubmit={(values, { setSubmitting }) => {
                            const bookingRoom: any = [];
                            const today = new Date();
                            const dob = new Date(values.dob);
                            const age = today.getFullYear() - dob.getFullYear();
                          

                            if (passengerType === 'adult') {
                              
                                if (age < 12) {
                                    dispatch(
                                        showToast({
                                            description:
                                                'Age of adult guest should be greater than 12',
                                            variant: 'error',
                                        })
                                    );
                                }
                            } else if (passengerType === 'child') {
                               
                                if (age > 12) {
                                    dispatch(
                                        showToast({
                                            description: 'Age of child guest should less than 12',
                                            variant: 'error',
                                        })
                                    );
                                }
                            }

                            const passengerData = {
                                passengerKey,
                                Title: values.gender === 'M' ? 'Mr' : 'Mrs',
                                FirstName: values?.firstName || '',
                                MiddleName: '',
                                LastName: values?.lastName,
                                Email: values.email,
                                PaxType: passengerType === 'adult' ? 1 : 2,
                                LeadPassenger:
                                    passengerType === 'adult' &&
                                    passengerKey === 1 &&
                                    roomIndex === 1,
                                Age: age,
                                PassportNo: values.passportNo || null,
                                PassportIssueDate: values.passportIssueDate || null,
                                PassportExpDate: values.passportExpDate || null,
                                Phoneno: values.phone || null,
                                PaxId: 0,
                                GSTCompanyAddress: null,
                                GSTCompanyContactNumber: null,
                                GSTCompanyName: null,
                                GSTNumber: null,
                                GSTCompanyEmail: null,
                                PAN: values.pan || null,
                                dob: values?.dob?.split('T')[0] || null,
                            };

                            if (
                                values.firstName &&
                                values.lastName &&
                                values.dob &&
                                // values.email &&
                                values.gender
                            ) {
                                if (!totalForm.includes(formKey)) {
                                    setTotalForm((prev: any) => {
                                        const updatedForms = [...prev, formKey];

                                        dispatch(TotalFormCount(updatedForms));
                                        return updatedForms;
                                    });

                                    setEnteredForm((prev: any) => [...prev, formKey]);
                                }
                            }

                            const existingPassengerIndex = bookingRoom.findIndex(
                                (passenger: any) =>
                                    Number(passenger.passengerKey) === Number(passengerKey)
                            );

                            if (existingPassengerIndex !== -1) {
                                bookingRoom[existingPassengerIndex] = {
                                    ...bookingRoom[existingPassengerIndex],
                                    ...passengerData,
                                };
                            } else {
                                bookingRoom.push(passengerData);
                            }

                            dispatch(addPassengersData(bookingRoom));
                            dispatch(
                                addUserData({ roomIndex, roomKey, userdetails: passengerData })
                            );
                            setSubmitting(false);
                        }}
                    >
                        {({
                            handleSubmit,
                            values,
                            handleChange,
                            setFieldValue,
                            submitForm,
                            isSubmitting,
                            touched,
                            errors,
                            setFieldTouched,
                            validateField,
                            resetForm
                        }) => (
                            <Form onSubmit={handleSubmit} className="w-full" id="hotelsbtn">
                                 {passengerType === 'adult' && (
                                    <Row gutter={[30, 0]}>
                                        <Col span={24} md={12} xl={12} xxl={10}>
                                            {isLoading ? (
                                                <Col className="my-5">
                                                    <Skeleton.Input active />
                                                </Col>
                                            ) : (
                                               data.length > 0 && (
                                                    <Flex vertical gap="small">
                                                        <Text>Select Employee</Text>
                                                        <SelectInputWithSearch
                                                            name="employee"
                                                            options={
                                                                generateEmployeesDropdown(data) ||
                                                                []
                                                            }
                                                            placeholder="Select employee"
                                                            isRequired
                                                            isDisabled={!isPurchased}
                                                            handleChange={async eid => {
                                                                if (!eid) {
                                                                    resetForm();
                                                                    return;
                                                                }
                                                                const employeeData =
                                                                    generateEmployeesDropdown(
                                                                        data
                                                                    ).find(
                                                                        emp => emp.value === eid
                                                                    );
                                                                if (employeeData) {
                                                                    const nameParts =
                                                                        employeeData?.fullName.split(
                                                                            ' '
                                                                        );
                                                                    const firstName = nameParts[0];
                                                                    const lastName =
                                                                        nameParts.length > 1
                                                                            ? nameParts
                                                                                  .slice(1)
                                                                                  .join(' ')
                                                                            : '';

                                                                    await setFieldValue(
                                                                        'firstName',
                                                                        firstName
                                                                    );
                                                                    await setFieldValue(
                                                                        'lastName',
                                                                        lastName
                                                                    );
                                                                    await setFieldValue(
                                                                        'gender',
                                                                        employeeData.gender ===
                                                                            'MALE'
                                                                            ? 'M'
                                                                            : 'F'
                                                                    );
                                                                    await setFieldValue(
                                                                        'dob',
                                                                        employeeData.dateOfBirth
                                                                    );

                                                                    // Submit the form after setting the values
                                                                    handleFormSubmit(submitForm);
                                                                }
                                                            }}
                                                        />
                                                    </Flex>
                                                )
                                            )}
                                        </Col>
                                    </Row>
                                )}
                                <Row>
                                    <Radio.Group
                                        value={values.gender}
                                        onChange={e => handleChange('gender')(e.target.value)}
                                    >
                                        <Radio value="M">Male</Radio>
                                        <Radio value="F" className="ml-2">
                                            Female
                                        </Radio>
                                    </Radio.Group>
                                </Row>
                                <Row>
                                    <Col
                                        className="mt-3 md:mr-10 w-full"
                                        md={10}
                                        // onBlur={() => handleFormSubmit(submitForm)}
                                    >
                                        <Flex vertical gap="small">
                                            <Text>
                                                <Text className="text-red-500 me-1">*</Text>
                                                First Name
                                            </Text>
                                            <TextInput
                                                name="firstName"
                                                isRequired
                                                placeholder="First Name"
                                                type="text"
                                                allowAlphabetsAndSpaceOnly
                                                maxLength={25}
                                                handleChange={value => {
                                                    if (value) {
                                                        const sanitizedValue = value.replace(
                                                            /[^a-zA-Z0-9 ]/g,
                                                            ''
                                                        );

                                                        setFieldValue('firstName', sanitizedValue);
                                                        setTimeout(() => {
                                                            validateField('firstName');
                                                        }, 0);
                                                    } else {
                                                        setFieldValue('firstName', '');

                                                        setTimeout(() => {
                                                            validateField('firstName');
                                                        }, 0);
                                                    }
                                                }}
                                            />
                                        </Flex>
                                    </Col>
                                    <Col
                                        className="md:mr-10 mt-3 w-full"
                                        md={10}
                                        // onBlur={() => handleFormSubmit(submitForm)}
                                    >
                                        <Flex vertical gap="small">
                                            <Text>
                                                <Text className="text-red-500 me-1">*</Text>
                                                Last Name
                                            </Text>
                                            <TextInput
                                                name="lastName"
                                                isRequired
                                                placeholder="Last Name"
                                                type="text"
                                                allowAlphabetsAndSpaceOnly
                                                maxLength={25}
                                                handleChange={value => {
                                                    if (value) {
                                                        const sanitizedValue = value.replace(
                                                            /[^a-zA-Z0-9 ]/g,
                                                            ''
                                                        );

                                                        setFieldValue('lastName', sanitizedValue);
                                                        setTimeout(() => {
                                                            validateField('lastName');
                                                        }, 0);
                                                    } else {
                                                        setFieldValue('lastName', '');

                                                        setTimeout(() => {
                                                            validateField('lastName');
                                                        }, 0);
                                                    }
                                                }}
                                            />
                                        </Flex>
                                    </Col>
                                    <Col
                                        className="md:mr-10 w-full"
                                        md={10}
                                        // onBlur={() => handleFormSubmit(submitForm)}
                                    >
                                        <Flex vertical gap="small">
                                            <Text>
                                                <Text className="text-red-500 me-1">*</Text>
                                                Date of Birth
                                            </Text>
                                            <DatePickerInput
                                                placeholder="Select Date"
                                                isRequired
                                                name="dob"
                                                needConfirm={false}
                                                classes="w-full"
                                                maxDate={maxDate}
                                                minDate={minDate}
                                                handleChange={value => {
                                                    if (value) {
                                                        setFieldValue('dob', value);
                                                        setTimeout(() => {
                                                            validateField('dob');
                                                        }, 0);
                                                    } else {
                                                        setFieldValue('dob', '');

                                                        setTimeout(() => {
                                                            validateField('dob');
                                                        }, 0);
                                                    }
                                                }}
                                            />
                                        </Flex>
                                    </Col>
                                    {isPassportRequired && (
                                        <Col className="md:mr-10 w-full" md={10}>
                                            <Flex vertical gap="small">
                                                <Typography.Text>
                                                    {isPassportRequired && (
                                                        <Typography.Text className="text-red-500 me-1">
                                                            *
                                                        </Typography.Text>
                                                    )}
                                                    Passport No
                                                </Typography.Text>
                                                <TextInput
                                                    name="passportNo"
                                                    isRequired
                                                    allowAlphabetsAndNumbersOnly
                                                    placeholder="Passport No"
                                                    type="text"
                                                    handleChange={value => {
                                                        if (value) {
                                                            setFieldValue('passportNo', value);
                                                            setTimeout(() => {
                                                                validateField('passportNo');
                                                            }, 0);
                                                        } else {
                                                            setFieldValue('passportNo', '');

                                                            setTimeout(() => {
                                                                validateField('passportNo');
                                                            }, 0);
                                                        }
                                                    }}
                                                />
                                            </Flex>
                                        </Col>
                                    )}

                                    {isPassportRequired && (
                                        <Col className="md:mr-10 w-full" md={10}>
                                            <Flex vertical gap="small">
                                                <Typography.Text>
                                                    {isPassportRequired && (
                                                        <Typography.Text className="text-red-500 me-1">
                                                            *
                                                        </Typography.Text>
                                                    )}
                                                    Passport Issue Date
                                                </Typography.Text>
                                                <DatePickerInput
                                                    placeholder="Select Date"
                                                    name="passportIssueDate"
                                                    classes="w-full"
                                                    maxDate={dayjs()}
                                                    isRequired
                                                    needConfirm={false}
                                                    handleChange={value => {
                                                        if (value) {
                                                            setFieldValue(
                                                                'passportIssueDate',
                                                                value
                                                            );
                                                            setTimeout(() => {
                                                                validateField('passportIssueDate');
                                                            }, 0);
                                                        } else {
                                                            setFieldValue('passportIssueDate', '');

                                                            setTimeout(() => {
                                                                validateField('passportIssueDate');
                                                            }, 0);
                                                        }
                                                    }}
                                                />
                                            </Flex>
                                        </Col>
                                    )}

                                    {isPassportRequired && (
                                        <Col className="md:mr-10 w-full" md={10}>
                                            <Flex vertical gap="small">
                                                <Typography.Text>
                                                    {isPassportRequired && (
                                                        <Typography.Text className="text-red-500 me-1">
                                                            *
                                                        </Typography.Text>
                                                    )}
                                                    Passport Expiry Date
                                                </Typography.Text>
                                                <DatePickerInput
                                                    placeholder="Select Date"
                                                    name="passportExpDate"
                                                    classes="w-full"
                                                    minDate={dayjs(new Date())}
                                                    isRequired
                                                    needConfirm={false}
                                                    handleChange={value => {
                                                        if (value) {
                                                            setFieldValue('passportExpDate', value);
                                                            setTimeout(() => {
                                                                validateField('passportExpDate');
                                                            }, 0);
                                                        } else {
                                                            setFieldValue('passportExpDate', '');

                                                            setTimeout(() => {
                                                                validateField('passportExpDate');
                                                            }, 0);
                                                        }
                                                    }}
                                                />
                                            </Flex>
                                        </Col>
                                    )}
                                    {isPanRequired && (
                                        <Col className="md:mr-10 w-full" md={10}>
                                            <Flex vertical gap="small">
                                                <Typography.Text>
                                                    {isPanRequired && (
                                                        <Typography.Text className="text-red-500 me-1">
                                                            *
                                                        </Typography.Text>
                                                    )}
                                                    PAN
                                                </Typography.Text>
                                                <TextInput
                                                    name="pan"
                                                    isRequired
                                                    allowAlphabetsAndNumbersOnly
                                                    placeholder="PAN"
                                                    type="text"
                                                    allowUpperCaseOnly
                                                    maxLength={10}
                                                    handleChange={value => {
                                                        if (value) {
                                                            setFieldValue('pan', value);
                                                            setTimeout(() => {
                                                                validateField('pan');
                                                            }, 0);
                                                        } else {
                                                            setFieldValue('pan', '');

                                                            setTimeout(() => {
                                                                validateField('pan');
                                                            }, 0);
                                                        }
                                                    }}
                                                />
                                            </Flex>
                                        </Col>
                                    )}

                                    {/* <Col
                                        className="md:mr-10 w-full"
                                        md={10}
                                        // onBlur={() => handleFormSubmit(submitForm)}
                                    >
                                        <Flex vertical gap="small">
                                            <Text>
                                                <Text className="text-red-500 me-1">*</Text>
                                                Email ID
                                            </Text>
                                            <TextInput
                                                name="email"
                                                // isRequired
                                                placeholder="Email ID"
                                                type="text"
                                                maxLength={50}
                                            />
                                        </Flex>
                                    </Col> */}
                                    {/* <Col
                                        className="md:mr-10 w-full"
                                        md={10}
                                        // onBlur={() => handleFormSubmit(submitForm)}
                                    >
                                        <Flex vertical gap="small">
                                            <Text>
                                                <Text className="text-red-500 me-1">*</Text>
                                                Mobile Number
                                            </Text>
                                            <TextInput
                                                name="phone"
                                                placeholder="Mobile Number"
                                                type="text"
                                                // isRequired
                                                allowNumbersOnly
                                                maxLength={10}
                                                minLength={10}
                                            />
                                        </Flex>
                                    </Col> */}
                                </Row>
                            </Form>
                        )}
                    </Formik>
                </Row>
            </Card>
        </Content>
    );
};

export default DetailBookings;
