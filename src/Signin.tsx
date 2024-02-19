import React from 'react';
import { Requests } from './api';
import toast from 'react-hot-toast';
import { User } from './types';
import { useNavigate } from 'react-router-dom';

export const SignIn = () => {
	const [name, setName] = React.useState('');
	const [pWord, setPWord] = React.useState('');
	const navigate = useNavigate();

	const handleSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		Requests.getAllUsers()
			.then((users) =>
				users.find((user: User) => {
					return user.username === name && user.password === pWord;
				})
			)
			.then((user) => {
				console.log('Data received:', user);
				localStorage.setItem('user', JSON.stringify(user));
				navigate('/App');
			})
			.catch((err) => {
				toast.error('Sign in failed');
				return console.error('Fetch error:', err.message);
			});

		console.log('Sign in');
	};
	return (
		<>
			<form
				className='sign-in-field'
				onSubmit={(e) => {
					handleSignIn(e);
				}}>
				<input
					className='name'
					type='text'
					name='name'
					placeholder='Username'
					value={name}
					onChange={(e) => setName(e.target.value)}></input>

				<input
					className='password'
					type='text'
					name='password'
					placeholder='Password'
					value={pWord}
					onChange={(e) => setPWord(e.target.value)}></input>

				<button type='submit'>Sign In</button>
			</form>
		</>
	);
};
