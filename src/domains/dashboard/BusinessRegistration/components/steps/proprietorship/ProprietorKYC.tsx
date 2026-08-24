import { Typography } from 'antd';

import SelectInput from '@components/atomic/inputs/SelectInput';

import DirectorCard from './DirectorCard';
import { KYC_SUBTITLE, KYC_TITLE, NUMBER_OF_DIRECTORS_OPTIONS } from '../../../utils/proprietorKyc';
import ImportantRequirements from '../ImportantRequirements';

const { Title, Paragraph, Text } = Typography;

// Step 2 of the Proprietorship registration form (Figma 1808:21171). The RM
// sidebar is provided by the form shell.
const ProprietorKYC = () => (
    <div className="flex flex-col gap-4">
        <div>
            <Title level={3} className="!text-[24px] !font-semibold !text-[#1e293b] !mb-1 !leading-[32px]">
                {KYC_TITLE}
            </Title>
            <Paragraph className="!mb-0 text-[16px] text-[#6a7282] !leading-[24px]">
                {KYC_SUBTITLE}
            </Paragraph>
        </div>

        <div className="border border-[#e4e4e7] rounded-[24px] p-4 sm:p-6 flex flex-col gap-6">
            <SelectInput
                label="Number of Directors* (Minimum 1 directors required)"
                name="numberOfDirectors"
                options={NUMBER_OF_DIRECTORS_OPTIONS}
                placeholder="Select Number"
                size="large"
            />

            <div className="flex flex-col gap-3">
                <Text className="!text-[16px] !font-semibold !text-[#1e293b]">Director Details</Text>
                <DirectorCard index={1} />
            </div>

            <ImportantRequirements />
        </div>
    </div>
);

export default ProprietorKYC;
