import './App.css';
import { Header } from './HeaderComponent.tsx';

import { RepSection } from './RepComponents/RepSection.tsx';
import { BillSection } from './BillComponents/BillSection.tsx';
import '@fortawesome/fontawesome-free/css/all.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './fonts/BarlowCondensed-SemiBold.ttf';
import { useScreenInfo } from './Providers/ScreenProvider.tsx';

function App() {
	const { screenSelect } = useScreenInfo();
	return (
		<>
			<Header />

			{screenSelect === 'reps' ? <RepSection /> : <BillSection />}
		</>
	);
}

export default App;
