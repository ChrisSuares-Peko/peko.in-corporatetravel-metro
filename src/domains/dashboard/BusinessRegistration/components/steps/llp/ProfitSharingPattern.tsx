import { EyeOutlined } from '@ant-design/icons';
import { Switch, Typography } from 'antd';
import { getIn, useFormikContext } from 'formik';

import TextInput from '@components/atomic/inputs/TextInput';

import { shareholdingPeople } from '../../../utils/person';

const { Text } = Typography;

interface Person {
    firstName?: string;
    lastName?: string;
}

const COLS = 'grid grid-cols-[1.2fr_1fr_0.8fr_1fr_0.6fr] gap-2 items-center';

// Profit-sharing table for the LLP Contribution step (Figma 1854:39339). Rows are
// the designated partners; % profit share is computed from contribution amounts.
const ProfitSharingPattern = () => {
    const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();
    const people = shareholdingPeople(values) as Person[];
    const total = people.reduce<number>(
        (sum, _, i) => sum + (Number(getIn(values, `contribution.${i}.amount`)) || 0),
        0
    );

    return (
        <div className="border border-[#e4e4e7] rounded-[16px] overflow-x-auto">
            <div className="min-w-[640px]">
                <div className={`${COLS} bg-[#fafafa] px-4 py-3 text-[13px] font-medium text-[#64748b]`}>
                    <span>Partner Name</span>
                    <span>Contribution Amount (₹)</span>
                    <span>% Profit Share</span>
                    <span>Corporate / Legal Entity</span>
                    <span>Actions</span>
                </div>
                {people.map((person, i) => {
                    const name =
                        [person?.firstName, person?.lastName].filter(Boolean).join(' ') ||
                        `Partner ${i + 1}`;
                    const amount = Number(getIn(values, `contribution.${i}.amount`)) || 0;
                    const pct = total ? Math.round((amount / total) * 100) : 0;
                    const isCorporate = Boolean(getIn(values, `contribution.${i}.isCorporate`));
                    return (
                        <div key={i} className={`${COLS} px-4 py-3 border-t border-[#ebebeb]`}>
                            <Text className="!text-[14px] !text-[#1e293b]">{name}</Text>
                            <div className="pr-2 [&_.ant-form-item]:!mb-0">
                                <TextInput name={`contribution.${i}.amount`} type="text" placeholder="₹ 0" allowNumbersOnly />
                            </div>
                            <Text className="!text-[14px] !text-[#475569]">{pct}%</Text>
                            <div className="flex items-center gap-2">
                                <Switch
                                    size="small"
                                    checked={isCorporate}
                                    onChange={checked => setFieldValue(`contribution.${i}.isCorporate`, checked)}
                                />
                                <Text className="!text-[13px] !text-[#475569]">
                                    {isCorporate ? 'Yes' : 'No'}
                                </Text>
                            </div>
                            <EyeOutlined className="text-[#94a3b8] cursor-pointer" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProfitSharingPattern;
