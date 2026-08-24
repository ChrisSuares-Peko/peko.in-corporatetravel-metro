import { useEffect, useMemo, useState } from 'react';

import { Typography } from 'antd';
import { useFormikContext } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextAreaInput from '@components/atomic/inputs/TextAreaInput';
import { useAppSelector } from '@src/hooks/store';

import SelectedActivityCard from './SelectedActivityCard';
import { getBusinessActivities } from '../../../api';
import { normalizeNic, NicOption } from '../../../utils/nic';
import FieldError from '../../FieldError';

const { Text } = Typography;

interface ActivityValues {
    businessActivities?: NicOption[];
    activitySearch?: string;
}

interface BusinessActivityProps {
    // Max Level-3 activities (3 for most entities, 2 for OPC).
    maxActivities?: number;
}

// "Business Activity" (Figma 1848:27738) — NIC-2008 Level-3 picker. Selecting an
// activity appends a card with its auto-mapped Level 2 & Level 1, up to the max.
const BusinessActivity = ({ maxActivities = 3 }: BusinessActivityProps) => {
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const { values, setFieldValue } = useFormikContext<ActivityValues>();
    const [nicOptions, setNicOptions] = useState<NicOption[]>([]);

    const selected = useMemo(() => values.businessActivities || [], [values.businessActivities]);
    const atMax = selected.length >= maxActivities;

    useEffect(() => {
        let active = true;
        getBusinessActivities({ userId: Number(userId), userType: userType ?? '' }).then(res => {
            if (active && res) setNicOptions(normalizeNic(res));
        });
        return () => {
            active = false;
        };
    }, [userId, userType]);

    // Hide already-selected activities from the picker to avoid duplicates.
    const options = useMemo(() => {
        const chosen = new Set(selected.map(a => a.code));
        return nicOptions
            .filter(o => !chosen.has(o.code))
            .map(o => ({ label: `${o.code} — ${o.label}`, value: o.code }));
    }, [nicOptions, selected]);

    const handleAdd = (code: string) => {
        const opt = nicOptions.find(o => o.code === code);
        setFieldValue('activitySearch', '');
        if (!opt || atMax || selected.some(a => a.code === code)) return;
        setFieldValue('businessActivities', [...selected, opt]);
    };

    const handleRemove = (index: number) => {
        setFieldValue(
            'businessActivities',
            selected.filter((_, i) => i !== index)
        );
    };

    return (
        <div className="flex flex-col gap-3">
            <div>
                <Text className="!block !text-[18px] !font-semibold !text-[#1e293b] !leading-[26px]">
                    Business Activity
                </Text>
                <Text className="!text-[14px] !text-[#475569] !leading-[24px]">
                    Aligned with MCA (NIC-2008). Select up to {maxActivities} Level-3 activities —
                    Level 2 &amp; Level 1 are mapped back automatically.
                </Text>
            </div>
            <div className="border border-[#e4e4e7] rounded-[24px] p-6 flex flex-col gap-6">
                <SelectInput
                    label={
                        <span>
                            Add activity{' '}
                            <span className="text-[#909090]">
                                ({selected.length}/{maxActivities} selected)
                            </span>
                        </span>
                    }
                    name="activitySearch"
                    options={options}
                    placeholder={atMax ? `Maximum ${maxActivities} activities selected` : 'Search activity'}
                    handleChange={handleAdd}
                    isDisabled={atMax}
                    showSearch
                    size="large"
                />

                <FieldError name="businessActivities" />

                {selected.map((activity, i) => (
                    <SelectedActivityCard
                        key={activity.code}
                        activity={activity}
                        index={i + 1}
                        onRemove={() => handleRemove(i)}
                    />
                ))}

                <div className="h-px w-full bg-[#ebebeb]" />

                <TextAreaInput
                    label="Business description (10–1000 characters)"
                    name="businessDescription"
                    placeholder="Describe the main business activity"
                    isRequired
                    minRows={3}
                    maxLength={1000}
                    showCount
                />
            </div>
        </div>
    );
};

export default BusinessActivity;
