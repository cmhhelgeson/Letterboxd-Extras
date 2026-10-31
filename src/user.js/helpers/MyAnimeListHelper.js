
import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';
import { ChartSection } from '../components/ChartSection';
import { Histogram } from '../components/Histogram';

export class MyAnimeListHelper extends Helper {

	constructor(storage, helpers, pageState, ratingsSuffix) {

		super(storage, helpers, pageState, 'mal');

		this.ratingsSuffix = ratingsSuffix;

		this.id = null;
		this.url = null;
		this.data = null;
		this.highest = 0;
		this.num_ratings = 0;
		this.score = 'N/A';

	}

	_loadData(id) {

		const apiHeader = 'Tenrai (MAL API)';

		const url = `https://api.tenrai.org/v1/anime/${id}`;
		this._apiRequestCallback(apiHeader, url, 'JSON', {}, value => {

			if (!value.response.data) {
				this.loadState = LOAD_STATES['Failure'];
				return;
			}

			this.data = value.response.data;
			this.url = this.data.url;

			this._apiRequestCallback(`${apiHeader} ratings`, `${url}/statistics`, 'JSON', {}, statsValue => {

				if (!statsValue.response.data) {

					this.loadState = LOAD_STATES['Failure'];
					return;

				}

				this.statistics = statsValue.response.data;
				this.loadState = LOAD_STATES['Success'];

				this.addButtonLink(this.url, 'MAL');
				this.populateRatingsSidebar();

			});

		});
	}


	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		const { isMobile } = this.pageState;

		if (this.data.score !== null) {
			this.rating = this.data.score;
		}
		if (this.data.scored_by !== null) {
			this.num_ratings = this.data.scored_by;
		}

		// Return if there are no ratings
		if (this.num_ratings === 0) { return; }

		// Create and Add
		// Add the section to the page
		const scoreSection = ChartSection({
			selectorPrefix: this.selectorPrefix,
			logoProps: {
				href: `${this.data.url}/stats`,
				style: `position: absolute; background-image: url("${browser.runtime.getURL('images/mal-logo.png')}");`
			},
			headerStyle: "margin-bottom: 15px !important;",
			isMobile: this.pageState.isMobile,
			storage: this.storage
		});

		// Loop first and determine highest votes
		for (let ii = 0; ii < 10; ii++) {
			if (this.statistics.scores[ii].votes > this.highest) {
				this.highest = this.statistics.scores[ii].votes;
			}
		}

		scoreSection.append(Histogram({
			storage: this.storage,
			type: 'mal',
			url: this.url + '/stats',
			rating: this.rating,
			count: this.num_ratings,
			votes: this.statistics.scores,
			percents: this.statistics.scores,
			highest: this.highest,
			ratingsSuffix: this.helpers.getRatingsSuffix()
		}));

		// Add the tooltip as text for mobile
		const score = scoreSection.querySelector('.averagerating.tooltip');
		let tooltip = '';
		if (score !== null) {
			tooltip = score.getAttribute('data-original-title');
			this._createRatingDetailsText(scoreSection, tooltip);
		}

		// Append to the sidebar
		//* ****************************************************************
		this.appendSidebarRating(scoreSection);

		// Add the hover events
		//* ****************************************************************
		this.helpers.addTooltipEvents(scoreSection);

	}

}
