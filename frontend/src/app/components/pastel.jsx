import AnimatedLogo from "./logo";
import {styles} from '@/app/components/pastel.css'

/**
 * 
 * @param {{
 * 	color: string
 * }} props 
 * @returns 
 */
export default function PastelContainer({ color, background, children }) {
	if(!color) {
		color = "#4E8949";
	}

	if(!background) {
		background = "#edfeec";
	}

	return (
		<div className="page-container" style={{"--highlight": color, "--background": background}}>
            {/* <AnimatedLogo className="logo" /> */}
            {children}
		</div>
	);
}