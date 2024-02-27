import './App.css';
import { Requests } from './api.tsx';
import { useEffect, useState } from 'react';
import { useAuthInfo } from './Providers/AuthProvider.tsx';
import { Routes, Route } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

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
	let localSubject = '';

	const logOut = () => {
		localStorage.removeItem('user');
		window.location.href = '/';
	};
	const handleSubmit = () => {
		setIsButtonClicked(true); // Indicate that the button has been clicked.
	};

	useEffect(() => {
		const fetchBillsBySubject = async (subject) => {
			let hasMore = true;
			let billsArr = [];
			let localOffset = offset;

			if (passed) {
				while (billsArr.length < 20 && hasMore) {
					try {
						const data = await Requests.getBillsBySubject(subject, localOffset);
						const passedBills = data.results[0].bills.filter(
							(bill) => bill.house_passage !== null
						);
						billsArr = [...billsArr, ...passedBills];
						hasMore = !(data.length < 20);
						localOffset += 20;
					} catch (error) {
						console.error('Fetch error:', error);
						hasMore = false; // Stop the loop in case of an error
					}
				}

				setBills(billsArr);
			} else {
				const data = await Requests.getBillsBySubject(subject, offset);
				billsArr = [...billsArr, ...data.results[0].bills];

				setBills(billsArr);
			}
			setOffset(localOffset);
		};

		fetchBillsBySubject(billSubject);

		setIsButtonClicked(false);
	}, [isButtonClicked]);

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
					<h2>Search for Bills by Subject</h2>

					<div className='subject-fields'>
						<select
							onChange={(e) => {
								setBillSubject(e.target.value);
							}}>
							<option value='Agriculture and Food'>Agriculture and Food</option>
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
							<option value='Emergency Management'>Emergency Management</option>
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
							<option value='Labor and Employment'>Labor and Employment</option>
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
							<option
								value='default'
								selected>
								{billSubject
									? billSubject
									: 'Select a subject by suggested policy terms'}
							</option>
						</select>
						<div className='legislative-term'>
							<label htmlFor='leg-term'>Type legislative term: </label>
							<div id='leg-term'>
								<input
									type='text'
									placeholder='Search for bills by legislative term'
									onChange={(e) => {
										setBillSubject(e.target.value);
									}}></input>

								<a href='https://www.congress.gov/advanced-search/legislative-subject-terms?congresses%5B%5D=118'>
									List of Acceptable Terms
								</a>
							</div>
						</div>
					</div>

					<label>
						<input
							type='radio'
							value='Passed'
							checked={passed}
							onChange={() => {
								setPassed(true);
							}}
						/>
						Passed Bills
					</label>
					<label>
						<input
							type='radio'
							value='All'
							checked={!passed}
							onChange={() => {
								setPassed(false);
							}}
						/>
						All Bills
					</label>

					<button
						onClick={() => {
							setOffset(0);
							handleSubmit();
						}}>
						Submit Call
					</button>
				</div>
				<div className='selectors'>
					{/* This should display the favorited count */}
					<div
						className={`selector ${billSubject === 'Health' ? 'active' : ''}`}
						onClick={() => {
							setBillSubject('Health');
							handleSubmit();
						}}>
						Bills on Health
					</div>

					{/* This should display the unfavorited count */}
					<div
						className={`selector ${billSubject === 'War' ? 'active' : ''}`}
						onClick={() => {
							setBillSubject('War');
							handleSubmit();
						}}>
						Bills on War
					</div>
					<div
						className={`selector ${
							billSubject === 'Education' ? 'active' : ''
						}`}
						onClick={() => {
							setBillSubject('Education');
							handleSubmit();
						}}>
						Bills on Education
					</div>
				</div>
				<div className='subject-banner'>
					<button
						onClick={() => {
							if (offset >= 0) {
								setOffset(offset - 20);
								handleSubmit();
							}
						}}>
						<FontAwesomeIcon icon={faArrowLeft} />
						Prev
					</button>

					<h2>
						House Bills: {billSubject}
						{offset}
					</h2>
					<button
						onClick={() => {
							setOffset((offset) => offset + 20);
							handleSubmit();
						}}>
						Next
						<FontAwesomeIcon icon={faArrowRight} />
					</button>
				</div>

				<table>
					<tr>
						<th>Number</th>

						<th>Title</th>

						<th>Summary</th>
						<th>Bill Passage</th>
						{houseReps.map((member) => {
							if (member.district !== '') {
								return <th>{member.name}</th>;
							}
							return []; // Return an empty array when the condition is not met
						})}
						<th>Your vote</th>
					</tr>
					{bills.map((bill, key) => (
						<tr>
							{bill.number.slice(0, 1) === 'H' && (
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
				</table>
				<h2>Senate Bills</h2>
				{bills.map((bill, index) => {
					if (bill.number.slice(0, 1) === 'S') {
						return (
							<div
								className='rep-card'
								key={index}>
								<span>
									<b>{bill.number}</b>
								</span>
								<span>
									<em>{bill.title}</em>
								</span>
								<span>{bill.summary}</span>
							</div>
						);
					}
				})}
			</div>
		</>
	);
}

export default App;
