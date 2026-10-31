import { StorageObject } from '../types/types';
import { createElement } from './dom';

export interface DetailsTextProps {
	/** The source, used in the ${type}-score-details class. */
	type: string
	tooltip: string | null
	storage: StorageObject
}

// Replaces the element-building part of: letterboxd.helpers.createDetailsText(type, section, tooltip, isMobile)
//                                   and: Helper._createRatingDetailsText(section, tooltip)
// Both still decide whether to add it to the section.
export function DetailsText({ type, tooltip, storage }: DetailsTextProps): HTMLSpanElement {

	const detailsSpan = createElement('span', {
		class: `${type}-score-details mobile-details-text`
	});

	if (storage.get('tooltip-show-details') !== true) {
		detailsSpan.style.display = 'none';
	}

	const detailsText = createElement('p', {});
	detailsText.innerText = tooltip as string;
	detailsSpan.append(detailsText);

	return detailsSpan;
}
