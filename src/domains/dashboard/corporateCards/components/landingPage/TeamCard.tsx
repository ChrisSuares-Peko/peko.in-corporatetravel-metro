import { Typography } from 'antd';

import InitialsAvatar from './InitialsAvatar';
import { Team } from '../../utils/types';

const { Text } = Typography;

interface TeamCardProps {
    team: Team;
}

/** A single team card: name + descriptor, member count, highlighted lead, and the roster. */
const TeamCard = ({ team }: TeamCardProps) => (
    <article className="flex flex-col gap-5 rounded-2xl border border-borderCard bg-white p-5 xl:p-6">
        <header className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
                <Text className="text-base font-semibold text-textHeadings xl:text-lg">
                    {team.name}
                </Text>
                <Text className="text-xs text-textGreyLight">{team.category}</Text>
            </div>
            <span className="whitespace-nowrap rounded-full bg-listBg px-3 py-1 text-xs font-medium text-textBody">
                {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
            </span>
        </header>

        {/* Highlighted team lead */}
        <div className="flex items-center gap-3 rounded-xl bg-bgLightGray p-3">
            <InitialsAvatar name={team.leadName} tone="neutral" />
            <div className="flex flex-col">
                <Text className="text-sm font-semibold text-textHeadings">{team.leadName}</Text>
                <Text className="text-xs text-textGreyLight">Team lead</Text>
            </div>
        </div>

        {/* Roster */}
        <ul className="flex flex-col gap-3">
            {team.members.map(member => (
                <li key={member.key} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <InitialsAvatar name={member.name} tone="neutral" size={28} />
                        <Text className="text-sm text-textHeadings">{member.name}</Text>
                    </div>
                    <Text className="whitespace-nowrap text-xs text-textGreyLight">
                        {member.role}
                    </Text>
                </li>
            ))}
        </ul>
    </article>
);

export default TeamCard;
