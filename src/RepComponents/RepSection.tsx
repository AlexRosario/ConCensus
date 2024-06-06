import { useDisplayMember } from '../Providers/MemberProvder.tsx';
import { CongressMember } from '../types.ts';
import { RepCard } from './RepCard.tsx';

export const RepSection = () => {
	const {
		congressMembers,
		senators,
		houseReps,
		chamber,
		representatives,
		setChamber,
	} = useDisplayMember();
	const members =
		chamber === 'all'
			? representatives
			: chamber === 'house'
			? houseReps
			: chamber === 'senate'
			? senators
			: congressMembers;

	return (
		<section className='rep-container'>
			<h2>118th Congress</h2>

			<div className='rep-section'>
				<div
					className='repChamber'
					key={'repChamber'}>
					<div className='selectors'>
						{/* This should display the favorited count */}
						<div
							key={'house'}
							className={`selector ${chamber === 'house' ? 'active' : ''}`}
							onClick={() => {
								setChamber('house'); // Ensure consistent naming with state value
							}}>
							House Reps
						</div>

						{/* This should display the unfavorited count */}
						<div
							key={'senate'}
							className={`selector ${chamber === 'senate' ? 'active' : ''}`}
							onClick={() => {
								setChamber('senate');
							}}>
							Senators
						</div>

						{/* Option for displaying all */}
						<div
							key={'congress'}
							className={`selector ${chamber === 'congress' ? 'active' : ''}`}
							onClick={() => {
								console.log('members:', members);
								setChamber('congress');
							}}>
							Congress
						</div>
						<div
							key={'all'}
							className={`selector ${chamber === 'all' ? 'active' : ''}`}
							onClick={() => {
								setChamber('all');
							}}>
							All Reps
						</div>
					</div>
				</div>

				<div
					className='reps'
					key={'reps'}>
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
