import { StorageObject } from '../types/types';
import { createElement } from './dom';

export interface ShowDetailsButtonProps {
	/** Used in the button's class, as in `${name}-show-details`. */
	name: string
	/** The class of the details the button toggles, stored in its `target` attribute. */
	target: string
	storage: StorageObject
	/** Passed through to toggleDetails; letterboxd.helpers callers left it out. */
	isMobile?: boolean | null
}

// Replaces: letterboxd.helpers.createShowDetailsButton(name, target)
//      and: Helper._createShowDetailsButton()
export function ShowDetailsButton({ name, target, storage, isMobile }: ShowDetailsButtonProps): HTMLAnchorElement {

	// Add the Show Details button
	const showDetails = createElement('a', {
		class: `all-link more-link show-details ${name}-show-details`,
		'target': target
	});
	showDetails.innerText = 'SHOW DETAILS';

	// Add click event
	showDetails.addEventListener('click', event => {
		// @ts-ignore toggleDetails is a global, defined in common/additional.js
		toggleDetails(event, storage, isMobile);
	});

	return showDetails;
}
