import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Providers/AuthProvider';
import { Home } from './Home';
import { SignIn } from './Signin';
import { Register } from './Register';
import App from './App';
import { Toaster } from 'react-hot-toast';
import { BillProvider } from './Providers/BillProvider';
import { MemberProvider } from './Providers/MemberProvder';
import { ScreenProvider } from './Providers/ScreenProvider';
import ErrorBoundary from './Providers/ErrorProvider';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Home />,
		children: [
			{
				path: '/Signin',
				element: <SignIn />,
			},
		],
	},
	{
		path: '/Register',
		element: <Register />,
	},
	{
		path: '/App',
		element: <App />,
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Toaster />
		<AuthProvider>
			<ErrorBoundary>
				<ScreenProvider>
					<MemberProvider>
						<BillProvider>
							<RouterProvider router={router} />
						</BillProvider>
					</MemberProvider>
				</ScreenProvider>
			</ErrorBoundary>
		</AuthProvider>
	</React.StrictMode>
);
