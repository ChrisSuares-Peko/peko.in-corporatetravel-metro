import { useCallback, useState } from 'react';

import dayjs from 'dayjs';

import { useAppSelector } from '@src/hooks/store';

import { AttendanceApiRecord, getAttendanceList } from '../api/attendance';
import { AttendanceUiRow, UiAttendanceStatus, formatHours } from '../utils/attendanceMappers';

const STATUS_TO_UI: Record<AttendanceApiRecord['status'], UiAttendanceStatus> = {
    present: 'Present',
    late: 'Late',
    absent: 'Absent',
    'on-leave': 'Leave',
    'half-day': 'Half Day',
};

const toRow = (record: AttendanceApiRecord): AttendanceUiRow => ({
    key: record._id,
    date: dayjs(record.date).format('ddd MMM D'),
    rawDate: dayjs(record.date).format('YYYY-MM-DD'),
    checkIn: record.checkIn?.time ? dayjs(record.checkIn.time).format('HH:mm') : null,
    checkOut: record.checkOut?.time ? dayjs(record.checkOut.time).format('HH:mm') : null,
    hours: formatHours(record.totalHours),
    status: STATUS_TO_UI[record.status] ?? 'Absent',
    isLate: record.status === 'late',
});

const PAGE_SIZE = 10;

export const useAttendance = () => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [records, setRecords] = useState<AttendanceUiRow[]>([]);
    const [total, setTotal] = useState(0);

    const fetchAttendance = useCallback(
        async (params: { from?: string; to?: string; status?: string; page?: number }) => {
            const { records: apiRecords, total: apiTotal } = await getAttendanceList(
                { userType: role, userId: id },
                {
                    from: params.from,
                    to: params.to,
                    status: params.status,
                    page: params.page ?? 1,
                    limit: PAGE_SIZE,
                }
            );
            setRecords(apiRecords.map(toRow));
            setTotal(apiTotal);
        },
        [role, id]
    );

    return { records, total, limit: PAGE_SIZE, fetchAttendance };
};
