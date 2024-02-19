import { useContext, ReactNode, createContext, useState } from 'react';

import { User } from '../types.tsx';

export type AuthContextType = {
	user: User;
	setUser: (register: User) => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User>({
		username: '',
		email: '',
		password: '',
		zipcode: '',
	});

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
};
export const useAuthInfo = () => useContext(AuthContext);
