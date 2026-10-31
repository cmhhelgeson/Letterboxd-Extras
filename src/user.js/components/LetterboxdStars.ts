import { createElementNS } from './dom';

export interface LetterboxdStarPathProps {
	/** Which star, from 0; each is offset 10px to the right of the last. */
	index: number
}

// Replaces: letterboxd.helpers.createLetterboxdStarPath(ii)
export function LetterboxdStarPath({ index }: LetterboxdStarPathProps): SVGElement {
	const path = createElementNS('path', 'http://www.w3.org/2000/svg', {
		transform: `translate(${index * 10}, 0)`,
		['fill-rule']: 'evenodd',
		d: 'M5.065.45c-.22-.61-.95-.59-1.14 0l-.75 2.57H.705c-.73 0-.96.62-.37 1.07l1.99 1.53-.76 2.49c-.22.73.34 1.16.93.71l2-1.53 2 1.53c.59.45 1.15.02.93-.71l-.76-2.49 1.99-1.53c.59-.45.39-1.07-.33-1.07h-2.48z'
	});

	return path;
}

export interface LetterboxdStarsProps {
	/** The source, used in the stars-${type} class. */
	type: string
}

// Replaces: letterboxd.helpers.createLetterboxd1Stars(type)
export function LetterboxdOneStar({ type }: LetterboxdStarsProps): SVGElement {
	// Create the ★
	const svg = createElementNS('svg', 'http://www.w3.org/2000/svg', {
		class: `glyph stars -start -rating stars-extra stars-${type}`,
		role: 'graphics-symbol',
		width: '9',
		height: '9',
		viewBox: '0 0 9 9',
		['aria-label']: '★'
	});
	svg.append(LetterboxdStarPath({ index: 0 }));

	return svg;
}

// Replaces: letterboxd.helpers.createLetterboxd5Stars(type)
export function LetterboxdFiveStars({ type }: LetterboxdStarsProps): SVGElement {
	// Create the ★★★★★
	const svg = createElementNS('svg', 'http://www.w3.org/2000/svg', {
		class: `glyph stars -end -rating stars-extra stars-${type}`,
		role: 'graphics-symbol',
		width: '49',
		height: '9',
		viewBox: '0 0 49 9',
		['aria-label']: '★★★★★'
	});
	for (let ii = 0; ii < 5; ii++){
		svg.append(LetterboxdStarPath({ index: ii }));
	}

	return svg;
}
