import { createElement } from './dom';

export interface ToggleButtonProps {
	/** The class name of the button, which reflects the button type. */
	type: string
	text: string
	/** The target class of the element the button shows; 'a,b' gives a second target in targetOther. */
	target: string
	selected: boolean
	disabled: boolean
	isMobile: boolean | null
	/** Click handler: letterboxd.helpers.changeTomatoScore. */
	onToggle: (event: MouseEvent) => void
	/** Click handler on mobile, except for AlloCine buttons: letterboxd.helpers.changeTomatoScoreMobile. */
	onToggleMobile: (event: MouseEvent) => void
}

// Replaces: letterboxd.helpers.createToggleButton(type, text, target, selected, disabled, isMobile)
// (the click handlers used to be called on letterboxd.helpers directly)
export function ToggleButton({ type, text, target, selected, disabled, isMobile, onToggle, onToggleMobile }: ToggleButtonProps): HTMLSpanElement {
	let targetOther: string;
	if (target.includes(',')) {
		const targets = target.split(',');
		target = targets[0];
		targetOther = targets[1];
	} else {
		targetOther = "";
	}

	const button = createElement('span', {
		class: 'toggle-button ' + type,
		['target']: target,
		['targetOther']: targetOther
	});
	if (selected) {
		button.className += " selected";
	}
	if (disabled) {
		button.className += " disabled";
	}
	if (isMobile) {
		button.className += " extras-mobile";
	}
	button.innerText = text;

	// Add click event
	if (disabled == false){
		if (isMobile && !type.includes('allo')){
			button.addEventListener('click', event => { onToggleMobile(event); });
		} else if (disabled == false){
			button.addEventListener('click', event => { onToggle(event); });
		}
	}

	return button;
}
