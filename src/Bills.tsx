import { useDisplayBills } from '../Providers/BillProvider';
import { BillCard } from './BillCard';

type HandleFunctions = {
	handleDeleteBill: (billId: number) => void;
	handleApprovalClick: (billId: number) => void;
};

export const Bills = ({
	handleDeleteBill,
	handleApprovalClick,
}: HandleFunctions) => {
	const { billsToDisplay } = useDisplayBills();

	return (
		<>
			{billsToDisplay?.map((dog) => (
				<BillCard
					bill={bill}
					key={bill.id}
					isLoading={false}
					onTrashIconClick={() => handleDeleteBill(bill.id)}
					onThumbUpClick={() => handleApprovalClick(bill.id)}
					onThumbDownClick={() => handleApprovalClick(bill.id)}
				/>
			))}
			;
		</>
	);
};
