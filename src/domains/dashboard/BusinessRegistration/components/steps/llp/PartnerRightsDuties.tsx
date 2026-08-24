import { Checkbox, Typography } from 'antd';
import { useFormikContext } from 'formik';

import { LLP_PARTNER_DUTIES, LLP_PARTNER_RIGHTS } from '../../../utils/llp';

const { Text } = Typography;

interface AgreementValues {
    llpAgreement?: { rights?: string[]; duties?: string[] };
}

const Checklist = ({
    title,
    options,
    value,
    onChange,
}: {
    title: string;
    options: string[];
    value: string[];
    onChange: (v: string[]) => void;
}) => (
    <div className="flex flex-col gap-2">
        <Text className="!text-[14px] !font-medium !text-[#1e293b]">
            {title}
            <span className="text-[#ff4f4f]"> *</span>
        </Text>
        <div className="border border-[#e4e4e7] rounded-[12px] p-4">
            <Checkbox.Group
                value={value}
                onChange={vals => onChange(vals as string[])}
                className="!flex !flex-col !gap-3"
            >
                {options.map(option => (
                    <Checkbox key={option} value={option}>
                        <span className="text-[13px] text-[#475569]">{option}</span>
                    </Checkbox>
                ))}
            </Checkbox.Group>
        </div>
    </div>
);

// Rights & duties checklists for the standard LLP Agreement (Figma 1854:39775).
const PartnerRightsDuties = () => {
    const { values, setFieldValue } = useFormikContext<AgreementValues>();
    const rights = values.llpAgreement?.rights || [];
    const duties = values.llpAgreement?.duties || [];

    return (
        <>
            <Checklist
                title="Rights of Partners"
                options={LLP_PARTNER_RIGHTS}
                value={rights}
                onChange={v => setFieldValue('llpAgreement.rights', v)}
            />
            <Checklist
                title="Duties of Partners"
                options={LLP_PARTNER_DUTIES}
                value={duties}
                onChange={v => setFieldValue('llpAgreement.duties', v)}
            />
        </>
    );
};

export default PartnerRightsDuties;
