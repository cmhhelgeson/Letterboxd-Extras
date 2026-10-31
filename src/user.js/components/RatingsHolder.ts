import { createElement } from './dom';

// The element-building parts of: Helper._createRatingsHolder()
//                           and: the overview's createRatingsHolder() in letterboxd-extras.js
// Both still look for an existing holder and add these to the sidebar.

// Replaces the hidden holder that ratings move into when they are hidden
export function RatingsHolder(): HTMLDivElement {
	const sidebar = createElement('div', {
		class: 'extras-ratings-holder',
		style: 'display: none'
	});

	return sidebar;
}

// Replaces the "Show ratings" link that reveals the holder
// (the overview passed letterboxd to toggleAllRatings as well, which it ignores)
export function ShowRatingsButton(): HTMLAnchorElement {
	const moreButton = createElement('a', {
		class: 'text-slug extras-show-more'
	});
	moreButton.innerText = 'Show ratings';

	moreButton.addEventListener('click', event => {
		// @ts-ignore toggleAllRatings is a global, defined in common/additional.js
		toggleAllRatings(event);
	});

	return moreButton;
}
