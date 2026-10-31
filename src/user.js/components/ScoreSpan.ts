import { SourceIdentifier } from '../types/types';
import { createElement } from './dom';

export interface ScoreSpanProps {
	selectorPrefix: SourceIdentifier
	isMobile: boolean | null
	/** The score as displayed, e.g. '8.5' or 'N/A'. */
	score: string | null
	tooltip: string
	/** '/10' or '/5'. */
	totalScore: string
	href: string
}

// Replaces the element-building part of: Helper._generateScoreSpan({ href }: {href: string})
// _generateScoreSpan still works out the score and tooltip.
export function ScoreSpan({ selectorPrefix, isMobile, score, tooltip, totalScore, href }: ScoreSpanProps): HTMLSpanElement {

	// The span that holds the score
	const scoreSpan = createElement('span', {
		class: `${selectorPrefix}-score`
	}, {
		display: 'inline-block'
	});

	// The element that is the score itself
	const scoreText = createElement('a', {
		class: `tooltip tooltip-extra display-rating -highlight ${selectorPrefix}-score`
	});

	if (isMobile === true) scoreText.setAttribute('class', `${scoreText.getAttribute('class')} extras-mobile`);
	scoreText.innerText = score as string;
	scoreText.setAttribute('data-original-title', tooltip);
	scoreText.setAttribute('href', href);

	scoreSpan.append(scoreText);

	// Create score denominator
	// Only add the denominator to match the styles of specific sites
	if (selectorPrefix === 'mubi' ||
		selectorPrefix === 'kinopoisk' ||
		selectorPrefix === 'simkl'
	){
		const scoreTotal = createElement('p', {
			style: 'display: inline-block; font-size: 10px; color: darkgray; margin-bottom: 0px;'
		});
		scoreTotal.innerText = totalScore;
		scoreSpan.append(scoreTotal);
	}

	return scoreSpan;

}
