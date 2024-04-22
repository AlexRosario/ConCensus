import { useDisplayMember } from '../Providers/MemberProvder.tsx';
import { RepCard } from './RepCard.tsx';

interface CongressMember {
	bioguideId: string;
	id: string;
	photoUrl: string;
	name: string;
	party: string;
	state: string;
	district: string;
	phones: string[];
	urls: string[];
}

export const RepSection = () => {
	const { congressMembers, senators, houseReps, chamber, setChamber } =
		useDisplayMember();
	const members =
		chamber === 'both'
			? congressMembers
			: chamber === 'house'
			? houseReps
			: senators;

	return (
		<section className='rep-container'>
			<h2>118th Congress</h2>

			<div className='rep-section'>
				<div className='repChamber'>
					<div className='selectors'>
						{/* This should display the favorited count */}
						<div
							className={`selector ${chamber === 'house' ? 'active' : ''}`}
							onClick={() => {
								setChamber('house'); // Ensure consistent naming with state value
							}}>
							House Reps
						</div>

						{/* This should display the unfavorited count */}
						<div
							className={`selector ${chamber === 'senate' ? 'active' : ''}`}
							onClick={() => {
								setChamber('senate');
							}}>
							Senators
						</div>

						{/* Option for displaying all */}
						<div
							className={`selector ${chamber === 'both' ? 'active' : ''}`}
							onClick={() => {
								setChamber('both');
							}}>
							All
						</div>
					</div>
				</div>

				<div className='reps'>
					{members?.map((member: CongressMember) => (
						<RepCard
							member={member}
							key={member.bioguideId}
						/>
					))}
				</div>
			</div>
		</section>
	);
};
