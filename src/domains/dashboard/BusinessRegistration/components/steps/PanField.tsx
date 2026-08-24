import { useState } from 'react';

import { CheckCircleFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { getIn, useFormikContext } from 'formik';

import TextInput from '@components/atomic/inputs/TextInput';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { verifyPan } from '../../api';
import { PAN_REGEX, parsePanHolder } from '../../utils/pan';

interface PanFieldProps {
    namePrefix: string;
}

// PAN input with IndiaFilings verification. On "Verify" the holder's name fields
// (incl. the disabled "Full Name") are auto-filled from the vendor response.
const PanField = ({ namePrefix }: PanFieldProps) => {
    const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();
    const dispatch = useAppDispatch();
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [verifying, setVerifying] = useState(false);

    const pan = String(getIn(values, `${namePrefix}.pan`) ?? '').toUpperCase();
    const verifiedPan = String(getIn(values, `${namePrefix}.verifiedPan`) ?? '').toUpperCase();
    // Verified only while the entered PAN matches the one we verified — editing
    // the PAN clears it and forces a re-verify (schema blocks Next until then).
    const isVerified = Boolean(pan) && pan === verifiedPan;
    const set = (field: string, val?: string) => {
        if (val) setFieldValue(`${namePrefix}.${field}`, val);
    };

    const handleVerify = async () => {
        if (!PAN_REGEX.test(pan)) {
            dispatch(showToast({ description: 'Enter a valid 10-character PAN', variant: 'error' }));
            return;
        }
        setVerifying(true);
        const res = await verifyPan({ userId: Number(userId), userType: userType ?? '', pan });
        setVerifying(false);
        const holder = res ? parsePanHolder(res) : null;
        if (!holder) {
            dispatch(showToast({ description: 'Could not verify this PAN', variant: 'error' }));
            return;
        }
        set('fullName', holder.fullName);
        set('firstName', holder.firstName);
        set('middleName', holder.middleName);
        set('lastName', holder.lastName);
        set('fathersName', holder.fathersName);
        setFieldValue(`${namePrefix}.verifiedPan`, pan);
        dispatch(
            showToast({
                description: holder.fullName ? `PAN verified — ${holder.fullName}` : 'PAN verified',
                variant: 'success',
            })
        );
    };

    return (
        <TextInput
            label="PAN"
            name={`${namePrefix}.pan`}
            type="text"
            placeholder="Enter PAN"
            isRequired
            size="large"
            maxLength={10}
            convertToUppercase
            restrictPanGstFormat
            suffix={isVerified ? <CheckCircleFilled className="text-[#52c41a]" /> : null}
            addonAfter={
                <Button
                    type="text"
                    size="small"
                    loading={verifying}
                    disabled={isVerified}
                    onClick={handleVerify}
                    className="!text-[#ff4f4f] !font-medium !px-2"
                >
                    {isVerified ? 'Verified' : 'Verify'}
                </Button>
            }
        />
    );
};

export default PanField;
