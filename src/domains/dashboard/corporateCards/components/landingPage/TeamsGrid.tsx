import TeamCard from './TeamCard';
import { Team } from '../../utils/types';

interface TeamsGridProps {
    teams: Team[];
}

/** Responsive grid of team cards (1 → 2 → 3 columns as the viewport widens). */
const TeamsGrid = ({ teams }: TeamsGridProps) => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xxl:grid-cols-3 xl:gap-6">
        {teams.map(team => (
            <TeamCard key={team.key} team={team} />
        ))}
    </div>
);

export default TeamsGrid;
