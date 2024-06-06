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

type RepVotes = {
	[key: string]: string;
};

type VoteLogEntry = {
	RepVotes: RepVotes;
};

export const RepCard = ({ member }: { member: CongressMember }) => {
	const user = JSON.parse(localStorage.getItem('user') ?? '');

	const totalVotes = Object.values(user.vote_log).reduce(
		(
			total: { count: number; sameKnownVotes: number; withPartyVotes: number },
			vote
		) => {
			const repVote = (vote as VoteLogEntry).RepVotes[member.name];
			const userVote = (vote as VoteLogEntry).RepVotes[user.username];
			console.log('repVote:', repVote);
			console.log('userVote:', userVote);
			if (repVote === 'Yes' || repVote === 'No' || repVote === 'Not Voting') {
				total.count++;
				repVote === userVote
					? (total.sameKnownVotes += 1)
					: (total.sameKnownVotes += 0);
			} else {
				total.withPartyVotes += 1;
			}
			return total;
		},
		{ count: 0, sameKnownVotes: 0, withPartyVotes: 0 }
	);
	console.log('totalVotes:', totalVotes);

	const score =
		totalVotes.count > 0
			? ((totalVotes.sameKnownVotes / totalVotes.count) * 100).toFixed(2) + '%'
			: 'No clear votes recorded';

	return (
		<div className='rep-card'>
			<div className='rep-score'>
				<h3 className='font-face-Barlow'>{member.name.toUpperCase()}</h3>
				<div>Known Score: {score}</div>
				<div>Probable Score: </div>
			</div>
			<div className='rep-card-bottom'>
				<img
					src={`${member?.photoUrl}`}
					alt=''
				/>
				<div>
					{member.bioguideId && <div>Bioguide-ID: {member.bioguideId}</div>}
					{member.district && member.bioguideId ? (
						<span className='rep-district'>
							House Rep District {member.district}
						</span>
					) : member.bioguideId ? (
						<span>Senator</span>
					) : null}

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
