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

type TBillProvider = {
	bills: HouseBill[];
	setBills: (bills: HouseBill[]) => void;
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
};

export const BillContext = createContext<TBillProvider>({
	bills: [],
	setBills: () => {},
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
	filterPassedBills: false, // Added missing property
	setFilterPassedBills: () => {}, // Added missing property
});

export const BillProvider = ({ children }: { children: ReactNode }) => {
	const [bills, setBills] = useState<HouseBill[]>([]);
	const [billSubject, setBillSubject] = useState<string>('');
	const [isButtonClicked, setIsButtonClicked] = useState(false);
	const [subjectOffset, setSubjectOffset] = useState(0);
	const [chamber, setChamber] = useState<string>('house');
	const prevSubjectRef = useRef(billSubject);
	const prevChamberRef = useRef(chamber);
	const [filterPassedBills, setFilterPassedBills] = useState(false);

	const fetchBillsBySubject = async () => {
		// Reset bills and subjectOffset only if billSubject or chamber has changed.
		if (prevSubjectRef.current !== billSubject) {
			setBills([]);
			setSubjectOffset(0);
		}

		try {
			const data = await Requests.getBillsBySubject(billSubject, subjectOffset);
			const fetchedBills = (
				data
					? (data as { results: { bills: HouseBill[] }[] }).results[0]?.bills
					: []
			) as HouseBill[];
			if (bills.length === 0) {
				setBills(fetchedBills);
			} else {
				setBills((prevBills: HouseBill[]) => {
					const uniqueBills = Array.from(
						new Map(
							fetchedBills.map((bill: HouseBill) => [bill.bill_id, bill])
						).values()
					);
					return [...prevBills, ...uniqueBills] as HouseBill[];
				});
			}
		} catch (error) {
			console.error('Failed to fetch bills:', error);
		} finally {
			setIsButtonClicked(false); // Assuming you're using this to manage loading state or similar
			prevSubjectRef.current = billSubject;
			prevChamberRef.current = chamber;
			console.log('Bills:', bills);
		}
	};

	useEffect(() => {
		fetchBillsBySubject();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isButtonClicked, subjectOffset]);

	return (
		<BillContext.Provider
			value={{
				bills,
				setBills,
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
			}}>
			{children}
		</BillContext.Provider>
	);
};

export const useDisplayBills = () => {
	return useContext(BillContext);
};
