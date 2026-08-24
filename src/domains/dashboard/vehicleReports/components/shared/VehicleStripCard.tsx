import { ReactNode } from 'react';

import { Flex, Typography } from 'antd';

import getVehicleImage from '../../../turbo/utils/getVehicleImage';
import { SelectedVehicle } from '../../types/index';
import { vehicleDescriptor, vehicleHeadline } from '../../utils/vehicleLabel';

const { Text } = Typography;

interface Props {
    vehicle: SelectedVehicle;
    // Grey meta chips under the vehicle name — the inspection booking form shows
    // the chosen package, category and price here.
    metaChips?: string[];
    // "Change vehicle" / "Change Inspection type" buttons, right-aligned.
    actions?: ReactNode;
}

// The selected-vehicle strip that heads every report form.
const VehicleStripCard = ({ vehicle, metaChips, actions }: Props) => {
    const descriptor = vehicleDescriptor(vehicle);

    return (
        <Flex
            align="center"
            gap={16}
            className="flex-col rounded-2xl border border-[#EFF1F4] bg-white p-4 sm:flex-row sm:justify-between"
        >
            <Flex align="center" gap={16} className="w-full sm:w-auto">
                <div className="flex h-[52px] w-[64px] shrink-0 items-center justify-center rounded-lg bg-[#F5F6F8]">
                    <img
                        src={getVehicleImage(vehicle.bodyType)}
                        alt=""
                        className="h-[34px] w-[52px] object-contain"
                    />
                </div>
                <Flex vertical gap={4}>
                    <Text className="text-base font-medium text-[#0A0A0A]">
                        {vehicleHeadline(vehicle)}
                    </Text>
                    {/* Not force-uppercased: RC data already arrives that way, and the
                        manual-entry hint reads as a sentence. */}
                    {!!descriptor && (
                        <Text className="text-xs text-[#98A2B3]">{descriptor}</Text>
                    )}
                    {!!metaChips?.length && (
                        <Flex gap={6} className="mt-1 flex-wrap">
                            {metaChips.map(chip => (
                                <span
                                    key={chip}
                                    className="rounded bg-[#F2F4F7] px-2 py-[2px] text-xs text-[#475569]"
                                >
                                    {chip}
                                </span>
                            ))}
                        </Flex>
                    )}
                </Flex>
            </Flex>
            {!!actions && (
                <Flex gap={10} className="w-full flex-wrap justify-end sm:w-auto">
                    {actions}
                </Flex>
            )}
        </Flex>
    );
};

export default VehicleStripCard;
