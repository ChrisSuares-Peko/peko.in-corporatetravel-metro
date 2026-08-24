import { Typography } from 'antd';
import { useFormikContext } from 'formik';

import BusinessActivity from './BusinessActivity';
import EntityTypeBanner from './EntityTypeBanner';
import PrimaryContact from './PrimaryContact';
import ProposedTradeName from './ProposedTradeName';
import { EntityType } from '../../../types';
import { ENTITY_SHORT_LABELS } from '../../../utils/data';
import Structure from '../Structure';

const { Title, Paragraph } = Typography;

interface BasicInfoValues {
    entityType?: EntityType;
}

// Step 1 of the Proprietorship registration form (Figma 1819:23049).
// Registered-office availability/address moved to the KYC step (post-payment,
// 23-07 vendor-call flow) — see RegisteredOfficeSection.
const BasicInformation = () => {
    const { values } = useFormikContext<BasicInfoValues>();
    const entityLabel = values.entityType
        ? ENTITY_SHORT_LABELS[values.entityType]
        : 'Proprietorship';
    // Director/shareholder counts only for entities whose later steps don't manage
    // them: OPC is fixed (1 director + 1 nominee) and Private Limited picks the
    // director count on its KYC step; shareholders come from the Shareholding step.
    const showStructure =
        values.entityType === EntityType.PARTNERSHIP || values.entityType === EntityType.LLP;
    // OPC allows up to 2 business activities; everyone else up to 3.
    const maxActivities = values.entityType === EntityType.OPC ? 2 : 3;

    return (
        <div className="flex flex-col gap-4">
            <div>
                <Title
                    level={3}
                    className="!text-[24px] !font-semibold !text-[#1e293b] !mb-1 !leading-[32px]"
                >
                    Basic Information
                </Title>
                <Paragraph className="!mb-0 text-[16px] text-[#6a7282] !leading-[24px]">
                    Trade name, business activity, registrations &amp; payment
                </Paragraph>
            </div>

            <div className="bg-white rounded-[30px] p-4 sm:p-6 shadow-[0px_1.5px_16.5px_0px_rgba(0,0,0,0.06)] flex flex-col gap-6">
                <EntityTypeBanner entityLabel={entityLabel} />
                <PrimaryContact />
                <ProposedTradeName />
                <BusinessActivity maxActivities={maxActivities} />
                {showStructure && <Structure />}
            </div>
        </div>
    );
};

export default BasicInformation;
