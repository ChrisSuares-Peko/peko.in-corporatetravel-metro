import { useState } from 'react';

import UnableToDeleteModal from '@components/molecular/modals/UnableToDeleteModal';
import {
    deleteSubCorporate,
    resendInvitation,
} from '@src/domains/dashboard/settings/api/userManagement';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import MembersTable from './MembersTable';
import CreateTeamModal from './modals/CreateTeamModal';
import EditMemberModal from './modals/EditMemberModal';
import InviteMemberModal from './modals/InviteMemberModal';
import RemoveMemberModal from './modals/RemoveMemberModal';
import PeopleHeader from './PeopleHeader';
import TeamsGrid from './TeamsGrid';
import { freezeCardholderCards } from '../../api/admin/cardUsersApi';
import { useCardUsersApi } from '../../hooks/admin/useCardUsersApi';
import { PEOPLE_TABS, PEOPLE_TEAMS } from '../../utils/peopleData';
import { Member } from '../../utils/types';
import PageTabs from '../common/PageTabs';

type ActiveModal = 'invite' | 'create-team' | 'edit' | 'remove' | 'unable-to-delete' | null;

/**
 * Admin "People" page: Members table / Teams grid sub-tabs, with the invite, create-team,
 * edit and remove flows. Rendered inside the Corporate Cards admin shell (the "People" tab),
 * so it owns only its own content — never the surrounding layout, sidebar or navbar.
 */
const PeopleLandingPage = () => {
    const dispatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [activeTab, setActiveTab] = useState('members');
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [membersRefreshKey, setMembersRefreshKey] = useState(0);
    const [membersPage, setMembersPage] = useState(1);
    const [isRemoving, setIsRemoving] = useState(false);
    const [resendingKey, setResendingKey] = useState<string | null>(null);
    const { members, total, pageSize, isLoading } = useCardUsersApi(
        membersRefreshKey,
        undefined,
        membersPage
    );

    const closeModal = () => setActiveModal(null);

    const openEdit = (member: Member) => {
        setSelectedMember(member);
        setActiveModal('edit');
    };

    // A member holding a live card (active, frozen or termination-requested) must not be removed — deleting
    // them would orphan a card that can still be authorized. `cards` is exactly that count, so it gates the
    // delete straight from the loaded row.
    const openRemove = (member: Member) => {
        setSelectedMember(member);
        setActiveModal(member.cards > 0 ? 'unable-to-delete' : 'remove');
    };

    const handleResendInvite = async (member: Member) => {
        if (resendingKey) return;
        setResendingKey(member.key);
        const res = await resendInvitation(Number(member.key));
        setResendingKey(null);
        if (res) {
            dispatch(
                showToast({ variant: 'success', description: 'Invitation resent successfully.' })
            );
        }
    };

    const handleRemoveConfirm = async () => {
        if (!selectedMember) return;
        setIsRemoving(true);
        // Freeze the member's corporate cards FIRST so a removed member can't keep spending — deleting the
        // member is a platform-level soft-delete (users service) that does NOT touch the card vendor. Best-
        // effort: a vendor hiccup must not block the removal, so we still delete and warn about any card
        // that couldn't be frozen (the admin can freeze it manually from Cards).
        const freezeRes = await freezeCardholderCards(role, id, selectedMember.key);
        const failedToFreeze = freezeRes ? freezeRes.data?.summary?.failed ?? 0 : 0;

        const res = await deleteSubCorporate(Number(selectedMember.key));
        setIsRemoving(false);
        if (res) {
            dispatch(
                showToast(
                    !freezeRes || failedToFreeze > 0
                        ? {
                              variant: 'warning',
                              description: `Member removed, but ${
                                  !freezeRes ? 'their' : `${failedToFreeze}`
                              } card(s) could not be frozen. Freeze them from the Cards tab.`,
                          }
                        : { variant: 'success', description: 'Member deleted successfully.' }
                )
            );
            // Removing the last row on a non-first page would leave it empty — step back instead.
            if (members.length === 1 && membersPage > 1) {
                setMembersPage(p => p - 1);
            } else {
                setMembersRefreshKey(k => k + 1);
            }
            closeModal();
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <PeopleHeader
                // onCreateTeam={() => setActiveModal('create-team')} // Teams hidden for now.
                onInviteMember={() => setActiveModal('invite')}
            />

            <PageTabs tabs={PEOPLE_TABS} activeKey={activeTab} onChange={setActiveTab} />

            {activeTab === 'members' ? (
                <MembersTable
                    members={members}
                    isLoading={isLoading}
                    onEdit={openEdit}
                    onRemove={openRemove}
                    onResendInvite={handleResendInvite}
                    resendingKey={resendingKey}
                    page={membersPage}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setMembersPage}
                />
            ) : (
                <TeamsGrid teams={PEOPLE_TEAMS} />
            )}

            <InviteMemberModal
                open={activeModal === 'invite'}
                onClose={closeModal}
                onSuccess={() => setMembersRefreshKey(k => k + 1)}
            />
            <CreateTeamModal open={activeModal === 'create-team'} onClose={closeModal} />
            <EditMemberModal
                open={activeModal === 'edit'}
                member={selectedMember}
                onClose={closeModal}
            />
            <RemoveMemberModal
                open={activeModal === 'remove'}
                member={selectedMember}
                isLoading={isRemoving}
                onClose={closeModal}
                onConfirm={handleRemoveConfirm}
            />
            <UnableToDeleteModal
                isOpen={activeModal === 'unable-to-delete'}
                handleClose={closeModal}
            />
        </div>
    );
};

export default PeopleLandingPage;
