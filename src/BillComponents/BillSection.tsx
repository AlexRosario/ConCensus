import { ReactNode } from 'react';
import { useDisplayBills } from '../Providers/BillProvider';

export const BillSection = ({ children }: { children: ReactNode }) => {
	return (
		<section id='bill-section'>
			<div className='bill-container'>
				<div className='selectors'>
					{/* This should display the favorited count */}
					<div
						className={`selector ${BillsbyVote === 'yay' ? 'active' : ''}`}
						onClick={() => {
							handleSubmit();
						}}>
						Search by Policy
					</div>

					{/* This should display the unfavorited count */}
					<div
						className={`selector ${BillsbyVote === 'nae' ? 'active' : ''}`}
						onClick={() => {
							handleSubmit();
						}}>
						Search by Legislative Term
					</div>
					<div
						className={`selector ${BillsbyVote === 'all' ? 'active' : ''}`}
						onClick={() => {
							handleSubmit();
						}}>
						search by bill number
					</div>
				</div>
				<section>{children}</section>
			</div>
		</section>
	);
};
