export const Header = () => {
	const userString = localStorage.getItem('user');
	const user = userString ? JSON.parse(userString) : '';
	const logOut = () => {
		localStorage.removeItem('user');
		window.location.href = '/';
	};

	return (
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
	);
};
