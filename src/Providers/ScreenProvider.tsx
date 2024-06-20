import { useContext, ReactNode, createContext, useState } from 'react';

export type ScreenContextType = {
	screenSelect: string;
	setScreenSelect: (screenSelect: string) => void;
};

const ScreenContext = createContext<ScreenContextType>({} as ScreenContextType);

export const ScreenProvider = ({ children }: { children: ReactNode }) => {
	const [screenSelect, setScreenSelect] = useState('reps');

	return (
		<ScreenContext.Provider value={{ screenSelect, setScreenSelect }}>
			{children}
		</ScreenContext.Provider>
	);
};
export const useScreenInfo = () => useContext(ScreenContext);
