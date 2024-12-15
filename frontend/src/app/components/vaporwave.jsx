import AnimatedLogo from "./logo";
import {styles} from '@/app/components/vaporwave.css'

export default function VaporwaveContainer({ children }) {
	return (
		<div className="page-container">
			<AnimatedLogo className="logo" />
			{children}
		</div>
	);
}