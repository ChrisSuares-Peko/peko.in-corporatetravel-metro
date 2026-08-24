import { Member, SelectOption, TabItem, Team, TeamMemberEntry } from './types';

/**
 * Static demo data + copy for the admin "People" page (Members table + Teams grid + modals).
 * Mirrors the Figma reference; swap for live team/member API data when wiring up.
 */

/* ------------------------------------------------------------------ *
 * Page copy
 * ------------------------------------------------------------------ */
export const PEOPLE_COPY = {
    title: 'People',
    subtitle: 'Manage your team, roles, KYC status, and team structure.',
    createTeam: 'Create team',
    inviteMember: 'Invite member',
    rolesNote: 'Permissions for each role can be configured in Settings → User Management.',
} as const;

/* Department + Role are fixed while the fields are hidden from the invite form. */
export const DEFAULT_MEMBER_DEPARTMENT = 'IT';
export const DEFAULT_MEMBER_ROLE = 'Employee';

/* ------------------------------------------------------------------ *
 * Members / Teams sub-tabs
 * ------------------------------------------------------------------ */
export const PEOPLE_TABS: TabItem[] = [
    { key: 'members', label: 'Members' },
    // Teams is not wired to a backend yet — hidden for now.
    // { key: 'teams', label: 'Teams' },
];

/* ------------------------------------------------------------------ *
 * Members table
 * ------------------------------------------------------------------ */
export const PEOPLE_MEMBERS: Member[] = [
    {
        key: 'anto-rebe',
        name: 'Anto Rebe',
        email: 'anto@peko.one',
        role: 'Admin',
        cards: 1,
        accountStatus: 'Active',
        kycStatus: 'Completed',
        joined: '2024-01-12',
    },
    {
        key: 'john-doe',
        name: 'John Doe',
        email: 'john@peko.one',
        role: 'Team Member',
        cards: 2,
        accountStatus: 'Active',
        kycStatus: 'Completed',
        joined: '2024-02-03',
    },
    {
        key: 'maria-chen',
        name: 'Maria Chen',
        email: 'maria@peko.one',
        role: 'Team Member',
        cards: 1,
        accountStatus: 'Pending',
        kycStatus: 'Not started',
        joined: '2024-03-15',
    },
    {
        key: 'liam-smith',
        name: 'Liam Smith',
        email: 'liam@peko.one',
        role: 'Accountant',
        cards: 4,
        accountStatus: 'Inactive',
        kycStatus: 'Rejected',
        joined: '2024-04-27',
    },
];

/* ------------------------------------------------------------------ *
 * Teams grid
 * ------------------------------------------------------------------ */
/** Shared roster shown inside each team card and the "Create a team" member picker. */
export const TEAM_ROSTER: TeamMemberEntry[] = [
    { key: 'liam', name: 'Liam Smith', role: 'Team Member' },
    { key: 'ananya', name: 'Ananya Gupta', role: 'Team Member' },
    { key: 'maya', name: 'Maya Johnson', role: 'Project Lead' },
    { key: 'rajesh', name: 'Rajesh Bhatia', role: 'UX Designer' },
];

export const PEOPLE_TEAMS: Team[] = [
    { name: 'Sales', category: 'Revenue team', leadName: 'Ananya Gupta' },
    { name: 'Marketing', category: 'Growth team', leadName: 'Maya Johnson' },
    { name: 'Finance', category: 'Operations team', leadName: 'Anto Rebe' },
    { name: 'Engineering', category: 'Product team', leadName: 'Rajesh Bhatia' },
    { name: 'Design', category: 'Product team', leadName: 'Liam Smith' },
    { name: 'Operations', category: 'Support team', leadName: 'Priya Patel' },
].map(team => ({
    ...team,
    key: team.name.toLowerCase(),
    memberCount: TEAM_ROSTER.length,
    members: TEAM_ROSTER,
}));

/* ------------------------------------------------------------------ *
 * Modal select options
 * ------------------------------------------------------------------ */
export const ROLE_OPTIONS: SelectOption[] = [
    { label: 'Admin', value: 'admin' },
    { label: 'Team Member', value: 'team-member' },
    { label: 'Accountant', value: 'accountant' },
    { label: 'Viewer', value: 'viewer' },
];

export const TEAM_OPTIONS: SelectOption[] = PEOPLE_TEAMS.map(team => ({
    label: team.name,
    value: team.key,
}));

export const TEAM_LEAD_OPTIONS: SelectOption[] = PEOPLE_MEMBERS.map(member => ({
    label: member.name,
    value: member.key,
}));
