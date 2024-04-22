import { useDisplayMember } from '../Providers/MemberProvder';
import { RepCard } from './RepCard';

interface CongressMember {
	bioguideId: string;

	photoUrl: string;
	name: string;
	party: string;
	state: string;
	district: string;
	phones: string[];
	urls: string[];
}

export const Reps = () => {
	const { congressMembers, senators, houseReps, chamber } = useDisplayMember();

	const members =
		chamber === 'both'
			? congressMembers
			: chamber === 'house'
			? houseReps
			: senators;

	return (
		<>
			{members?.map((member: CongressMember) => (
				<RepCard
					member={member}
					key={member.bioguideId}
				/>
			))}
			;
		</>
	);
};
