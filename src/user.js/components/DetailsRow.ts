import { createElement } from './dom';

// The element-building parts of: letterboxd.helpers.createDetailsRow(headerText, value, currency, togetherWith)
// createDetailsRow still formats the value and places the row in the Details tab.

export interface SharedFilmLinkProps {
	/** Letterboxd slug of the film the figure is shared with. */
	togetherWith: string
}

// Replaces the "(Shared)" link built in createDetailsRow
export function SharedFilmLink({ togetherWith }: SharedFilmLinkProps): HTMLAnchorElement {
	const sharedEl = createElement('a', {
		href: `/film/${togetherWith}`
	});
	sharedEl.innerText = "(Shared)";

	return sharedEl;
}

export interface DetailsRowHeaderProps {
	/** budget, box-office-us or box-office-ww. */
	className: string
	headerText: string
}

// Replaces the row header built in createDetailsRow
export function DetailsRowHeader({ className, headerText }: DetailsRowHeaderProps): HTMLHeadingElement {
	// Create the row header element
	const header = createElement('h3', {
		class: `${className} header`
	});

	// Span
	const span = createElement('span', {});
	span.innerText = headerText;
	header.append(span);

	return header;
}

export interface DetailsRowDetailProps {
	className: string
	/** Already formatted for display. */
	value: string
	sharedLink: HTMLAnchorElement | null
}

// Replaces the row value built in createDetailsRow
export function DetailsRowDetail({ className, value, sharedLink }: DetailsRowDetailProps): HTMLDivElement {
	// Create the list element
	const detail = createElement('div', {
		class: `text-indentedlist ${className} detail`
	});

	// Text holder
	const p = createElement('p', {});
	p.innerText = value;
	detail.append(p);

	// Add the shared togetherwith link
	if (sharedLink != null) {
		detail.append(sharedLink);
	}

	return detail;
}
