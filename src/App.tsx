import './App.css';
import { Requests } from './api.tsx';
import { useEffect, useState, useRef } from 'react';
import { useAuthInfo } from './Providers/AuthProvider.tsx';
import { Routes, Route } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';

import './fonts/BarlowCondensed-SemiBold.ttf';
import React from 'react';

interface HouseBill {
	bill_id: string;
	number: string;
	active: boolean;
	title: string;
	summary: string;
	latest_major_action: string;
	latest_major_action_date: string;
	congressdotgov_url: string;
	house_passage: string;
	introduced_date: string;
	vetoed: string;
}

interface CongressMember {
	id: string;
	name: string;
	party: string;
	state: string;
	district: string;
	phone: string;
	link: string;
}

interface Vote {
	key: string;
	vote: string;
}
function App() {
	const [bills, setBills] = useState<HouseBill[]>([]);
	const [houseReps, setHouseReps] = useState<CongressMember[]>([]);
	const [senators, setSenators] = useState<CongressMember[]>([]);
	const [billSubject, setBillSubject] = useState<string>('');
	const [isButtonClicked, setIsButtonClicked] = useState(false);
	const userString = localStorage.getItem('user');
	const user = userString ? JSON.parse(userString) : '';
	const [passed, setPassed] = useState(false);
	const [subjectOffset, setSubjectOffset] = useState(0);
	const [filterPassedBills, setFilterPassedBills] = useState(false);
	const [searchType, setSearchType] = useState('');
	const [chamber, setChamber] = useState('both' || 'house' || 'senate');
	const [voted, setVoted] = useState(false);
	const [votes, setVotes] = useState<Vote[]>([]);

	let prevSubjectRef = useRef(billSubject).current;
	let billNumber = '';
	let introducedDate = '';
	let memberName = '';

	const [recentRollCallVotes, setRecentRollCallVotes] = useState<object[]>([]);
	const [congressMembers, setCongressMembers] = useState<CongressMember[]>([]);
	const logOut = () => {
		localStorage.removeItem('user');
		window.location.href = '/';
	};

	const fetchBillsBySubject = async () => {
		if (prevSubjectRef !== billSubject) {
			setBills([]);
			setSubjectOffset(0);
		}

		Requests.getBillsBySubject(billSubject, subjectOffset)
			.then((data) => {
				// Logic to update the state based on the new data
				if (subjectOffset === 0) {
					setBills((prevBills) => {
						const newBills = data.results[0].bills;
						const combinedBills = [...prevBills, ...newBills];
						// Example uniqueness check (adapt as necessary)
						const uniqueBills = Array.from(
							new Map(
								combinedBills.map((bill) => [bill.bill_id, bill])
							).values()
						);
						return uniqueBills;
					});
				} else {
					setBills((prevBills) => [...prevBills, ...data.results[0].bills]);
				}
			})
			.catch((error) => {
				// Handle any errors that occur during the fetch operation

				console.error('Failed to fetch bills:', error);
			})
			.finally(() => {
				// Actions that should happen after the promise is settled (either fulfilled or rejected)
				// This might still log an outdated state due to the async nature of setBills
				console.log('Bills:', bills);
				prevSubjectRef = billSubject;
				setIsButtonClicked(false);
			});
	};

	useEffect(() => {
		fetchBillsBySubject();
	}, [isButtonClicked, subjectOffset]);

	useEffect(() => {
		Requests.getCongressMembers(user.zipcode)

			.then((data) => {
				console.log('Data received:', data);
				return (
					setHouseReps(
						data.results.filter(
							(member: CongressMember[]) => member.district !== ''
						)
					),
					setSenators(
						data.results.filter(
							(member: CongressMember[]) => member.district === ''
						)
					),
					setCongressMembers(data.results)
				);
			})
			.catch((error) => {
				console.error('Fetch error:', error.message); // Display the error message
				if (error.response) {
					// Check if a response exists
					console.error('Response status:', error.response.status);
					console.error('Response text:', error.response.statusText);
				}
			});
	}, []);

	const getRecentRollCallVotes = async (date: string, chamber: string) => {
		let relevantVotes: [] = [];

		try {
			let currentDate = new Date(date);
			const today = new Date().toISOString().split('T')[0];
			do {
				const createDateWindow = (date) => {
					const startDate = new Date(date); // This is sufficient to copy the original date
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
					console.log('Date Window:', dateWindow);

					return { dateWindow, newStartDate: endDate };
				};
				const { dateWindow, newStartDate } = createDateWindow(currentDate);
				const rollCalls = await Requests.getVotesByDate(dateWindow, chamber);
				console.log('Roll Calls:', rollCalls);

				if (rollCalls.results.votes.length) {
					// Use .filter to find all relevant votes
					const filteredVotes = rollCalls.results.votes.filter(
						(vote: { bill?: { number: string } }) =>
							vote?.bill?.number === billNumber
					);

					// Concatenate filtered votes to relevantVotes
					relevantVotes = [...relevantVotes, ...filteredVotes];

					console.log('Filtered Roll Call Votes:', filteredVotes);
				}

				currentDate = newStartDate.toISOString().split('T')[0];
				console.log('Current Date:', currentDate, today);
			} while (currentDate <= today); // Adjust the loop condition appropriately
		} catch (error) {
			console.error('Failed to fetch votes:', error);
		}

		return relevantVotes; // Return the array of relevant votes
	};

	const getMemberVote = async (
		billNumber: string,
		date: string,
		chamber: string
	) => {
		const relevantVotes = await getRecentRollCallVotes(date, chamber);
		const lastVoteOnBill = relevantVotes[0];
		console.log('Relevant Vote:', lastVoteOnBill);

		// Add type annotations to relevantVote object
		interface RelevantVote {
			congress: string;
			session: string;
			roll_Call: string;
		}
		console.log('Last Vote on Bill:', lastVoteOnBill);
		const rollCallInfoOfLastVote = await Requests.getRollCallVotes(
			lastVoteOnBill?.congress,
			chamber,
			lastVoteOnBill?.session,
			lastVoteOnBill?.roll_call
		);
		console.log('Roll Call Info:', rollCallInfoOfLastVote);
		houseReps.map((member) => {
			const memberVote =
				rollCallInfoOfLastVote.results.votes.vote.positions.find(
					(position) => position.name.slice(0, 6) === member.name.slice(0, 6) //Temporary until i fix Nydia Velazquez
				)?.vote_position;

			setVotes((prevVotes: { key: string; vote: string }[]) => [
				...prevVotes,
				{ key: `${member.name}-${billNumber}`, vote: memberVote },
			]);
			console.log('Member Vote:', memberVote, member.name, billNumber);
		});
	};

	return (
		<>
			<div className='top-nav'>
				<img
					src='src/assets/main-logo.png'
					alt='Delegator Logo'
				/>
				<div className='top-nav-user'>
					<h4>{user.username}</h4>
					<h5>Zipcode: {user.zipcode}</h5>
					<button onClick={logOut}>Log Out</button>
				</div>
			</div>
			<div className='rep-container'>
				<h2>118th Congress</h2>
				<div className='repChamber'>
					<div className='selectors'>
						{/* This should display the favorited count */}
						<div
							className={`selector ${
								chamber === 'House Representatives' ? 'active' : ''
							}`}
							onClick={() => {
								setChamber('House Representatives'); // Ensure consistent naming with state value
							}}>
							House Reps
						</div>

						{/* This should display the unfavorited count */}
						<div
							className={`selector ${chamber === 'Senate' ? 'active' : ''}`}
							onClick={() => {
								setChamber('Senate');
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
				<section className='rep-section'>
					<h2>{chamber}:</h2>
					<div className='reps'>
						{congressMembers
							.filter((member) => {
								switch (chamber) {
									case 'House Representatives':
										return member.district !== '';

									case 'Senate':
										return member.district === '';
									case 'both':
										return congressMembers;
								}
							})
							.map((member, index) => {
								return (
									<div
										className='rep-card'
										key={index}>
										<h3 className='font-face-Barlow'>
											{member.name.toUpperCase()}
										</h3>
										<span>Party: {member.party}</span>
										<span>District: {member.district}</span>
										<span>State: {member.state}</span>
										<span>Phone: {member.phone}</span>
										<span>
											Link: <a href={member.link}>{member.link}</a>
										</span>
									</div>
								);
							})}
					</div>
				</section>
			</div>

			<div className='bill-container'>
				<div className='subject'>
					<div className='selectors'>
						{/* This should display the favorited count */}
						<div
							className={`selector ${searchType === 'policy' ? 'active' : ''}`}
							onClick={() => {
								setSearchType('policy');
							}}>
							Search by Policy
						</div>

						{/* This should display the unfavorited count */}
						<div
							className={`selector ${
								searchType === 'legislative-term' ? 'active' : ''
							}`}
							onClick={() => {
								setSearchType('legislative-term');
							}}>
							Search by Legislative Term
						</div>
						<div
							className={`selector ${
								searchType === 'bill-number' ? 'active' : ''
							}`}
							onClick={() => {
								setSearchType('bill-number');
							}}>
							Search by Bill Number
						</div>
					</div>

					<div className='subject-fields'>
						{searchType === 'policy' && (
							<select
								disabled={isButtonClicked}
								onChange={(e) => {
									setBillSubject(e.target.value);
									setIsButtonClicked(true);

									console.log('Bills:', bills);
								}}>
								<option value='Agriculture and Food'>
									Agriculture and Food
								</option>
								<option value='Animals'>Animals</option>
								<option value='Armed Forces and National Security'>
									Armed Forces and National Security
								</option>
								<option value='Arts, Culture, Religion'>
									Arts, Culture, Religion
								</option>
								<option value='Civil Rights and Liberties, Minority Issues'>
									Civil Rights and Liberties, Minority Issues
								</option>
								<option value='Commerce'>Commerce</option>
								<option value='Congress'>Congress</option>
								<option value='Crime and Law Enforcement'>
									Crime and Law Enforcement
								</option>
								<option value='Economics and Public Finance'>
									Economics and Public Finance
								</option>
								<option value='Education'>Education</option>
								<option value='Emergency Management'>
									Emergency Management
								</option>
								<option value='Energy'>Energy</option>
								<option
									value='Environmental Protection
'>
									Environmental Protection
								</option>
								<option value='Families'>Families</option>
								<option value='Finance and Financial Sector'>
									Finance and Financial Sector
								</option>
								<option value='Foreign Trade and International Finance'>
									Foreign Trade and International Finance
								</option>
								<option value='Government Operations and Politics'>
									Government Operations and Politics
								</option>
								<option value='Health'>Health</option>
								<option value='Housing and Community Development'>
									Housing and Community Development
								</option>
								<option value='Immigration'>Immigration</option>
								<option value='International Affairs'>
									International Affairs
								</option>
								<option value='Labor and Employment'>
									Labor and Employment
								</option>
								<option value='Law'>Law</option>
								<option value='Native Americans'>Native Americans</option>
								<option value='Public Lands and Natural Resources'>
									Public Lands and Natural Resources
								</option>
								<option value='Science, Technology, Communications'>
									Science, Technology, Communications
								</option>
								<option value='Social Sciences and History'>
									Social Sciences and History
								</option>
								<option
									value='Social Welfare
'>
									Social Welfare
								</option>
								<option value='Sports and Recreation'>
									Sports and Recreation
								</option>
								<option value='Taxation'>Taxation</option>
								<option value='Transportation and Public Works'>
									Transportation and Public Works
								</option>
								<option value='Water Resources Development'>
									Water Resources Development
								</option>
								<option defaultValue='default'>
									{billSubject
										? billSubject
										: 'Select a subject by suggested policy terms'}
								</option>
							</select>
						)}
						{searchType === 'legislative-term' && (
							<div className='legislative-term'>
								<label htmlFor='leg-term'>Type legislative term: &ensp; </label>
								<div id='leg-term'>
									<input
										type='text'
										placeholder='Search for bills by legislative term'
										disabled={isButtonClicked}
										onChange={(e) => {
											setBillSubject(e.target.value);
										}}></input>

									<a href='https://www.congress.gov/advanced-search/legislative-subject-terms?congresses%5B%5D=118'>
										List of Acceptable Terms
									</a>
									<button
										disabled={isButtonClicked}
										onClick={() => {
											setIsButtonClicked(true);
										}}>
										Search
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className='subject-banner'>
					<button
						disabled={isButtonClicked}
						onClick={() => setFilterPassedBills(!filterPassedBills)}>
						{filterPassedBills ? 'Show All Bills' : 'Filter Passed Bills'}
					</button>
					{isButtonClicked ? (
						<div>Loading...</div>
					) : bills.length === 0 && billSubject !== '' ? (
						<div>Couldn't fulfill request at this time</div>
					) : billSubject === '' ? (
						<h2>Most Recent Bills</h2>
					) : (
						<h2>
							House Bills: {billSubject}
							{subjectOffset}
						</h2>
					)}
					<button
						onClick={() => {
							setSubjectOffset((subjectOffset) => subjectOffset + 20);
							console.log('bills:', bills);
						}}>
						Load More Bills
						<FontAwesomeIcon icon={faArrowRight} />
					</button>
				</div>

				<table>
					<thead>
						<tr key='header'>
							<th key='bill_number'>Number</th>

							<th key='title'>Title</th>

							<th key='summary'>Summary</th>
							<th key='last-action'>Last Action</th>
							<th key='bill_passage'>Bill Passage</th>
							{houseReps.map((member, index) => {
								if (member.district !== '') {
									return <th key={`${member.id}-${index}`}>{member.name}</th>;
								}
								return []; // Return an empty array when the condition is not met
							})}
							<th>Your vote</th>
						</tr>
					</thead>
					<tbody>
						{bills.map((bill, index) => (
							<tr key={`${bill.bill_id}-${index}`}>
								{bill.number.slice(0, 1) === 'H' &&
									(!filterPassedBills || bill.house_passage !== null) &&
									bill.active && (
										<>
											<td key={1}>
												<b>{bill.number}</b>
											</td>
											<td key={2}>
												<div>
													<em>{bill.title}</em>
												</div>
											</td>
											<td
												key={3}
												className='bill-summary'>
												<div>
													{bill?.summary || (
														<a href={bill.congressdotgov_url}>
															{bill.congressdotgov_url}
														</a>
													)}
												</div>
											</td>
											<td
												key={4}
												className='bill-summary-title'>
												<b>{bill.latest_major_action_date}</b>
												<div>{bill.latest_major_action}</div>
											</td>
											{bill.house_passage !== null ? (
												<td key={5}>{bill.house_passage}</td>
											) : (
												<td key={5}>Not passed</td>
											)}
											{houseReps.map(
												(member) => (
													(billNumber = bill.number),
													(introducedDate = bill.introduced_date),
													(memberName = member.name),
													(
														// Fragment to wrap multiple elements without adding extra nodes to the DOM

														<td key={`${member.name}-${bill.bill_id}`}>
															<div>
																{bill.house_passage === null &&
																bill.vetoed === null
																	? 'Waiting on next vote'
																	: bill.house_passage !== null && voted
																	? votes.find(
																			(obj) =>
																				obj.key ===
																				`${member.name}-${billNumber}`
																	  )?.vote
																	: "Vote to see member's vote"}
															</div>
														</td>
													)
												)
											)}
											<td>
												<div>Vote</div>
												<button
													onClick={() => {
														console.log(memberName, billNumber, introducedDate);
														getMemberVote(
															bill.number,
															bill.introduced_date,
															'house'
														);
														setVoted(true);
													}}>
													Vote
												</button>
											</td>
										</>
									)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}

export default App;

/*				<div className='subject-banner'>
					<button onClick={() => setFilterPassedBills(!filterPassedBills)}>
						{filterPassedBills ? 'Show All Bills' : 'Filter Passed Bills'}
					</button>
					<h2>
						House Bills: {billSubject}
						{subjectsubjectOffset}
					</h2>
					<button
						onClick={() => {
							setsubjectsubjectOffset((subjectsubjectOffset) => subjectsubjectOffset + 20);
						}}>
						Load More Bills
						<FontAwesomeIcon icon={faArrowRight} />
					</button>
				</div>
				<h2>Senate Bills</h2>
				<table>
					<thead>
						<tr key='sen-header'>
							<th>Number</th>

							<th>Title</th>

							<th>Summary</th>
							<th>Last Action</th>
							<th>Bill Passage</th>
							{houseReps.map((member) => {
								if (member.district !== '') {
									return <th>{member.name}</th>;
								}
								return []; // Return an empty array when the condition is not met
							})}
							<th>Your vote</th>
						</tr>
					</thead>

					<tbody>
						{bills.map((bill) => (
							<tr key={bill.bill_id}>
								{bill.number.slice(0, 1) === 'S' &&
									(!filterPassedBills || bill?.house_passage !== null) && (
										<>
											<td>
												<b>{bill.number}</b>
											</td>
											<td>
												<div>
													<em>{bill.title}</em>
												</div>
											</td>
											<td className='bill-summary'>
												<div>{bill.summary}</div>
											</td>
											<td className='bill-summary-title'>
												<b>{bill.latest_major_action_date}</b>
												<div>{bill.latest_major_action}</div>
											</td>
											{bill.house_passage !== null ? (
												<td>{bill.house_passage}</td>
											) : (
												<td>Not passed</td>
											)}
											{houseReps.map((member) => {
												if (member.district !== '') {
													return (
														<td>
															<select>
																<option value='Yea'>Yea</option>
																<option value='Nay'>Nay</option>
																<option value='Abstain'>Abstain</option>
															</select>
														</td>
													);
												}
												return []; // Return an empty array when the condition is not met
											})}
											<td>
												<select>
													<option value='Yea'>Yea</option>
													<option value='Nay'>Nay</option>
													<option value='Abstain'>Abstain</option>
												</select>
											</td>
										</>
									)}
							</tr>
						))}
					</tbody>
				</table>*/
