import {
	useContext,
	ReactNode,
	createContext,
	useState,
	useEffect,
	useRef,
} from 'react';
import { Requests } from '../api.tsx';
import { HouseBill } from '../types.ts';
import { useScreenInfo } from './ScreenProvider.tsx';
import { useAuthInfo } from './AuthProvider.tsx';

type TBillProvider = {
	billsToDisplay: HouseBill[];
	billSubject: string;
	setBillSubject: (subject: string) => void;
	isButtonClicked: boolean;
	setIsButtonClicked: (isClicked: boolean) => void;
	subjectOffset: number;
	setSubjectOffset: (offset: number | ((prevOffset: number) => number)) => void;
	chamber: string;
	setChamber: (chamber: string) => void;
	prevChamberRef: React.MutableRefObject<string>;
	prevSubjectRef: React.MutableRefObject<string>;
	filterPassedBills: boolean;
	setFilterPassedBills: (filterPassed: boolean) => void;
	setActiveTab: (tab: string) => void;
};

export const BillContext = createContext<TBillProvider>({
	billsToDisplay: [],
	billSubject: '',
	setBillSubject: () => {},
	isButtonClicked: false,
	setIsButtonClicked: () => {},
	subjectOffset: 0,
	setSubjectOffset: () => {},
	chamber: 'house',
	setChamber: () => {},
	prevChamberRef: { current: 'house' } as React.MutableRefObject<string>,
	prevSubjectRef: { current: '' } as React.MutableRefObject<string>,
	filterPassedBills: false,
	setFilterPassedBills: () => {},
	setActiveTab: () => {},
});

export const BillProvider = ({ children }: { children: ReactNode }) => {
	const { user } = useAuthInfo();
	const { screenSelect } = useScreenInfo();
	const [allBills, setAllBills] = useState<HouseBill[]>([]);
	const [activeBillTab, setActiveTab] = useState<string>('none');
	const [billSubject, setBillSubject] = useState<string>('');
	const [isButtonClicked, setIsButtonClicked] = useState(false);
	const [subjectOffset, setSubjectOffset] = useState(0);
	const [chamber, setChamber] = useState<string>('house');
	const prevSubjectRef = useRef(billSubject);
	const prevChamberRef = useRef(chamber);
	const [filterPassedBills, setFilterPassedBills] = useState(false);
	const voteLog = user?.id
		? Object.keys(Requests.getVoteLogByUserId(user.id))
		: [];
	const newBills = allBills.filter((bill) => !voteLog.includes(bill.number));
	const votedBills = allBills.filter((bill) => voteLog.includes(bill.number));
	const billsToDisplay =
		activeBillTab === 'none'
			? allBills
			: activeBillTab === 'new'
			? newBills
			: votedBills;

	let uniqueBillsMap = new Map<string, HouseBill>();
	let voteBillsMap = new Map<string, HouseBill>();

	// Extracting bill numbers from user vote log

	const fetchBillsBySubject = async () => {
		// Reset bills and subjectOffset only if billSubject has changed
		console.log('offset:', subjectOffset);
		if (prevSubjectRef.current !== billSubject) {
			setAllBills([]);
			setSubjectOffset(0);
			uniqueBillsMap = new Map();
			voteBillsMap = new Map(); // Reset uniqueBillsMap when subject changes
		}

		try {
			const voteLog = user?.id
				? Object.keys(await Requests.getVoteLogByUserId(user.id))
				: [];

			console.log('voteLog:', voteLog);
			const data = await Requests.getBillsBySubject(billSubject, subjectOffset);
			const fetchedBills = (
				data
					? (data as { results: { bills: HouseBill[] }[] }).results[0]?.bills
					: []
			) as HouseBill[];
			const filteredBills = filterNewBills(fetchedBills, voteLog);

			setAllBills((prevBills) => [...prevBills, ...filteredBills]);

			console.log('newbills:', newBills);
			console.log('votedBills:', votedBills);
		} catch (error) {
			console.error('Failed to fetch bills:', error);
		} finally {
			setIsButtonClicked(false);

			prevSubjectRef.current = billSubject;
			prevChamberRef.current = chamber;
		}
	};

	const filterNewBills = (
		fetchedBills: HouseBill[],
		voteLog: string[]
	): HouseBill[] => {
		// Filtering fetched bills to exclude those in billArray
		console.log('voteLog:', voteLog);
		// Add new unique bills to the map
		fetchedBills.forEach((bill) => {
			uniqueBillsMap.set(bill.bill_id, bill);
		});

		// Update the state with the new unique bills map

		console.log('VoteBillMap:', voteBillsMap);
		return Array.from(uniqueBillsMap.values());
	};

	useEffect(() => {
		if (screenSelect === 'bills') {
			fetchBillsBySubject();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, isButtonClicked, subjectOffset, screenSelect]);

	return (
		<BillContext.Provider
			value={{
				billsToDisplay,
				billSubject,
				setBillSubject,
				isButtonClicked,
				setIsButtonClicked,
				subjectOffset,
				setSubjectOffset,
				chamber,
				setChamber,
				prevChamberRef,
				prevSubjectRef,
				filterPassedBills,
				setFilterPassedBills,
				setActiveTab,
			}}>
			{children}
		</BillContext.Provider>
	);
};

export const useDisplayBills = () => {
	return useContext(BillContext);
};
