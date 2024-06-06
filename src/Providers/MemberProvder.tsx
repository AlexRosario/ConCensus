import {
	useContext,
	ReactNode,
	createContext,
	useState,
	useEffect,
} from 'react';
import { CongressMember } from '../types.ts';
import { Requests } from '../api';

type MemberContextType = {
	congressMembers: CongressMember[];
	senators: CongressMember[];
	houseReps: CongressMember[];
	chamber: string;
	setChamber: (chamber: string) => void;
	representatives: CongressMember[];
};

export const MemberContext = createContext<MemberContextType>(
	{} as MemberContextType
);

export const MemberProvider = ({ children }: { children: ReactNode }) => {
	const [congressMembers, setCongressMembers] = useState<CongressMember[]>([]);
	const [senators, setSenators] = useState<CongressMember[]>([]);
	const [houseReps, setHouseReps] = useState<CongressMember[]>([]);
	const [chamber, setChamber] = useState(
		'house' || 'senate' || 'congress' || 'all'
	);
	const userString = localStorage.getItem('user');
	const user = userString ? JSON.parse(userString) : '';
	const [representatives, setRepresentatives] = useState<CongressMember[]>([]);

	useEffect(() => {
		async function fetchData() {
			const repObjects = await Requests.checkExistingReps();
			const repNames = user.representatives;
			const representatives: CongressMember[] = repObjects.filter(
				(repObject: CongressMember) => repNames.includes(repObject.name)
			);
			setRepresentatives(representatives);

			const congressMembers = representatives.filter(
				(member: CongressMember) =>
					member.urls[0].includes('.house.gov') ||
					member.urls[0].includes('.senate.gov')
			);
			setCongressMembers(congressMembers);

			const house = representatives.filter((member: CongressMember) =>
				member.urls[0].includes('.house.gov')
			);
			setHouseReps(house);

			const senate = representatives.filter((member: CongressMember) =>
				member.urls[0].includes('.senate.gov')
			);
			setSenators(senate);
		}

		fetchData();
	}, []);

	return (
		<MemberContext.Provider
			value={{
				congressMembers,
				senators,
				houseReps,
				chamber,
				setChamber,
				representatives,
			}}>
			{children}
		</MemberContext.Provider>
	);
};

export const useDisplayMember = () => {
	return useContext(MemberContext);
};
