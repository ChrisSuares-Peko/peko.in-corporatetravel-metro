import { useState } from 'react';

import { EditOutlined } from '@ant-design/icons';
import { Flex, Select, Typography } from 'antd';

interface DriverAssignedCellProps {
    record: any;
    drivers: any[];
    onAssign: (driverId: string, vehicleId: string) => void;
    size?: 'small' | 'middle';
    className?: string;
}

// Shows the assigned driver with an edit (pencil) icon to re-assign; renders an
// "Assign Driver" dropdown when unassigned or while editing.
const DriverAssignedCell = ({
    record,
    drivers,
    onAssign,
    size = 'middle',
    className = 'w-32',
}: DriverAssignedCellProps) => {
    const [editing, setEditing] = useState(false);

    const assignment = record.assignments?.length > 0 ? record.assignments[0] : null;
    const assignedDriverName = assignment?.driver?.name;

    const options = drivers.map((driver: any) => ({
        value: driver.driverId,
        label: driver.name,
    }));

    const handleChange = (value: string) => {
        onAssign(value, record.id);
        setEditing(false);
    };

    if (assignedDriverName && !editing) {
        return (
            <Flex align="center" gap={6}>
                <Typography.Text className={size === 'small' ? 'text-xs' : ''}>
                    {assignedDriverName}
                </Typography.Text>
                <EditOutlined
                    className="cursor-pointer"
                    style={{ color: '#486284' }}
                    onClick={() => setEditing(true)}
                />
            </Flex>
        );
    }

    return (
        <Select
            className={className}
            size={size}
            value={assignment?.driverId || record.driverId || undefined}
            onChange={handleChange}
            options={options}
            placeholder="Assign Driver"
            style={{ minWidth: 120 }}
        />
    );
};

export default DriverAssignedCell;
