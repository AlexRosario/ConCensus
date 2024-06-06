import './App.css';
import { Header } from './HeaderComponent.tsx';

import { MemberProvider } from './Providers/MemberProvder.tsx';
import { RepSection } from './RepComponents/RepSection.tsx';
import { BillSection } from './BillComponents/BillSection.tsx';
import '@fortawesome/fontawesome-free/css/all.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './fonts/BarlowCondensed-SemiBold.ttf';
import { useState } from 'react';

function App() {
	const [screenSelect, setScreenSelect] = useState('reps');

	return (
		<>
			<MemberProvider>
				<Header
					screenSelect={screenSelect}
					setScreenSelect={setScreenSelect}
				/>

				{screenSelect === 'reps' ? <RepSection /> : <BillSection />}
			</MemberProvider>
		</>
	);
}

export default App;

/*			
<table>
					<thead>
						<tr key='header'>
							<th key='bill_number'>Number</th>

							<th key='title'>Title</th>

							<th key='summary'>Summary</th>
							<th key='last-action'>Last Action</th>
							<th key='bill_passage'>Bill Passage</th>
							{congressMembers
								.filter((member) => {
									switch (chamber) {
										case 'house':
											return houseReps.includes(member);
										case 'senate':
											return senators.includes(member);
										case 'both':
											return congressMembers;
										default:
											return false;
									}
								})
								.map((member, index) => {
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
								{(!filterPassedBills || bill.enacted !== null) && (
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
										<td key={bill.id /* Assuming bill has an id for key }>
										<div>{getBillStatusMessage(bill)}</div>
										</td>

										{congressMembers
											.filter((member) => {
												switch (chamber) {
													case 'house':
														return houseReps.includes(member);
													case 'senate':
														return senators.includes(member);
													case 'both':
														return congressMembers;
													default:
														return false;
												}
											})
											.map(
												(member) => (
													(memberName = member.name),
													(
														<td key={`${member.name}-${bill.bill_id}`}>
															<div>
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
																				obj.key ===
																				`${member.name}-${bill.number}`
																	  )?.vote
																	: "Vote to see member's vote"}
															</div>
														</td>
													)
												)
											)}
										<td>
											<button
												onClick={() => {
													getMemberVote(
														bill.number,
														bill.introduced_date,
														memberName,
														'yea'
													);
													setVoted(true);
												}}>
												<FontAwesomeIcon icon={faThumbsUp} />
											</button>
											<button
												onClick={() => {
													getMemberVote(
														bill.number,
														bill.introduced_date,
														memberName,
														'nay'
													);
													setVoted(true);
												}}>
												<FontAwesomeIcon icon={faThumbsDown} />
											</button>
										</td>
									</>
								)}
							</tr>
						))}
					</tbody>
				</table>
<div className='subject-banner'>
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
				<h2>senate Bills</h2>
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
				</table>
/*useEffect(() => {
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
	}, []);*/
