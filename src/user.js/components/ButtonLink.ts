import { createElement } from './dom';

export interface ButtonLinkProps {
	/** e.g. 'allocine-button'. */
	className: string
	url: string
	text: string
	/** Determines whether the requested website opens in a new tab.
	  * False when the 'open-same-tab' setting is on. */
	openInNewTab: boolean
}

// Replaces the element-building part of: Helper.addButtonLink(url: string, text: string)
//                                   and: the overview's addLink(url, text, prefix) in letterboxd-extras.js
// Both still check for an existing button and place it in the configured order.
export function ButtonLink({ className, url, text, openInNewTab }: ButtonLinkProps): HTMLAnchorElement {
	const button = createElement('a', {
		class: `micro-button track-event extras-button ${className}`,
		href: url
	});
	button.innerText = text;

	if (openInNewTab) {
		button.setAttribute('target', '_blank');
	}

	return button;
}
