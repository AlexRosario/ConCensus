import { ReactNode } from 'react';
import { useDisplayBills } from '../Providers/BillProvider';

export const Section = ({ children }: { children: ReactNode }) => {
	return (
		<section id='main-section'>
			<div className='bill-container'>
				<div className='selectors'>
					{/* This should display the favorited count */}
					<div
						className={`selector ${searchType === 'policy' ? 'active' : ''}`}
						onClick={() => {
							handleSubmit();
						}}>
						Search by Policy
					</div>

					{/* This should display the unfavorited count */}
					<div
						className={`selector ${
							searchType === 'legislative-term' ? 'active' : ''
						}`}
						onClick={() => {
							handleSubmit();
						}}>
						Search by Legislative Term
					</div>
					<div
						className={`selector ${
							billSubject === 'bill-number' ? 'active' : ''
						}`}
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
