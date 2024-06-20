interface CongressMember {
	short_title: string;
	id: string;
	office_title: string;
	office: string;
	bioguideId: string;
	title: { name: string };
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
	const title =
		typeof member.title === 'string'
			? member.title
			: member.office_title
			? member.office_title
			: 'missing title';

	const totalVotes = Object.values(user.vote_log).reduce(
		(
			total: { count: number; sameKnownVotes: number; withPartyVotes: number },
			vote
		) => {
			const repVote = (vote as VoteLogEntry).RepVotes[member.name];
			const userVote = (vote as VoteLogEntry).RepVotes[user.username];

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

	const score =
		totalVotes.count > 0
			? ((totalVotes.sameKnownVotes / totalVotes.count) * 100).toFixed(2) + '%'
			: 'No clear votes recorded';

	return (
		<div className='rep-card'>
			<div className='rep-card-top'>
				<div className='name-title'>
					<h3 className='font-face-Barlow'>{member.name.toUpperCase()}</h3>
					<h5>{title}</h5>
				</div>
				{title.includes('Senator') || title === 'Representative' ? (
					<div className='rep-score'>
						<div>Score: {score}</div>
					</div>
				) : null}
			</div>

			<div className='rep-card-bottom'>
				<img
					src={`${member?.photoUrl}`}
					alt=''
				/>
				<div className='rep-info'>
					{(member.bioguideId || member.id) && (
						<div>Bioguide-ID: {member.bioguideId || member.id} </div>
					)}
					{member.district && member.bioguideId ? (
						<span className='rep-district'>
							{member.state} District {member.district}
						</span>
					) : member.short_title === 'Sen.' ? (
						<span>{member.state} Senator</span>
					) : null}

					<div>{member.party}</div>
					<div>Phone: {member.phones}</div>
					<div>
						<span>
							Links:{' '}
							{member.urls.map((url, index) => {
								return (
									<span
										key={index}
										className='rep-links'>
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
