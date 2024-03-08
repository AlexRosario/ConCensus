import './App.css';
import { Requests } from './api.tsx';
import { useEffect, useState, useRef } from 'react';
import { useAuthInfo } from './Providers/AuthProvider.tsx';
import { Routes, Route } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { DiVim } from 'react-icons/di';

function App() {
	const [bills, setBills] = useState<HouseBill[]>([]);
	const [houseReps, setHouseReps] = useState<CongressMember[]>([]);
	const [senators, setSenators] = useState<CongressMember[]>([]);
	const [billSubject, setBillSubject] = useState<string>('');
	const [isButtonClicked, setIsButtonClicked] = useState(false);
	const userString = localStorage.getItem('user');
	const user = userString ? JSON.parse(userString) : '';
	const [passed, setPassed] = useState(false);
	const [offset, setOffset] = useState(0);
	const [filterPassedBills, setFilterPassedBills] = useState(false);
	const [searchType, setSearchType] = useState('');
	const [camera, setCamera] = useState('House' || 'Senate' || 'All');
	const prevSubjectRef = useRef<string>();
	const houseBills = bills.filter((bill) => bill.number.slice(0, 1) === 'H');
	const senateBills = bills.filter((bill) => bill.number.slice(0, 1) === 'S');
	const isLoading = false;

	const logOut = () => {
		localStorage.removeItem('user');
		window.location.href = '/';
	};
	const handleSubmit = () => {
		setIsButtonClicked(true);
	};
	const fetchBillsBySubject = () => {
		if (prevSubjectRef.current !== billSubject) {
			setBills([]);
			setOffset(0);
		}

		Requests.getBillsBySubject(billSubject, offset)
			.then((data) => {
				// Check if the subject has changed, if so reset the bills array and offset

				// Logic to update the state based on the new data
				if (offset === 0) {
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
				prevSubjectRef.current = billSubject;
				setIsButtonClicked(false);
			});
	};

	useEffect(() => {
		fetchBillsBySubject();
	}, [billSubject, offset]);

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
					)
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
		/*Requests.getBillsBySubject('health').then((data) => {
			return setBills(data.results);
		});*/
	}, []);

	return (
		<>
			<div className='top-nav'>
				<h1>Representatives for {user.username}</h1>
				<button onClick={logOut}>Log Out</button>
			</div>

			<h2>Zipcode: {user.zipcode}</h2>
			<h2>House Representatives:</h2>
			<div className='reps'>
				{houseReps.map((member, index) => {
					return (
						<div
							className='rep-card'
							key={index}>
							<span>{member.name}</span>
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

			<h2>Senators:</h2>
			<div className='reps'>
				{senators.map((member, index) => {
					if (member.district === '') {
						return (
							<div
								className='rep-card'
								key={index}>
								<span>{member.name}</span>
								<span>Party: {member.party}</span>
								<span>State: {member.state}</span>
								<span>Phone: {member.phone}</span>
								<span>
									Link: <a href={member.link}>{member.link}</a>
								</span>
							</div>
						);
					}
				})}
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
									setIsButtonClicked(true);
									setBillSubject(e.target.value);

									console.log(bills);
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
					) : bills.length === 0 ? (
						<div>Couldn't fulfill request at this time</div>
					) : (
						<h2>
							House Bills: {billSubject}
							{offset}
						</h2>
					)}
					<button
						onClick={() => {
							setOffset((offset) => offset + 20);
						}}>
						Load More Bills
						<FontAwesomeIcon icon={faArrowRight} />
					</button>
				</div>

				<table>
					<thead>
						<tr key='house-header'>
							<th key='bill_number'>Number</th>

							<th key='title'>Title</th>

							<th key='summary'>Summary</th>
							<th key='last-action'>Last Action</th>
							<th key='bill_passage'>Bill Passage</th>
							{houseReps.map((member) => {
								if (member.district !== '') {
									return <th key={member.id}>{member.name}</th>;
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
												<div>
													{bill?.summary || (
														<a href={bill.congressdotgov_url}>
															{bill.congressdotgov_url}
														</a>
													)}
												</div>
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
						{offset}
					</h2>
					<button
						onClick={() => {
							setOffset((offset) => offset + 20);
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
