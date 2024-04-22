import {
	useContext,
	ReactNode,
	createContext,
	useState,
	useEffect,
} from 'react';
import { Requests } from '../api.tsx';

export const MemberContext = createContext<MemberContextType>(
	{} as MemberContextType
);

export const MemberProvider = ({ children }: { children: ReactNode }) => {
	const [congressMembers, setCongressMembers] = useState<CongressMember[]>([]);
	const [senators, setSenators] = useState<CongressMember[]>([]);
	const [houseReps, setHouseReps] = useState<CongressMember[]>([]);
	const [chamber, setChamber] = useState('both' || 'house' || 'senate');

	let congressDataGoogle: YourDataType[] = [];
	let congressDataCongressGov: YourDataType[] = [];
	const mergedObjectArray: YourDataType[] = [];

	const getMemberBios = async () => {
		congressDataGoogle = await Requests.getCongressMembers(
			'67cooperstbrooklyn'
		); // Google civic api call

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

	useEffect(() => {
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
	});
	return (
		<MemberContext.Provider
			value={{ congressMembers, senators, houseReps, chamber, setChamber }}>
			{children}
		</MemberContext.Provider>
	);
};

export const useDisplayMember = () => {
	return useContext(MemberContext);
};
