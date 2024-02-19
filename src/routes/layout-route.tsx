import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../Providers/AuthProvider';
export default function AuthRoot() {
	return (
		<>
			{/* all the other elements */}
			<div id='detail'>
				<AuthProvider>
					<Outlet />
				</AuthProvider>
			</div>
		</>
	);
}
