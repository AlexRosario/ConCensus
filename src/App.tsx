import './App.css';
import { Requests } from './api.tsx';
import { useEffect, useState } from 'react';
import { useAuthInfo } from './Providers/AuthProvider.tsx';
import { Routes, Route } from 'react-router-dom';

function App() {
	const [bills, setBills] = useState<HouseBill[]>([]);
	const [houseReps, setHouseReps] = useState<CongressMember[]>([]);
	const [senators, setSenators] = useState<CongressMember[]>([]);
	const [billSubject, setBillSubject] = useState<string>('');

	const userString = localStorage.getItem('user');
	const user = userString ? JSON.parse(userString) : '';
	const logOut = () => {
		localStorage.removeItem('user');
		window.location.href = '/';
	};

	useEffect(() => {
		const fetchBillsBySubject = async (subject) => {
			let billsPassed = [];
			let offset = 0;
			let hasMore = true;

			while (billsPassed.length < 20 && hasMore) {
				try {
					const data = await Requests.getBillsBySubject(subject, offset);
					const passedBills = data.results.filter(
						(bill) => bill.house_passage !== '' || bill.house_passage !== null
					);
					billsPassed = [...billsPassed, ...passedBills];
					offset += 20; // Assuming the API returns 20 results per call, adjust accordingly
					hasMore = passedBills.length > 0; // Update this based on actual API response structure and logic
				} catch (error) {
					console.error('Fetch error:', error);
					hasMore = false; // Stop the loop in case of an error
				}
			}

			// Update state only once after collecting enough bills
			setBills(billsPassed.slice(0, 20));
		};

		if (billSubject) {
			fetchBillsBySubject(billSubject);
		}
	}, [billSubject]);

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
				<h2>Search for Bills by Subject</h2>
				<div className='selectors'>
					{/* This should display the favorited count */}
					<div
						className={`selector ${billSubject === 'health' ? 'active' : ''}`}
						onClick={() => {
							setBillSubject('health');
						}}>
						Bills on Health
					</div>

					{/* This should display the unfavorited count */}
					<div
						className={`selector ${billSubject === 'war' ? 'active' : ''}`}
						onClick={() => {
							setBillSubject('war');
						}}>
						Bills on War
					</div>
					<div
						className={`selector ${
							billSubject === 'education' ? 'active' : ''
						}`}
						onClick={() => {
							setBillSubject('education');
						}}>
						Bills on Education
					</div>
				</div>
				<h2>House Bills</h2>
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
					{bills.map((bill) => (
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
									{bill.house_passage ? (
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
