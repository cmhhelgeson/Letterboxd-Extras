import { createElement } from './dom';

interface SpineAttrs {
	class: string
	href: string
	title: string
	target: '_blank',
	rel: 'noopener noreferrer',
	'data-view'?: string
}

export interface SpineIndicatorProps {
	/** The film's Criterion page. */
	href: string
	title: string
	spineID: string | null
	logoSVG: HTMLElement
	isMobile: boolean | null
	/** From the 'criterion-spine-default-view' setting: 'row' or 'left-right', or undefined for the default. */
	view?: 'row' | 'left-right'
}

// Replaces the element-building part of: Helper._addSpineIndicator({ logoSVG, title, spineID }: SpineIndicatorProps)
// _addSpineIndicator still checks the setting, finds the poster and adds the indicator to it.
export function SpineIndicator({ href, title, spineID, logoSVG, isMobile, view }: SpineIndicatorProps): HTMLAnchorElement {

	const spineLinkAttrs: SpineAttrs = {
		class: `extras-spine-indicator criterion-spine${isMobile ? ' mobile' : ''}`,
		href: href,
		title: `${title} - Spine #${spineID}`,
		target: '_blank',
		rel: 'noopener noreferrer',
	};

	if (view !== undefined) {
		spineLinkAttrs['data-view'] = view;
	}

	const spineLink = createElement('a', spineLinkAttrs);

	const logoContainer = createElement('span', {
		class: 'spine-logo'
	});
	logoContainer.append(logoSVG);
	spineLink.append(logoContainer);

	if (spineID) {

		const spineStr = String(spineID);
		const digitCount = spineStr.length;
		const spineClass = digitCount <= 2 ? `spine-number spine-digits-${digitCount}` : 'spine-number';
		const spineNumber = createElement('span', {
			class: spineClass
		});
		spineNumber.innerText = spineID;
		spineLink.append(spineNumber);

	}

	return spineLink;

}
