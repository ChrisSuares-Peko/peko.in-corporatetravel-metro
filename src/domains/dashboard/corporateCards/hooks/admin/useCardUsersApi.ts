import { useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getCardUsers } from '../../api/admin/cardUsersApi';
import { Member, MemberAccountStatus, MemberKycStatus } from '../../utils/types';

// Explicit allowlists rather than a generic case-converter: an unrecognised value falls back to the
// same default the server itself uses, instead of being printed raw into the table.
const ACCOUNT_STATUS_LABELS: Record<string, MemberAccountStatus> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    PENDING: 'Pending',
};

const KYC_STATUS_LABELS: Record<string, MemberKycStatus> = {
    NOT_STARTED: 'Not started',
    INITIATED: 'Initiated',
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    REJECTED: 'Rejected',
};

// 'PENDING' is the directory column's own default, so it is the truthful reading of a missing status.
const mapAccountStatus = (status: string): MemberAccountStatus =>
    ACCOUNT_STATUS_LABELS[status] ?? 'Pending';

// The backend already substitutes NOT_STARTED for a member with no KYC row.
const mapKycStatus = (kycStatus: string): MemberKycStatus =>
    KYC_STATUS_LABELS[kycStatus] ?? 'Not started';

const mapInviteStatus = (status: string): Member['inviteStatus'] =>
    status === 'PENDING' || status === 'ACTIVE' || status === 'INACTIVE' ? status : undefined;

const formatDate = (iso: string) => {
    try {
        return new Date(iso).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return iso;
    }
};

const PAGE_SIZE = 10;
// Pickers/dropdowns (no page arg) want the whole list, not a 10-row page — request the backend max.
const FETCH_ALL_SIZE = 100;

/**
 * Card-users list for the parent corporate. Pass `page` for a server-paginated table (10/page, with
 * `total` for the pager); omit it to fetch the full list (up to the backend max) for pickers/dropdowns.
 */
export const useCardUsersApi = (refreshKey = 0, kycStatus?: string, page?: number) => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [members, setMembers] = useState<Member[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const paginated = typeof page === 'number';

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            const res = await getCardUsers(role, id, {
                kycStatus,
                page: paginated ? page : 1,
                itemsPerPage: paginated ? PAGE_SIZE : FETCH_ALL_SIZE,
            });
            if (res && res.data) {
                const mapped: Member[] = (res.data.rows ?? []).map(u => ({
                    key: String(u.id),
                    name: u.name,
                    email: u.email,
                    role: u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase(),
                    cards: u.cardCount ?? 0,
                    accountStatus: mapAccountStatus(u.status),
                    kycStatus: mapKycStatus(u.kycStatus),
                    joined: formatDate(u.joined),
                    inviteStatus: mapInviteStatus(u.status),
                }));
                setMembers(mapped);
                setTotal(res.data.count ?? mapped.length);
            }
            setIsLoading(false);
        };

        fetch();
    }, [role, id, refreshKey, kycStatus, paginated, page]);

    return { members, total, pageSize: PAGE_SIZE, isLoading };
};
