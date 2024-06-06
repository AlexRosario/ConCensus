/* eslint-disable no-mixed-spaces-and-tabs */
import { useDisplayMember } from '../Providers/MemberProvder';
import { useDisplayBills } from '../Providers/BillProvider.tsx';
import { Requests } from '../api.tsx';
import { HouseBill, MemberVote, RollCall, VoteRecord } from '../types.ts';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

interface MemberPositionRollCall {
	member_positions: RollCall | string;
	VoteRecord: VoteRecord | string;
}

export const BillHopper = () => {
	const { congressMembers, senators, houseReps } = useDisplayMember();
	const { bills, filterPassedBills } = useDisplayBills();
	const userString = localStorage.getItem('user');
	const user = userString ? JSON.parse(userString) : '';
	let relevantVotes: VoteRecord[] = [];
	const [voted, setVoted] = useState(false);
	const [votes, setVotes] = useState<{ key: string; vote: string }[]>([]);

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
		return 'Waiting on member_positions from House and Senate';
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
					const format = (d: Date) =>
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
				console.log(dateWindow);
				if (rollCalls.results.votes.length) {
					// Use .filter to find all relevant votes
					const filteredVotes = rollCalls.results.votes.filter(
						(vote: { bill?: { number: string } }) =>
							vote?.bill?.number === billNumber
					);

					relevantVotes = [...relevantVotes, ...filteredVotes];

					console.log('Filtered Roll Call Votes:', filteredVotes);
				}

				currentDate = new Date(newStartDate.toISOString().split('T')[0]);
			} while (currentDate <= new Date(today)); // Adjust the loop condition appropriately
		} catch (error) {
			console.error('Failed to fetch votes:', error);
		}

		return relevantVotes; // Return the array of relevant votes
	};

	const getMemberVote = async (bill: HouseBill, vote: string) => {
		const introDate = bill.introduced_date;
		const billNumber = bill.number;
		const allRepVotes: { [key: string]: string } = {};
		const isBillEnacted = bill.enacted !== null;
		const isBillVetoed = bill.vetoed !== null;
		const isBillActive = bill.active;
		const isSenateOrHouseBill =
			bill.bill_type.slice(0, 1) === 'h' ? 'house' : 'senate';
		const username = user.username;

		let partyVotes: { [key: string]: object } = {};

		allRepVotes[username] = vote;

		const relevantRollCalls = await getRecentRollCallVotes(
			introDate,
			'both',
			billNumber
		);
		const HouseRollCalls = relevantRollCalls.filter(
			(vote) => vote.chamber === 'House'
		);
		const SenateRollCalls = relevantRollCalls.filter(
			(vote) => vote.chamber === 'Senate'
		);
		console.log('House Roll Calls:', HouseRollCalls);
		console.log('Senate Roll Calls:', SenateRollCalls);

		const lastHouseVoteRecord: MemberPositionRollCall = {
			member_positions:
				HouseRollCalls.length !== 0 //Indicates that there is at least one roll call vote
					? await Requests.getRollCallVotes(
							HouseRollCalls[0].congress,
							'house',
							HouseRollCalls[0].session,
							HouseRollCalls[0].roll_call
					  )
					: bill.house_passage !== null && isBillEnacted //Indicates that the bill has passed the house and made into law without a roll call vote
					? 'Made into law. House Voted yes with a floor vote and no individual vote record is available.'
					: isBillActive &&
					  isSenateOrHouseBill === 'senate' &&
					  bill.senate_passage !== null &&
					  bill.house_passage === null //Indicates that bill was passed to House from Senate. House hasn't passed bill, but it remains under consideration and subject to further action, debate, and potential modification
					? 'Senate passed  bill to House, it remains under consideration and subject to further action, debate, and potential modification.'
					: isBillActive &&
					  isSenateOrHouseBill === 'house' &&
					  bill.house_passage !== null &&
					  bill.senate_passage === null
					? 'House passed bill to Senate, it remains under consideration and subject to further action, debate, and potential modification.'
					: isBillActive && isBillVetoed //Indicates that the bill was vetoed with message to Congress
					? 'President vetoed bill with a message to Congress.'
					: bill.house_passage !== null &&
					  bill.senate_passage !== null &&
					  !isBillEnacted &&
					  !isBillVetoed
					? bill.latest_major_action
					: 'Way too much fuckery in Congress',
			VoteRecord:
				HouseRollCalls.length !== 0
					? HouseRollCalls[0]
					: bill.house_passage !== null
					? 'No Roll Calls found, but bill was passed.'
					: 'No Roll Calls yet.',
		};

		console.log('Roll Call Info:2', lastHouseVoteRecord);

		const lastSenateVoteRecord: MemberPositionRollCall = {
			member_positions:
				SenateRollCalls.length !== 0
					? await Requests.getRollCallVotes(
							SenateRollCalls[0].congress,
							'senate',
							SenateRollCalls[0].session,
							SenateRollCalls[0].roll_call
					  )
					: bill.senate_passage !== null && isBillEnacted //Indicates that the bill has passed the Senate and made into law without a roll call vote
					? 'Made into law. Senate Voted yes with a floor vote and no individual vote record is available.'
					: isBillActive &&
					  isSenateOrHouseBill === 'house' &&
					  bill.house_passage !== null &&
					  bill.senate_passage === null //Indicates that bill was passed to Senate from House. Senate hasn't passed bill, but it remains under consideration and subject to further action, debate, and potential modification
					? 'House passed bill to Senate, it remains under consideration and subject to further action, debate, and potential modification.'
					: isBillActive &&
					  isSenateOrHouseBill === 'senate' &&
					  bill.senate_passage !== null &&
					  bill.house_passage === null //Indicates that bill was passed to House from Senate. House hasn't passed bill, but it remains under consideration and subject to further action, debate, and potential modification
					? 'Senate passed  bill to House, it remains under consideration and subject to further action, debate, and potential modification.'
					: isBillActive && isBillVetoed //Indicates that the bill was vetoed with message to Congress
					? 'President vetoed bill with a message to Congress.'
					: bill.house_passage !== null &&
					  bill.senate_passage !== null &&
					  !isBillEnacted &&
					  !isBillVetoed
					? bill.latest_major_action
					: 'Way too much fuckery in Congress',
			VoteRecord:
				SenateRollCalls.length !== 0
					? SenateRollCalls[0]
					: bill.senate_passage !== null
					? 'No Roll Calls found, but bill was passed.'
					: 'No Roll Calls yet.',
		};
		console.log('Roll Call Info1:', lastSenateVoteRecord);
		const HouseVotes =
			typeof lastHouseVoteRecord.VoteRecord !== 'string' &&
			typeof lastHouseVoteRecord.member_positions !== 'string'
				? {
						Democratic: {
							...lastHouseVoteRecord?.VoteRecord?.democratic,
						},
						Republican: {
							...lastHouseVoteRecord?.VoteRecord?.republican,
						},
						Independent: {
							...lastHouseVoteRecord?.VoteRecord?.independent,
						},
				  }
				: { House: 'No Votes recorded yet.' };
		const SenateVotes =
			typeof lastSenateVoteRecord.VoteRecord !== 'string' &&
			typeof lastSenateVoteRecord.member_positions !== 'string'
				? {
						Democratic: {
							...lastSenateVoteRecord?.VoteRecord?.democratic,
						},
						Republican: {
							...lastSenateVoteRecord?.VoteRecord?.republican,
						},
						Independent: {
							...lastSenateVoteRecord?.VoteRecord?.independent,
						},
				  }
				: { Senate: 'No Votes recorded yet.' };

		partyVotes = {
			HouseVotes,
			SenateVotes,
		};

		congressMembers.map((member) => {
			let memberVote = '';
			const memberShortenedFirstName = member.name.slice(0, 3); // using slice to get the first 3 letters of the first name as it is the most unique part of the name and names vary across datasets
			const memberLastName = member.name.slice(
				member.name.indexOf(' ') + 1,
				member.name.length
			);

			const isItHouseOrSenateRep = houseReps.some(
				(rep) =>
					rep.name.includes(memberShortenedFirstName) &&
					rep.name.includes(memberLastName)
			)
				? 'houseRep'
				: 'senateRep';

			const lastPertinentChamberVoteRecord =
				isItHouseOrSenateRep === 'houseRep'
					? lastHouseVoteRecord
					: lastSenateVoteRecord;
			console.log('roll call of:', lastPertinentChamberVoteRecord);

			if (typeof lastPertinentChamberVoteRecord.member_positions !== 'string') {
				memberVote =
					lastPertinentChamberVoteRecord.member_positions.results.votes.vote.positions.find(
						(position) => (position as MemberVote).name.includes(member.name)
					)?.vote_position as string;
			} else if (
				typeof lastPertinentChamberVoteRecord.VoteRecord !== 'string'
			) {
				const partyVote =
					member.partyName === 'Democratic'
						? lastPertinentChamberVoteRecord.VoteRecord.democratic
						: member.partyName === 'Republican'
						? lastPertinentChamberVoteRecord.VoteRecord.republican
						: lastPertinentChamberVoteRecord.VoteRecord.independent;
				const partyMajorityVoteCount = Math.max(
					partyVote.yes,
					partyVote.no,
					partyVote.present
				);
				const partyTotalVotes =
					partyVote.yes + partyVote.no + partyVote.present;
				const guessedMemberVote =
					((member.votes_with_party_pct || 100) / 100) *
						(partyMajorityVoteCount / partyTotalVotes) >
					0.5
						? `Yes`
						: `No`;
				memberVote = `${guessedMemberVote}, based on party position. No record of individual vote since it was a party line vote.`;
			} else {
				const partyMajorityVote =
					(isItHouseOrSenateRep === 'houseRep' &&
						bill.house_passage !== null &&
						(member.votes_with_party_pct || 100) > 50) ||
					(isItHouseOrSenateRep === 'senateRep' &&
						bill.senate_passage !== null &&
						(member.votes_with_party_pct || 100) > 50)
						? 'Yes'
						: 'No';
				memberVote = `${partyMajorityVote} inferred from voting history, but no Vote Record found.`;
			}

			console.log('Member Vote:', memberVote, member.name, billNumber);
			console.log('congressMembers:', congressMembers);

			//add party vote to each bill record

			allRepVotes[member.name] = memberVote; //make into object list
			setVotes((prevVotes: { key: string; vote: string }[]) => [
				...prevVotes,
				{ key: `${member.name}-${billNumber}`, vote: memberVote },
			]);

			console.log('Roll Call Info:', lastPertinentChamberVoteRecord);
		});
		Requests.addVoteToUser(user, allRepVotes, billNumber, partyVotes); //add after all congress members have been added and add party position to function
	};

	return (
		<>
			<Carousel
				showThumbs={false}
				swipeable={true}
				dynamicHeight={false}
				renderIndicator={() => null}>
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
							<div className='bill-member_positions'>
								<b>{bill.latest_major_action_date}</b>
								<div>{bill.latest_major_action}</div>
							</div>
							<div className='bill-status'>{getBillStatusMessage(bill)}</div>
							<div>
								{voted
									? relevantVotes.map((vote) => {
											//change relevantVotes to state
											return vote.roll_call;
											// eslint-disable-next-line no-mixed-spaces-and-tabs
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
										getMemberVote(bill, 'Yes'); // Provide the missing argument
										setVoted(true);
									}}>
									<FontAwesomeIcon icon={faThumbsUp} />
								</button>
								<button
									onClick={() => {
										getMemberVote(bill, 'No'); // Provide the missing argument
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
