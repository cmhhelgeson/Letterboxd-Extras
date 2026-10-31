/* eslint-disable @typescript-eslint/no-explicit-any */
import { createElement, createElementNS } from './dom';
import { LetterboxdStarPath } from './LetterboxdStars';

// Replaces: letterboxd.helpers.roundHalf(num), which only DynamicStars used
function roundHalf(num: number) {
	return Math.round(num * 2) / 2;
}

export interface DynamicStarsProps {
	/** The source, used in the ${type}-stars and stars-${type} classes. */
	type: string
	/** Out of 5. */
	rating: any
}

// Replaces: letterboxd.helpers.createDynamicStars(type, rating)
export function DynamicStars({ type, rating }: DynamicStarsProps): HTMLDivElement {
	const holder = createElement('div', {
		class: `dynamic-star-holder ${type}-stars`
	});

	// Create the background stars
	const svgBacking = createElementNS('svg', 'http://www.w3.org/2000/svg', {
		class: `glyph stars -end -rating stars-extra stars-background`,
		role: 'graphics-symbol',
		width: '49',
		height: '9',
		viewBox: '0 0 49 9'
	},{
		position: 'absolute',
	});
	for (let ii = 0; ii < 5; ii++){
		svgBacking.append(LetterboxdStarPath({ index: ii }));
	}
	holder.append(svgBacking);

	rating = roundHalf(rating);

	// Star front
	// determine width
	const totalWidth = 49;
	const rounded: any = (Math.round(rating * 2) / 2).toFixed(1); // round to the nearest .5
	const percent = rounded / 5
	const width = totalWidth * percent;

	//let starWidth = totalWidth / 5;
	//var width = starWidth * Math.floor(rating) + Math.floor(rating);
	//if (rating > Math.floor(rating)) {
	//	width += starWidth / 2;
	//}

	const div = createElement('div', {
	},{
		height: '9',
		position: 'absolute',
		overflow: 'hidden',
		width: `${width}px`
	});

	const svgFront = createElementNS('svg', 'http://www.w3.org/2000/svg', {
		class: `glyph stars -end -rating stars-extra stars-${type}`,
		role: 'graphics-symbol',
		width: totalWidth,
		height: '9',
		viewBox: '0 0 49 9'
	},{
		display: 'block',
	});
	for (let ii = 0; ii < 5; ii++){
		svgFront.append(LetterboxdStarPath({ index: ii }));
	}
	div.append(svgFront);

	holder.append(div);

	return holder;
}
