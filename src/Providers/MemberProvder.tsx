import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { ProPublicaMember, CongressMember } from '../types';
import { Requests } from '../api';
import { useAuthInfo } from './AuthProvider';

type MemberContextType = {
	congressMembers: CongressMember[];
	senators: CongressMember[];
	houseReps: CongressMember[];
	chamber: string;
	setChamber: (chamber: string) => void;
	representatives: CongressMember[];
};
type GoogleDataType = {
	name: string;
	offices: { officialIndices: number[]; name: string }[];
	officials: CongressMember[];
};
type CongressDataType = CongressMember[];

export const MemberContext = createContext<MemberContextType>(
	{} as MemberContextType
);

export const MemberProvider = ({ children }: { children: ReactNode }) => {
	const representatives = useRef<CongressMember[]>([] as CongressMember[]);
	const userString = localStorage.getItem('user');
	const user = userString ? JSON.parse(userString) : {};

	const [congressMembers, setCongressMembers] = useState<CongressMember[]>([]);
	const [senators, setSenators] = useState<CongressMember[]>([]);
	const [houseReps, setHouseReps] = useState<CongressMember[]>([]);
	const [chamber, setChamber] = useState('house');

	const getMemberBiosFromMultipleAPIs = async () => {
		console.log('user:', user);
		const { street, city, state, zipcode } = user.address;
		let congressDataGoogle: GoogleDataType = {
			name: '',
			offices: [],
			officials: [],
		};

		let congressDataCongressGov: CongressDataType = [];
		let congressDataProPublica: ProPublicaMember[] = [];

		try {
			congressDataGoogle = await Requests.getCongressMembers(
				`${street} ${city} ${state} ${zipcode}`
			);
			console.log('congressDataGoogle:', congressDataGoogle);

			const congressDataProPublicaSenate =
				await Requests.getCongressMembersProPublica('senate', '118');
			console.log(
				'congressDataProPublicaSenate:',
				congressDataProPublicaSenate
			);

			const congressDataProPublicaHouse =
				await Requests.getCongressMembersProPublica('house', '118');
			console.log('congressDataProPublicaHouse:', congressDataProPublicaHouse);

			congressDataProPublica = [
				...congressDataProPublicaHouse.results[0].members,
				...congressDataProPublicaSenate.results[0].members,
			];

			for (let offset = 0; congressDataCongressGov.length < 555; offset += 20) {
				const response = await Requests.getCongressMembersBioIds(offset);
				const newCongressRecord = response.members;

				if (newCongressRecord.length === 0) break;

				congressDataCongressGov = [
					...congressDataCongressGov,
					...newCongressRecord,
				];
			}

			console.log(
				'congressDataCongressGov:',
				congressDataCongressGov,
				congressDataProPublica,
				congressDataGoogle
			);

			return {
				congressDataGoogle,
				congressDataCongressGov,
				congressDataProPublica,
			};
		} catch (error) {
			console.error('Error fetching member bios:', error);
			throw error;
		}
	};

	const normalizeName = (name: string) => {
		const nameParts = name.replace(',', '').split(' ');
		const firstName = nameParts.length > 2 ? nameParts[1] : '';
		const adjustedFirstName =
			firstName[0] === ' ' ? firstName.slice(1) : firstName;

		return `${adjustedFirstName} ${nameParts[nameParts.length - 1]} ${
			nameParts[0]
		}`;
	};

	const mergeMemberBioObjects = (
		member: CongressMember,
		membersCongressGov: CongressDataType,
		membersCongressProPublica: ProPublicaMember[]
	) => {
		const memberName = member.name;
		const memberObject1 = membersCongressGov.find((member) => {
			return normalizeName(member.name)
				.toLowerCase()
				.includes(memberName.toLowerCase());
		});

		const memberObject2 = membersCongressProPublica.find((member) => {
			const fullName = `${member.first_name}${
				member.middle_name ? ' ' + member.middle_name + ' ' : ' '
			}${member.last_name}`.trim();
			return fullName === memberName;
		});

		return {
			...memberObject1,
			...memberObject2,
			...member,
		};
	};

	const setStateVariables = (reps: CongressMember[]) => {
		setCongressMembers(
			reps.filter(
				(member: CongressMember) =>
					member.urls[0].includes('.house.gov') ||
					member.urls[0].includes('.senate.gov')
			)
		);
		setHouseReps(
			reps.filter((member: CongressMember) =>
				member.urls[0].includes('.house.gov')
			)
		);
		setSenators(
			reps.filter((member: CongressMember) =>
				member.urls[0].includes('.senate.gov')
			)
		);
	};

	const addNewRepresentativesToUserDB = async (reps: CongressMember[]) => {
		try {
			const existingRepresentatives = await Requests.checkExistingReps();
			const existingIds = new Set(
				existingRepresentatives.map((rep: CongressMember) => rep.name)
			);

			for (const rep of reps) {
				if (!existingIds.has(rep.name)) {
					const postedRep = await Requests.postNewReps(rep);
					console.log('Added:', postedRep);
				}
			}
		} catch (error) {
			console.error('Error adding new representatives to DB:', error);
		}
	};

	useEffect(() => {
		const repNames: string[] = [];
		if (user.address !== undefined)
			getMemberBiosFromMultipleAPIs()
				.then((data) => {
					console.log('Data received:', data);

					const filteredRepresentatives: CongressMember[] = [];
					data?.congressDataGoogle.officials.forEach((member) => {
						const memberIndex = data.congressDataGoogle.officials.findIndex(
							(official) => official.name === member.name
						);
						const offices = Array.isArray(data.congressDataGoogle.offices)
							? data.congressDataGoogle.offices
							: [];
						const office_title = offices.find((office) =>
							office.officialIndices.includes(memberIndex)
						)?.name;
						console.log('memberIndex:', memberIndex);

						const mergedMember = {
							...mergeMemberBioObjects(
								member,
								data.congressDataCongressGov,
								data.congressDataProPublica
							),
							...{ office_title: office_title },
						};
						console.log('mergedMember:', mergedMember);
						filteredRepresentatives.push({
							...(mergedMember as CongressMember),
						});
						repNames.push(mergedMember.name);
					});
					representatives.current = filteredRepresentatives;
					setStateVariables(filteredRepresentatives);
					addNewRepresentativesToUserDB(filteredRepresentatives);
				})
				.catch((error) => {
					console.error('Fetch error:', error.message); // Display the error message
					if (error.response) {
						// Check if a response exists
						console.error('Response status:', error.response.status);
						console.error('Response text:', error.response.statusText);
					}
				});
	}, []);

	return (
		<MemberContext.Provider
			value={{
				congressMembers,
				senators,
				houseReps,
				chamber,
				setChamber,
				representatives: representatives.current,
			}}>
			{children}
		</MemberContext.Provider>
	);
};

export const useDisplayMember = () => {
	return useContext(MemberContext);
};
