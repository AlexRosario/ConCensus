import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faChair, faLandmarkDome } from '@fortawesome/free-solid-svg-icons';
import { useScreenInfo } from './Providers/ScreenProvider';

export const Header = () => {
	const userString = localStorage.getItem('user');
	const user = userString ? JSON.parse(userString) : '';
	const logOut = () => {
		localStorage.removeItem('user');
		window.location.href = '/';
	};
	const { screenSelect, setScreenSelect } = useScreenInfo();

	return (
		<div className='main-nav'>
			<div className='top-nav'>
				<img
					src='src/assets/main-logo.png'
					alt='Delegator Logo'
				/>

				<div className='top-nav-user'>
					<h4>{user.username}</h4>
					<h5>Zipcode: {user.address.zipcode}</h5>
					<button onClick={logOut}>Log Out</button>
				</div>
			</div>
			<div className='bottom-nav'>
				<FontAwesomeIcon
					icon={faChair}
					className={`screenSelect ${screenSelect === 'reps' ? 'active' : ''}`}
					onClick={() => {
						setScreenSelect('reps');
					}}
				/>

				<FontAwesomeIcon
					icon={faLandmarkDome}
					className={`screenSelect ${screenSelect === 'bills' ? 'active' : ''}`}
					onClick={() => setScreenSelect('bills')}
				/>
			</div>
		</div>
	);
};
