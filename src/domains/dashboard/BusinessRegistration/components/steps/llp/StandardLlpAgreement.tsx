import { DownloadOutlined } from '@ant-design/icons';
import { Button, Col, Row, Typography } from 'antd';
import { useFormikContext } from 'formik';

import SelectInput from '@components/atomic/inputs/SelectInput';
import TextInput from '@components/atomic/inputs/TextInput';

import PartnerRightsDuties from './PartnerRightsDuties';
import { DISPUTE_METHOD_OPTIONS, MEETING_QUORUM_OPTIONS, VOTING_THRESHOLD_OPTIONS } from '../../../utils/llp';
import { shareholdingPeople } from '../../../utils/person';

const { Text } = Typography;

interface Person {
    firstName?: string;
    lastName?: string;
}

// "Standard LLP Agreement" content (Figma 1854:39775). Partner config is prefilled
// from earlier steps; rights/duties/management/dispute are editable.
const StandardLlpAgreement = () => {
    const { values } = useFormikContext<Record<string, unknown>>();
    const people = shareholdingPeople(values) as Person[];

    return (
        <div className="flex flex-col gap-5">
            {/* Partner configuration */}
            <div className="flex flex-col gap-3">
                <Text className="!text-[16px] !font-semibold !text-[#1e293b]">
                    Partner Configuration
                </Text>
                <div className="[&_.ant-form-item]:!mb-0">
                    <TextInput
                        label="Total Capital Contribution"
                        name="totalContribution"
                        type="text"
                        placeholder="₹100000"
                        allowNumbersOnly
                        size="large"
                    />
                </div>
                <div className="border border-[#e4e4e7] rounded-[12px] divide-y divide-[#ebebeb]">
                    {people.map((person, i) => (
                        <div key={person?.firstName || i} className="flex items-center justify-between px-4 py-3">
                            <Text className="!text-[14px] !text-[#1e293b]">
                                {[person?.firstName, person?.lastName].filter(Boolean).join(' ') ||
                                    `Partner ${i + 1}`}
                            </Text>
                            <span className="bg-[#fff3f3] text-[#ff4f4f] text-[12px] rounded-full px-2 py-[2px]">
                                Designated
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <PartnerRightsDuties />

            {/* Management & meetings */}
            <div className="flex flex-col gap-3">
                <Text className="!text-[16px] !font-semibold !text-[#1e293b]">
                    Management &amp; Meetings
                </Text>
                <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                        <SelectInput label="Meeting Quorum (minimum partners required)" name="llpAgreement.meetingQuorum" options={MEETING_QUORUM_OPTIONS} placeholder="Select" size="large" />
                    </Col>
                    <Col xs={24} md={12}>
                        <SelectInput label="Voting Threshold for Decisions" name="llpAgreement.votingThreshold" options={VOTING_THRESHOLD_OPTIONS} placeholder="Select" size="large" />
                    </Col>
                </Row>
            </div>

            {/* Dispute resolution */}
            <div className="flex flex-col gap-3">
                <Text className="!text-[16px] !font-semibold !text-[#1e293b]">Dispute Resolution</Text>
                <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                        <SelectInput label="Dispute Resolution Method" name="llpAgreement.disputeMethod" options={DISPUTE_METHOD_OPTIONS} placeholder="Select" size="large" />
                    </Col>
                    <Col xs={24} md={12}>
                        <TextInput label="Jurisdiction" name="llpAgreement.jurisdiction" type="text" placeholder="Enter jurisdiction" size="large" />
                    </Col>
                </Row>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button className="!h-[44px] !px-5 !text-[15px] !font-medium !rounded-[8px] !border-[#ff4f4f] !text-[#ff4f4f] hover:!bg-[#fff5f5] transition-colors">
                    Preview Your LLP Agreement
                </Button>
                <Button type="primary" icon={<DownloadOutlined />} className="!h-[44px] !px-5 !text-[15px] !font-medium !rounded-[8px] !bg-[#ff4f4f] hover:!bg-[#e64444] transition-colors">
                    Download Draft Agreement
                </Button>
            </div>
        </div>
    );
};

export default StandardLlpAgreement;
