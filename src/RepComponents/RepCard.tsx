import { useEffect } from 'react';
import { Requests } from '../api';

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
export const RepCard = ({ member }: { member: CongressMember }) => {
	const user = JSON.parse(localStorage.getItem('user') ?? '');

	const getMemberScoreData = () => {
		const voteLog = Requests.getVoteLog(user).then((data) => {
			return JSON.parse(data);
		});
		console.log('Vote Log:', voteLog);
	};
	useEffect(() => {
		getMemberScoreData();
	}, []);
	return (
		<div className='rep-card'>
			<div className='rep-score'>
				<h3 className='font-face-Barlow'>{member.name.toUpperCase()}</h3>
				<div className='rep-district'>{member.district}</div>
			</div>
			<div className='rep-card-bottom'>
				<img
					src={`${member?.photoUrl}`}
					alt=''
				/>
				<div>
					<h4>{member.state}</h4>
					<div>ID: {member.bioguideId}</div>
					<div>{member.party}</div>

					<div>Phone: {member.phones}</div>
					<div>
						<span>
							Links:{' '}
							{member.urls.map((url, index) => {
								return (
									<span className='rep-links'>
										<a
											href={`${member.urls[index]}}`}
											className='rep-links-link'>
											{member.urls[index]}
										</a>
									</span>
								);
							})}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
