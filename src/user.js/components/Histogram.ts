/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorageObject } from '../types/types';
import { createElement } from './dom';
import { LetterboxdFiveStars, LetterboxdOneStar } from './LetterboxdStars';

export interface HistogramProps {
	storage: StorageObject
	/** The source, e.g. 'imdb', 'mal', 'anilist', 'allocine'; changes how votes and suffixes are read. */
	type: string
	url: string | null
	/** The score, or 'N/A'. */
	rating: number | string | null
	count: number
	/** Per-bucket vote counts; for 'mal' and 'anilist' each entry is the source's own bucket object. */
	votes: any[]
	percents: any[]
	highest: number
	/** The overview page's ratingsSuffix: one label per bucket, read when the histogram is built. */
	ratingsSuffix: string[]
}

// Replaces: letterboxd.helpers.createHistogram(storage, type, url, rating, count, votes, percents, highest)
// (ratingsSuffix used to be read from letterboxd.overview.ratingsSuffix)
export function Histogram({ storage, type, url, rating, count, votes, percents, highest, ratingsSuffix }: HistogramProps): HTMLDivElement {

	// Create the initial structure for the graph
	const histogram = createElement('div', {
		class: 'rating-histogram rating-histogram-extras'
	});
	const layoutDiv = createElement('div', {
		class: 'layout'
	});
	histogram.append(layoutDiv);


	// Create the score
	//*********************************************/
	const convertRatings = (storage.get('convert-ratings') === '5');
	const convert10Point = (storage.get('convert-ratings') === '10');
	let suffix = '/10';
	let ratingTooltip = '';
	let ratingText: any = '';

	if (rating != "N/A") {
		// Convert the score if needed
		if (convertRatings === true) {
			if (type == "anilist") {
				rating = (Number(rating) / 20).toFixed(1);
			} else {
				rating = (Number(rating) / 2).toFixed(1);
			}
			suffix = "/5";
		} else if (type == "anilist") {
			suffix = "/100";
		} else if (type == "allocine") {
			if (convert10Point) {
				rating = (Number(rating) * 2).toFixed(1);
				suffix = "/10";
			} else {
				rating = Number(rating).toFixed(1);
				suffix = "/5";
			}
		} else {
			rating = Number(rating).toFixed(1);
			suffix = "/10";
		}

		// Create tooltip text
		ratingTooltip = 'Weighted average of ' + rating + suffix + ' based on ' + count.toLocaleString() + ' ratings'
	}

	if (rating == "N/A") {
		ratingText = "N/A";
	} else if (type === "anilist" && convertRatings == false) {
		ratingText = rating + "%";
	} else {
		ratingText = rating;
	}

	const scoreElement = createElement('a', {
		class: 'average-rating tooltip averagerating tooltip imdb-score tooltip-extra',
		href: url,
		['data-original-title']: ratingTooltip
	});
	scoreElement.innerText = ratingText;


	// Create the histogram bar graph
	//*********************************************/
	const table = createElement('table', {
		class: 'chart'
	});
	const tbody = createElement('tbody', {
		class: 'plot'
	});
	table.append(tbody);

	for (let ii = 0; ii < votes.length; ii++) {

		// Determine vote counts and percentages
		let voteCount: any;
		let percentage: any;
		if (type === "mal") {
			voteCount = votes[ii].votes;
			percentage = votes[ii].percentage;
		} else if (type === "anilist") {
			voteCount = votes[ii].amount;
			percentage = (voteCount / count * 100).toFixed(1);
		} else {
			voteCount = votes[ii];
			percentage = percents[ii];
		}

		// Determine Suffixes
		let currentRatingsSuffix = ratingsSuffix.map((x) => x);
		if (type === "anilist" && storage.get('convert-ratings') === false) {
			currentRatingsSuffix = ['10/100', '20/100', '30/100', '40/100', '50/100', '60/100', '70/100', '80/100', '90/100', '100/100'];
		} else if (type === "allocine") {
			currentRatingsSuffix = ['0-★', '★', '★★', '★★★', '★★★★', '★★★★★'];
		}


		// Determine rating type (rating vs review)
		let ratingType = "ratings";
		if (type == "allocine") {
			ratingType = "reviews";
		}

		const tooltip = `${voteCount.toLocaleString()} ${currentRatingsSuffix[ii]} ${ratingType} (${percentage.toString()}%)`
		let href = '';

		// IMDb reviews link
		if (type == "imdb") {
			href = (url as string).replace('/ratings/', '/reviews/?rating=' + (ii + 1).toString());
		} else if (type == "allocine") {
			href = url + "star-" + ii;
		} else {
			href = url as string;
		}

		// Now create the actual element
		const percent = voteCount / highest;
		const tr = createElement('tr', {
			class: 'column',
			style: `--value: ${percent};`
		});

		const td = createElement('td', {
			class: 'cell'
		});
		tr.append(td);

		const a = createElement('a', {
			class: `barcolumn tooltip ${type} tooltip-extra`,
			['data-original-title']: tooltip,
			href: href
		});
		td.append(a);

		const spanBar = createElement('span', {
			class: 'bar'
		});
		a.append(spanBar);

		const spanFill = createElement('span', {
			class: 'fill'
		});
		spanBar.append(spanFill);

		// Add to the graph
		tbody.append(tr);
	}

	// Create the stars
	//*********************************************/
	const svgStart = LetterboxdOneStar({ type });
	const svgEnd = LetterboxdFiveStars({ type });


	// Finalize the element in the correct order
	//*********************************************/
	layoutDiv.append(svgStart);
	layoutDiv.append(table);
	layoutDiv.append(svgEnd);
	layoutDiv.append(scoreElement);

	return histogram;
}
