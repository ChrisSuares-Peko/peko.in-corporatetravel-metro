import { useState } from 'react';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Row, Typography } from 'antd';
import { useFormikContext } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { checkBusinessName } from '../../../api';
import { EntityType } from '../../../types';
import { ENTITY_NAME_SUFFIX, INDIA_STATES, withEntitySuffix } from '../../../utils/data';

const { Text } = Typography;

interface TradeNameValues {
    entityType?: EntityType;
    proposedNames?: { first?: string; second?: string; third?: string; fourth?: string };
}

const NAME_KEYS = ['first', 'second', 'third', 'fourth'] as const;

// The MCA search returns the list of similar registered names.
const matchCount = (res: unknown) => {
    const list = (res as { data?: unknown })?.data ?? res;
    return Array.isArray(list) ? list.length : 0;
};

// "Proposed Trade Name" (Figma 1819:22940) — name choices + MCA availability check.
const ProposedTradeName = () => {
    const { values } = useFormikContext<TradeNameValues>();
    const dispatch = useAppDispatch();
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [checking, setChecking] = useState(false);
    // The first choice is mandatory — availability check is gated on it.
    const hasFirstChoice = Boolean(String(values.proposedNames?.first ?? '').trim());

    // Statutory suffix (e.g. "Private Limited", "(OPC) Private Limited") —
    // rendered as static grey text inside the inputs; appended automatically,
    // never typed by the user.
    const nameSuffix = values.entityType ? ENTITY_NAME_SUFFIX[values.entityType] : undefined;
    const suffixNode = nameSuffix ? (
        <span className="text-[#9ca3af] text-[14px] whitespace-nowrap select-none">{nameSuffix}</span>
    ) : undefined;

    // Checks every entered choice (not just the first) — one MCA search per
    // name, using the FULL legal name (suffix included).
    const handleCheck = async () => {
        // Safety — the button is disabled until the first choice is entered.
        if (!hasFirstChoice) return;
        const names = NAME_KEYS
            .map(key => withEntitySuffix(values.proposedNames?.[key], values.entityType))
            .filter(Boolean);
        setChecking(true);
        let anyFailed = false;
        const results = await Promise.all(
            names.map(async name => {
                const res = await checkBusinessName({ userId: Number(userId), userType: userType ?? '', name });
                if (res === false) {
                    anyFailed = true;
                    return `“${name}”: could not check`;
                }
                const count = matchCount(res);
                return count
                    ? `“${name}”: ${count} similar name${count > 1 ? 's' : ''} found on MCA`
                    : `“${name}”: no similar names found`;
            })
        );
        setChecking(false);
        dispatch(
            showToast({
                description: results.join(' • '),
                variant: anyFailed ? 'error' : 'success',
            })
        );
    };

    return (
        <div className="flex flex-col gap-3">
            <Text className="!text-[18px] !font-semibold !text-[#1e293b] !leading-[26px]">
                Proposed Trade Name
            </Text>
            <div className="border border-[#e4e4e7] rounded-[24px] p-6 flex flex-col gap-4">
                <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                        <TextInput label="First choice" name="proposedNames.first" type="text" placeholder="Enter a Name" suffix={suffixNode} isRequired size="large" />
                    </Col>
                    <Col xs={24} md={12}>
                        <TextInput label="Second choice (optional)" name="proposedNames.second" type="text" placeholder="Enter a Name" suffix={suffixNode} size="large" />
                    </Col>
                    <Col xs={24} md={12}>
                        <TextInput label="Third choice (optional)" name="proposedNames.third" type="text" placeholder="Enter a Name" suffix={suffixNode} size="large" />
                    </Col>
                    <Col xs={24} md={12}>
                        <TextInput label="Fourth choice (optional)" name="proposedNames.fourth" type="text" placeholder="Enter a Name" suffix={suffixNode} size="large" />
                    </Col>
                </Row>

                <div className="flex justify-end items-center gap-3">
                    {!hasFirstChoice && (
                        <Text className="!text-[12px] !text-[#94a3b8]">
                            Enter the first-choice name to check availability
                        </Text>
                    )}
                    <Button
                        loading={checking}
                        disabled={!hasFirstChoice}
                        onClick={handleCheck}
                        className={`!h-[40px] !px-4 !text-[14px] !font-medium !rounded-[8px] transition-colors ${
                            hasFirstChoice
                                ? '!border-[#ff4f4f] !text-[#ff4f4f] hover:!bg-[#fff5f5]'
                                : '!border-[#e4e4e7] !text-[#cbd5e1] !cursor-not-allowed'
                        }`}
                    >
                        Check Availability
                    </Button>
                </div>

                {/* Compliance disclaimer — exact wording provided by the vendor (23-07). */}
                <div className="bg-[#fffcec] flex gap-2 items-start px-3 py-[10px] rounded-[8px]">
                    <ExclamationCircleOutlined className="text-[#ffa940] mt-[2px]" style={{ fontSize: 16 }} />
                    <Text className="!text-[14px] !text-[rgba(0,0,0,0.85)] !leading-[22px]">
                        The company name availability shown is indicative only and does not guarantee
                        approval. Final approval is subject to the Ministry of Corporate Affairs (MCA)
                        during incorporation. As per MCA naming guidelines, the proposed name should
                        generally reflect the company&apos;s main business activity and must not be
                        identical or too similar to existing company or LLP names, registered
                        trademarks, offensive or undesirable words, names suggesting government
                        patronage, religious or national significance, or other restricted or
                        well-known names.
                    </Text>
                </div>

                <div className="h-px w-full bg-[#ebebeb]" />

                <SelectInput
                    label="State of Incorporation"
                    name="stateOfIncorporation"
                    options={INDIA_STATES}
                    placeholder="Select State"
                    showSearch
                    size="large"
                />
                <Text className="!text-[12px] !text-[rgba(124,124,124,0.85)] !leading-[22px] -mt-2">
                    This can differ from the promoter&apos;s state.
                </Text>
            </div>
        </div>
    );
};

export default ProposedTradeName;
