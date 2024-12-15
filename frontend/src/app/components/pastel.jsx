import AnimatedLogo from "./logo";
import {styles} from '@/app/components/pastel.css'

export default function PastelContainer({ children }) {
	return (
		<div className="page-container">
            {/* <AnimatedLogo className="logo" /> */}
            {children}
		</div>
	);
}