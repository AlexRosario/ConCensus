import { BillSearch } from './BillSearchToggle';
import { BillHopper } from './BillHopper';

export const BillSection = () => {
	return (
		<section id='bill-section'>
			<div className='bill-container'>
				<BillSearch />
				<BillHopper />
			</div>
		</section>
	);
};
