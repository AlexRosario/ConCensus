import { Link } from 'react-router-dom';
import React, { ComponentProps, useState } from 'react';
import { Requests } from './api';
import toast from 'react-hot-toast';
import { useAuthInfo } from './Providers/AuthProvider';
import { ErrorMessage } from './Utils/errorMesssages';
import { isEmailValid, isZipcodeValid, isNameValid } from './Utils/validations';
import { User } from './types';
import { useNavigate } from 'react-router-dom';
import { useDisplayMember } from './Providers/MemberProvder';

type YourDataType = {
	name: string;
	office: string;
	officials: CongressMember[];
};

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
	const { username, email, password, zipcode } = user;
	const [confirm, setConfirm] = useState('');
	const [userNameExists, setUserNameExists] = useState(false);

	const [isFormSubmitted, setIsFormSubmitted] = useState(false);

	const [takenName, setTakenName] = useState('');
	const { congressMembers, setCongressMembers, setSenators, setHouseReps } =
		useDisplayMember();
	const doesUserExist = async (uname: string) =>
		await Requests.getAllUsers().then((users) =>
			users.some((user: User) => user.username === uname)
		);

	let congressDataGoogle: YourDataType[] = [];
	let congressDataCongressGov: YourDataType[] = [];
	const mergedObjectArray: YourDataType[] = [];

	const getMemberBios = async () => {
		congressDataGoogle = await Requests.getCongressMembers(zipcode); // Google civic api call

		let offset = 0; //Congresss.gov api call only allows for 20 members per call, so need to loop through until all members are fetched
		do {
			const response = await Requests.getCongressMembersBioIds(offset);
			const newCongressRecord = response.members;

			congressDataCongressGov = [
				...congressDataCongressGov,
				...newCongressRecord,
			];

			if (newCongressRecord.length === 0) break;
			offset += 20;
		} while (congressDataCongressGov.length < 555);

		return { congressDataGoogle, congressDataCongressGov };
	};
	const normalizeName = (name: string) => {
		let nameParts = name.replace(',', '').split(' ');
		const firstName = nameParts.length > 2 ? nameParts[1] : '';
		const adjustedFirstName =
			firstName[0] === ' ' ? firstName.slice(1) : firstName;

		return `${adjustedFirstName} ${nameParts[nameParts.length - 1]} ${
			nameParts[0]
		}`;
	};

	const mergeMemberBioObjects = (member: YourDataType) => {
		const memberName = member.name;
		const memberObject2: YourDataType = congressDataCongressGov.find(
			(member) => {
				if (
					normalizeName(member.name)
						.toLowerCase()
						.includes(memberName.toLowerCase())
				) {
					return member;
				}
			}
		);

		if (memberObject2) {
			const mergedMember = { ...memberObject2, ...member };
			console.log('Merged Member:', mergedMember);
			mergedObjectArray.push(mergedMember);
		} else {
			mergedObjectArray.push(member);
			console.log('unmergedMember:', member);
		}
		console.log('Merged Object Array:', mergedObjectArray);
		return mergedObjectArray;
	};

	const nameErrorMessage = 'Name is Invalid';
	const existsErrorMessage = `Username ${takenName} already exists`;
	const emailErrorMessage = 'Email is Invalid';
	const zipcodeErrorMessage = 'Zip code is Invalid';
	const navigate = useNavigate();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsFormSubmitted(true);
		const userExists = await doesUserExist(username);
		setUserNameExists(userExists);
		getMemberBios()
			.then((data) => {
				console.log('Data2 received:', data);
				data.congressDataGoogle.officials.forEach((member) => {
					mergeMemberBioObjects(member);
				}),
					setCongressMembers(
						mergedObjectArray.filter(
							(member) =>
								member.urls[0].includes('.house.gov') ||
								member.urls[0].includes('.senate.gov')
						)
					),
					setHouseReps(
						mergedObjectArray.filter((member: CongressMember[]) =>
							member.urls[0].includes('.house.gov')
						)
					),
					setSenators(
						mergedObjectArray.filter((member: CongressMember[]) =>
							member.urls[0].includes('.senate.gov')
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
		if (
			!isNameValid(username) ||
			!isEmailValid(email) ||
			!isZipcodeValid(zipcode) ||
			userNameExists ||
			congressMembers.length === 0
		) {
			setTakenName(username);
			return;
		}

		Requests.register(username, email, password, zipcode, congressMembers)
			.then(() => {
				setUser({
					username: '',
					email: '',
					password: '',
					zipcode: '',
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
				<RegisterInput
					labelText={`Give us your zip code and we'll find your representatives for you`}
					inputProps={{
						placeholder: '12345',
						onChange: (e) => setUser({ ...user, zipcode: e.target.value }),
						value: zipcode,
					}}
				/>
				{isFormSubmitted && (
					<ErrorMessage
						message={zipcodeErrorMessage}
						show={!isZipcodeValid(zipcode) || congressMembers.length === 0}
					/>
				)}

				<button type='submit'>Submit</button>
			</form>
		</>
	);
};
