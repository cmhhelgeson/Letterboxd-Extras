/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorageObject } from '../types/types';
import { createElement } from './dom';

export interface AllocineCriticScoreProps {
	/** 'ratings-style', 'allocine' or 'filmarks'; changes the layout and class name. */
	type: string
	/** Out of 5. */
	rating: any
	count: any
	reviewCount: any
	url: string | null
	/** Unused; kept from the original signature. */
	isMobile?: boolean | null
	storage: StorageObject
}

// Replaces: letterboxd.helpers.createAllocineCriticScore(type, rating, count, reviewCount, url, isMobile)
// (storage used to be read from the module's letterboxd.storage)
export function AllocineCriticScore({ type, rating, count, reviewCount, url, storage }: AllocineCriticScoreProps): HTMLSpanElement {
	// The span that holds the score
	let style = "display: inline-block; margin-right: 5px;";
	if (type == "ratings-style") {
		style = "display: block;"
	}

	let className = 'allocine-critic';
	if (type == "filmarks")
		className = 'filmarks';

	const scoreSpan = createElement('span', {
		class: className,
		style: style
	});

	const convert10Point = (storage.get('convert-ratings') === "10");
	let suffix = "/10";
	let tooltip = "";
	if (rating == 0) {
		tooltip = "0 ratings";
	} else {
		// Convert the score if needed
		if (convert10Point) {
			rating = Number(rating) * 2;
			suffix = "/10";
		} else {
			suffix = "/5";
		}
		// Create tooltip text
		tooltip = 'Weighted average of ' + rating + suffix + ' based on ' + count.toLocaleString() + ' ratings'
		if (reviewCount != null)
			tooltip += " (" + reviewCount.toLocaleString() + " reviews)";
	}

	// The element that is the score itself
	style = '';
	if (type == "ratings-style") {
		style = 'line-height: 28px; width: 100%; margin-left: 0px !important;';
	}

	const scoreElement = createElement('a', {
		class: 'tooltip display-rating -highlight allocine-critic-score tooltip-extra',
		style: style,
		href: url,
		['data-original-title']: tooltip
	});

	if (rating == "0") {
		scoreElement.innerText = "--";
	} else {
		scoreElement.innerText = rating.toFixed(1);
	}

	scoreSpan.append(scoreElement);

	return scoreSpan;
}
