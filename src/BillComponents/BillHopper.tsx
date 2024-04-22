import { useDisplayMember } from '../Providers/MemberProvder';
import { useDisplayBills } from '../Providers/BillProvider.tsx';
import { useAuthInfo } from '../Providers/AuthProvider';
import { Requests } from '../api.tsx';
import { User, HouseBill, RelevantVote } from '../types.ts';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

export const BillHopper = () => {
	const { congressMembers, senators, houseReps } = useDisplayMember();
	const { bills, filterPassedBills } = useDisplayBills();
	const userString = localStorage.getItem('user');
	const user = userString ? JSON.parse(userString) : '';
	let relevantVotes: RelevantVote[] = [];
	const [voted, setVoted] = useState(false);
	const [votes, setVotes] = useState<Vote[]>([]);

	function getBillStatusMessage(bill: HouseBill) {
		// Handle vetoed case first since it's a straightforward check
		if (bill.vetoed !== null) return bill.vetoed;

		const passedHouse = bill.house_passage !== null;
		const passedSenate = bill.senate_passage !== null;
		const lastVote = bill.last_vote !== null;

		// Construct messages based on the bill status
		if (passedHouse && passedSenate) {
			return lastVote
				? 'Passed House and Senate'
				: 'Passed both chambers with floor vote. No roll call.';
		} else if (passedHouse) {
			return lastVote
				? 'Passed House, waiting on Senate'
				: 'Passed House with floor vote. No roll call.';
		} else if (passedSenate) {
			return lastVote
				? 'Passed Senate, waiting on House'
				: 'Passed Senate with floor vote. No roll call.';
		}

		// Default case if none of the above conditions are met
		return 'Waiting on action from House and Senate';
	}

	const getRecentRollCallVotes = async (
		date: string,
		chamber: string,
		billNumber: string
	) => {
		relevantVotes = [];
		try {
			let currentDate: Date = new Date(date);
			const today = new Date().toISOString().split('T')[0];
			do {
				const createDateWindow = (date: Date) => {
					const startDate = new Date(date);
					const endDate = new Date(date); // Start with a copy of the original date
					endDate.setDate(endDate.getDate() + 30); // Then add 30 days for the end date

					// Helper function to format dates into "YYYY-MM-DD"
					const format = (d) =>
						`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
							2,
							'0'
						)}-${String(d.getDate()).padStart(2, '0')}`;

					// Format the date window string
					const dateWindow = `${format(startDate)}/${format(endDate)}`;

					return { dateWindow, newStartDate: endDate };
				};
				const { dateWindow, newStartDate } = createDateWindow(currentDate);
				const rollCalls = await Requests.getVotesByDate(dateWindow, chamber);

				if (rollCalls.results.votes.length) {
					// Use .filter to find all relevant votes
					const filteredVotes = rollCalls.results.votes.filter(
						(vote: { bill?: { number: string } }) =>
							vote?.bill?.number === billNumber
					);

					relevantVotes = [...relevantVotes, ...filteredVotes];

					console.log('Filtered Roll Call Votes:', filteredVotes);
				}

				currentDate = newStartDate.toISOString().split('T')[0];
			} while (currentDate <= today); // Adjust the loop condition appropriately
		} catch (error) {
			console.error('Failed to fetch votes:', error);
		}

		return relevantVotes; // Return the array of relevant votes
	};

	const getMemberVote = async (
		billNumber: string,
		date: string,
		vote: string
	) => {
		const allRepVotes = {};
		allRepVotes[user.username] = vote;
		Requests.addVoteToUser(user, allRepVotes, billNumber);
		const relevantRollCalls = await getRecentRollCallVotes(
			date,
			'both',
			billNumber
		);
		const HouseRollCalls = relevantRollCalls.filter(
			(vote) => vote.chamber === 'House'
		);
		const SenateRollCalls = relevantRollCalls.filter(
			(vote) => vote.chamber === 'Senate'
		);

		console.log(
			'Relevant Votes:',
			relevantRollCalls,
			'House Roll Calls:',
			HouseRollCalls,
			'Senate Roll Calls:',
			SenateRollCalls
		);

		const rollCallOfLastHouseVote = await Requests.getRollCallVotes(
			HouseRollCalls[0]?.congress,
			'house',
			HouseRollCalls[0]?.session,
			HouseRollCalls[0]?.roll_call
		);
		const rollCallOfLastSenateVote = await Requests.getRollCallVotes(
			SenateRollCalls[0]?.congress,
			'senate',
			SenateRollCalls[0]?.session,
			SenateRollCalls[0]?.roll_call
		);
		congressMembers.map((member) => {
			let memberVote = '';

			const rollCallOfLastVote = houseReps.includes(member)
				? rollCallOfLastHouseVote
				: rollCallOfLastSenateVote;

			if (rollCallOfLastVote.status !== 'ERROR') {
				memberVote = rollCallOfLastVote?.results.votes?.vote.positions.find(
					(position: string) => position.name === member.name
				)?.vote_position;
			} else {
				memberVote = 'Floor Vote, No Roll Call recorded.';
			}

			console.log('Member Vote:', memberVote, member.name, billNumber);
			console.log('congressMembers:', congressMembers);

			allRepVotes[`${member.name}`] = memberVote;
			setVotes((prevVotes: { key: string; vote: string }[]) => [
				...prevVotes,
				{ key: `${member.name}-${billNumber}`, vote: memberVote },
			]);

			Requests.addVoteToUser(user, allRepVotes, billNumber);
			console.log('Roll Call Info:', rollCallOfLastVote);
		});
	};

	return (
		<>
			<Carousel
				showThumbs={false}
				swipeable={true}
				dynamicHeight={false}
				renderIndicator={false}>
				{bills
					.filter((bill: HouseBill) =>
						filterPassedBills ? bill.enacted !== null : bill.enacted === null
					)
					.map((bill, index) => (
						<div
							key={`${bill.bill_id}-${index}`}
							className='bill-card'>
							<div className='bill-header'>
								<b>{bill.number}</b> - <em>{bill.title}</em>
								<div>
									Sponsor: {bill.sponsor_title} {bill.sponsor_name},{' '}
									{bill.sponsor_party === 'D'
										? 'Democrat'
										: bill.sponsor_party === 'R'
										? 'Republican'
										: 'Independent'}
									, {bill.sponsor_state}
								</div>
								<div>
									Cosponsors: Republicans:{' '}
									{bill.cosponsors_by_party.R || ' none'}, Democrats:{' '}
									{bill.cosponsors_by_party.D || ' none'}
								</div>
							</div>

							<div className='bill-summary'>
								{bill.summary || (
									<a href={bill.congressdotgov_url}>
										{bill.congressdotgov_url}
									</a>
								)}
							</div>
							<div className='bill-action'>
								<b>{bill.latest_major_action_date}</b>
								<div>{bill.latest_major_action}</div>
							</div>
							<div className='bill-status'>{getBillStatusMessage(bill)}</div>
							<div>
								{voted
									? relevantVotes.map((vote) => {
											//change relevantVotes to state
											return vote.roll_call;
									  })
									: 'No roll call votes available'}
							</div>
							<div className='member-votes'>
								{congressMembers.map((member) => (
									<>
										<div>
											<span>{member.name}: </span>
											<span
												key={`${member.name}-${bill.bill_id}`}
												className='member-vote'>
												{(bill.house_passage === null &&
													bill.vetoed === null &&
													houseReps.includes(member)) ||
												(bill.senate_passage === null &&
													bill.vetoed === null &&
													senators.includes(member))
													? 'Waiting on roll call'
													: (bill.house_passage !== null ||
															bill.senate_passage !== null) &&
													  voted
													? votes.find(
															(obj) =>
																obj.key === `${member.name}-${bill.number}`
													  )?.vote
													: "Vote to see member's vote"}
											</span>
										</div>
									</>
								))}
							</div>
							<div className='vote-buttons'>
								<button
									onClick={() => {
										getMemberVote(bill.number, bill.introduced_date, 'Yes'); // Provide the missing argument
										setVoted(true);
									}}>
									<FontAwesomeIcon icon={faThumbsUp} />
								</button>
								<button
									onClick={() => {
										getMemberVote(bill.number, bill.introduced_date, 'No'); // Provide the missing argument
										setVoted(true);
									}}>
									<FontAwesomeIcon icon={faThumbsDown} />
								</button>
							</div>
						</div>
					))}
			</Carousel>
		</>
	);
};
