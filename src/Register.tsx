import { Link } from 'react-router-dom';
import React, { ComponentProps, useState } from 'react';
import { Requests } from './api';
import toast from 'react-hot-toast';
import { useAuthInfo } from './Providers/AuthProvider';
import { ErrorMessage } from './Utils/errorMesssages';
import { isEmailValid, isZipcodeValid, isNameValid } from './Utils/validations';
import { User, CongressMember, ProPublicaMember } from './types';
import { useNavigate } from 'react-router-dom';

// Import the 'CongressMember' type from the appropriate module

type GoogleDataType = {
	name: string;
	office: string;
	officials: CongressMember[];
};
type CongressDataType = CongressMember[];

export function RegisterInput({
	labelText,
	inputProps,
}: {
	labelText: string;
	inputProps: ComponentProps<'input'>;
}) {
	return (
		<div className='input-wrap'>
			<label>{labelText}:</label>

			<input {...inputProps} />
		</div>
	);
}

export const Register = () => {
	const { user, setUser } = useAuthInfo(); //user setUser
	const { username, email, password, address, representatives } = user;
	const { street, city, state, zipcode } = address;
	const [confirm, setConfirm] = useState('');
	const [userNameExists, setUserNameExists] = useState(false);
	const [isFormSubmitted, setIsFormSubmitted] = useState(false);
	const [takenName, setTakenName] = useState('');

	const doesUserExist = async (uname: string) =>
		await Requests.getAllUsers().then((users) =>
			users.some((user: User) => user.username === uname)
		);

	let congressDataGoogle: GoogleDataType = {
		name: '',
		office: '',
		officials: [],
	};

	let congressDataCongressGov: CongressDataType = [];
	let congressDataProPublica: ProPublicaMember[] = [];

	const nameErrorMessage = 'Name is Invalid';
	const existsErrorMessage = `Username ${takenName} already exists`;
	const emailErrorMessage = 'Email is Invalid';
	const zipcodeErrorMessage = 'Zip code is Invalid';
	const navigate = useNavigate();

	const getMemberBios = async () => {
		congressDataGoogle = await Requests.getCongressMembers(
			`${street} ${city} ${state} ${zipcode}`
		); // Google civic api call
		const congressDataProPublicaSenate =
			await Requests.getCongressMembersProPublica('senate', '118');
		console.log('congressDataProPublicaSenate:', congressDataProPublicaSenate);
		const congressDataProPublicaHouse =
			await Requests.getCongressMembersProPublica('house', '118');
		console.log('congressDataProPublicaHouse:', congressDataProPublicaHouse);
		congressDataProPublica = [
			congressDataProPublicaHouse.results[0].members,
			congressDataProPublicaSenate.results[0].members,
		].flatMap((result) => result);

		//Congresss.gov api call only allows for 20 members per call, so need to loop through until all members are fetched
		for (let offset = 0; congressDataCongressGov.length < 555; offset += 20) {
			const response = await Requests.getCongressMembersBioIds(offset);
			const newCongressRecord = response.members;

			if (newCongressRecord.length === 0) break;

			congressDataCongressGov = [
				...congressDataCongressGov,
				...newCongressRecord,
			];
		}
		console.log(
			'congressDataCongressGov:',
			congressDataCongressGov,
			congressDataProPublica
		);

		return {
			congressDataGoogle,
			congressDataCongressGov,
			congressDataProPublica,
		};
	};

	const normalizeName = (name: string) => {
		//Names are in separate formats in each of the data structures, so this function normalizes the name
		const nameParts = name.replace(',', '').split(' ');
		const firstName = nameParts.length > 2 ? nameParts[1] : '';
		const adjustedFirstName =
			firstName[0] === ' ' ? firstName.slice(1) : firstName;

		return `${adjustedFirstName} ${nameParts[nameParts.length - 1]} ${
			nameParts[0]
		}`;
	};

	const mergeMemberBioObjects = (member: CongressMember) => {
		const memberName = member.name;
		const memberObject1 = congressDataCongressGov.find((member) => {
			if (
				normalizeName(member.name)
					.toLowerCase()
					.includes(memberName.toLowerCase())
			) {
				return member;
			}
		});

		const memberObject2 = congressDataProPublica.find(
			(member: ProPublicaMember) => {
				const fullName = `${member.first_name}${
					member.middle_name ? ' ' + member.middle_name + ' ' : ' '
				}${member.last_name}`.trim();
				return fullName === memberName;
			}
		);

		const mergedObjectArray: CongressMember[] = [];

		const mergedMember: CongressMember = {
			...memberObject1,
			...memberObject2,
			...member,
		};
		mergedObjectArray.push(mergedMember);

		return mergedMember;
	};

	async function addNewRepresentatives(reps: CongressMember[]) {
		try {
			const existingRepresentatives = await Requests.checkExistingReps();
			const existingIds = new Set(
				existingRepresentatives.map((rep: CongressMember) => rep.name)
			);

			for (const rep of reps) {
				if (!existingIds.has(rep.name)) {
					const postedRep = await Requests.postNewReps(rep);
					console.log('Added:', postedRep);
				}
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsFormSubmitted(true);
		const userExists = await doesUserExist(username);

		setUserNameExists(userExists);

		getMemberBios()
			.then(
				(data: {
					congressDataGoogle: GoogleDataType;
					congressDataCongressGov: CongressDataType;
					congressDataProPublica: ProPublicaMember[];
				}) => {
					console.log('Data2 received:', data);
					const repNames: string[] = [];
					const filteredRepresentatives: CongressMember[] = [];
					data.congressDataGoogle.officials.forEach(
						(member: CongressMember) => {
							if (member.bioguideId) {
								const mergedMember = mergeMemberBioObjects(member);
								filteredRepresentatives.push(mergedMember);
								repNames.push(mergedMember.name);
							}
						}
					);

					setUser({ ...user, representatives: repNames });
					addNewRepresentatives(filteredRepresentatives);
				}
			)
			.catch((error) => {
				console.error('Fetch error:', error.message); // Display the error message
				if (error.response) {
					// Check if a response exists
					console.error('Response status:', error.response.status);
					console.error('Response text:', error.response.statusText);
				}
			});
		if (
			!isNameValid(username) ||
			!isEmailValid(email) ||
			!isZipcodeValid(zipcode) ||
			userNameExists ||
			representatives.length === 0
		) {
			setTakenName(username);
			return;
		}

		Requests.register(username, email, password, address, representatives as [])
			.then(() => {
				setUser({
					username: '',
					email: '',
					password: '',
					address: {
						street: '',
						city: '',
						state: '',
						zipcode: '',
					},
					representatives: [],
				});

				setIsFormSubmitted(false);
				setTakenName('');
				toast.success('Registration successful');
				navigate('../');
			})
			.catch((error) => {
				console.log('Response received:', error);
				console.error('Fetch error:', error.message);
			});
	};

	return (
		<>
			<Link to='/'>
				<button type='submit'>Home</button>
			</Link>
			<form
				className='register-field'
				onSubmit={handleRegister}>
				<RegisterInput
					labelText='Username'
					inputProps={{
						placeholder: 'Boogey',
						onChange: (e) => setUser({ ...user, username: e.target.value }),
						value: username,
					}}
				/>
				{isFormSubmitted &&
					(!isNameValid(username) ? (
						<ErrorMessage
							message={nameErrorMessage}
							show={true}
						/>
					) : isNameValid(username) && takenName === username ? (
						<ErrorMessage
							message={existsErrorMessage}
							show={userNameExists}
						/>
					) : null)}
				<RegisterInput
					labelText='Email'
					inputProps={{
						placeholder: 'HarrietT@email.com',
						onChange: (e) => setUser({ ...user, email: e.target.value }),
						value: email,
					}}
				/>
				{isFormSubmitted && (
					<ErrorMessage
						message={emailErrorMessage}
						show={!isEmailValid(email)}
					/>
				)}
				<RegisterInput
					labelText='Password'
					inputProps={{
						placeholder: 'Password',
						onChange: (e) => setUser({ ...user, password: e.target.value }),
						value: password,
					}}
				/>
				<RegisterInput
					labelText='Confirm Password'
					inputProps={{
						placeholder: 'Confirm Password',
						onChange: (e) => {
							setConfirm(e.target.value);
						},
						value: confirm,
					}}
				/>
				{isFormSubmitted && (
					<ErrorMessage
						message={'Passwords do not match'}
						show={!!password && password !== confirm}
					/>
				)}
				<h4>
					Give us your address and we'll find your representatives for you.
				</h4>
				<RegisterInput
					labelText={`Street Address`}
					inputProps={{
						placeholder: '123 Main St.',
						onChange: (e) =>
							setUser({
								...user,
								address: { ...user.address, street: e.target.value },
							}),
						value: user.address.street,
					}}
				/>

				<RegisterInput
					labelText={`City or Town`}
					inputProps={{
						placeholder: 'New York',
						onChange: (e) =>
							setUser({
								...user,
								address: {
									...user.address,
									city: e.target.value,
								},
							}),
						value: city,
					}}
				/>
				<RegisterInput
					labelText={`State`}
					inputProps={{
						placeholder: 'NY',
						onChange: (e) =>
							setUser({
								...user,
								address: { ...user.address, state: e.target.value },
							}),
						value: state,
					}}
				/>
				<RegisterInput
					labelText={`Zipcode`}
					inputProps={{
						placeholder: '12345',
						onChange: (e) =>
							setUser({
								...user,
								address: { ...user.address, zipcode: e.target.value },
							}),
						value: zipcode,
					}}
				/>
				{isFormSubmitted && (
					<ErrorMessage
						message={zipcodeErrorMessage}
						show={!isZipcodeValid(zipcode)}
					/>
				)}
				<button type='submit'>Submit</button>
			</form>
		</>
	);
};
