import { Flex } from 'antd';

import PriceBandCards from './PriceBandCards';
import { ValuationResult } from '../../types/index';
import ReportSectionCard from '../shared/ReportSectionCard';
import VehicleHeroStrip from '../shared/VehicleHeroStrip';

interface Props {
    result: ValuationResult;
    bodyType?: string;
}

// "Fair Market Value" card on a valuation order.
const ValuationResultCard = ({ result, bodyType }: Props) => (
    <ReportSectionCard title="Fair Market Value">
        <Flex vertical gap={24}>
            <VehicleHeroStrip
                modelName={result.modelName}
                bodyType={bodyType}
                meta={[result.year, result.kilometres, result.city]}
            />
            <PriceBandCards bands={result.bands} />
        </Flex>
    </ReportSectionCard>
);

export default ValuationResultCard;
