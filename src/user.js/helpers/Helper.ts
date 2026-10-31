/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, SourceIdentifier, StorageObject } from '../types/types';
import { ButtonLink } from '../components/ButtonLink';
import { DetailsText } from '../components/DetailsText';
import { RatingsHolder, ShowRatingsButton } from '../components/RatingsHolder';
import { ScoreSpan } from '../components/ScoreSpan';
import { SpineIndicator } from '../components/SpineIndicator';
import { WatchLink, WatchLinkOptions, WatchServices } from '../components/WatchLink';

type ButtonSelector = `.${SourceIdentifier}-button`;
type ButtonClassName = `${SourceIdentifier}-button`;

const buttonLinkOrder: ButtonSelector[] = [
	'.tomato-button',
	'.meta-button',
	'.sens-button',
	'.mubi-button',
	'.filmaff-button',
	'.simkl-button',
	'.kinopoisk-button',
	'.douban-button',
	'.allocine-button',
	'.mdl-button',
	'.mal-button',
	'.anilist-button',
	'.filmarks-button',
	'.criterion-button',
	'.mojo-button',
	'.wiki-button',
	'.ddd-button',
	'.bluray-button',
	'.ebert-button'
];

interface SpineIndicatorProps {
	logoSVG: HTMLElement
	title: string
	spineID: string | null
}

interface APIRequestCallbackOptions {
	name: string
	type: string
	url: string
	options?: object
}

/** The denominator shown after a score, chosen by the 'convert-ratings' setting. */
type ScoreDenominator = '/10' | '/5';

/** What _getAverageScore hands back for display. */
interface AverageScore {
	/** Hover text for the score element. */
	tooltip: string
	/**
	 * The score as it should be displayed: a fixed-point string such as '8.5', the literal
	 * 'N/A', or null when there is no score at all. Callers assign this to innerText.
	 */
	score: string | null
	totalScore: ScoreDenominator
}

/**
 * A generic class used to unify how references sources are accessed and how their data is appended to the webpage.
 */
export class Helper {

	storage: StorageObject
	helpers: any;
	pageState: PageState
	selectorPrefix: SourceIdentifier
	loadState: number;
	data: any | null;
	/**
	  * A link to the film's page on the data source.
		*
		* @type {string}
	*/
	linkURL!: string;
	apiURL: string | null
	linkAdded: boolean
	ratingsAdded: boolean
	tooltip: string
	spineAdded: boolean
	num_ratings: number = 0;
	/** The score on a 10-point scale. Subclasses set it once their data has loaded. */
	rating: number | null = null;
	/** A 5-point score supplied directly by the API, used instead of halving `rating`. */
	ratingAlt: number | null = null;

	constructor(storage: StorageObject, helpers: any, pageState: PageState, selectorPrefix: SourceIdentifier) {

		this.storage = storage;
		this.helpers = helpers;
		this.pageState = pageState;

		/**
		 * A string defining the prefix of a class or id selector on an HTML Element.
		 *
		 * @type {string}
		 */
		this.selectorPrefix = selectorPrefix;


		/**
		 * A flag indicating what our current data loading progress during an API call to an external data source.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.loadState = LOAD_STATES['Uninitialized'];


		/**
		 * The data returned by the external data source.
		 *
		 * @type {any | null}
		 * @default null
		 */
		this.data = null;

		/**
		 * The API Link that returns the film's information.
		 * Only populate this field if it's necessary to access the same api endpoint multiple times.
		 *
		 * @type {string | null}
		 * @default null
		 */
		this.apiURL = null;

		/**
		 * A flag indicating whether a button link to the data source has been added.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.linkAdded = false;

		/**
		 * A flag indicating whether a ratings section has been added to the sidebar.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.ratingsAdded = false;

		/**
		 * Description of the data displayed in the sidebar.
		 *
		 * @type {string}
		 * @default ''
		 */
		this.tooltip = '';

		this.spineAdded = false;

	}

	/**
	 * Runs the data extraction step of pulling from a data source.
	 * @param {any} data - The id or url of the resource.
	 */
	getData(data: any) {

		if (!this._canLoadData()) {

			return;

		}

		this.loadState = LOAD_STATES['Loading'];

		this._loadData(data);

	}

	/**
	 * Gets the requested data for a film's data source and runs a callback
	 * populating the page with information from that data.
	 * @param {any} data - The id or url of the resource.
	 */
	_loadData(data: any) {

		throw new Error(`Letterboxd Extras | Error! The function Helper._loadData' must be overriden by a subclass`);

	}

	/**
	 * Makes an API request to an external data source and handles the response via a callback.
	 *
	 * @param {string} errorHeader - The name of the service for error logging (e.g., "AniList API", "MyAnimeList API")
	 * @param {string} url - The API endpoint URL to request data from
	 * @param {string} type - 'JSON' to parse the response as JSON; anything else returns it as text
	 * @param {Object} [options] - Optional request options (headers, method, body, etc.) to be passed to the fetch request
	 * @param {function({response: any, url: string, status: number}): void} dataLoadCallback - Called with
	 *   the background script's whole reply once it is valid: `response` is the body, and `url` is the
	 *   address after any redirects.
	 * @param {function(any): void} [onFailure] - Called with the background script's reply (which may be
	 *   null) when it fails validation, so a helper can react to a specific status code.
	 * @protected
	 */
	_apiRequestCallback(errorHeader: string, url: string, type: string, options: object, dataLoadCallback: (response: any) => void, onFailure?: (response: any) => void) {
		try {

			const request: APIRequestCallbackOptions = {
				name: 'GETDATA',
				type: type,
				url: url
			};

			if (Object.keys(options).length !== 0) {
				request.options = options;
			}

			browser.runtime.sendMessage(request, value => {

				if (this.helpers.ValidateResponse(errorHeader, value) === false) {
					this.loadState = LOAD_STATES['Failure'];
					if (onFailure !== undefined) {
						onFailure(value)
					}
					return;
				}

				if (!value.response) {

					this.loadState = LOAD_STATES['Failure'];
					return;

				}

				dataLoadCallback(value);

			});

		} catch (error) {

			console.error(`Letterboxd Extras | Unable to parse ${errorHeader} URL`);
			this.loadState = LOAD_STATES['Failure'];

		}

	}


	/**
	 * Populates the ratings sidebar with information from the data source.
	 * @abstract
	 */
	populateRatingsSidebar() {

		throw new Error(`Letterboxd Extras | Error! The function 'populateRatingsSidebar' must be overriden by a subclass`);

	}

	_createRatingsHolder() {
		if (document.querySelector('.extras-ratings-holder') !== null) {
			return document.querySelector('.extras-ratings-holder');
		}

		const currentSidebar = document.querySelector('.sidebar') as Element;

		const sidebar = RatingsHolder();
		currentSidebar.append(sidebar);

		const moreButton = ShowRatingsButton();
		currentSidebar.append(moreButton);

		return sidebar;
	}

	_getCorrectRatingsHolder(): Element | null {

		let sidebar = document.querySelector('.sidebar');

		const { hideRatings } = this.pageState;

		if (hideRatings) {
			sidebar = document.querySelector('.extras-ratings-holder');

			if (sidebar === null) {
				sidebar = this._createRatingsHolder();
			}
		}

		return sidebar;

	}

	/**
	 * Adds html to the ratings sidebar for a given reference source.
	 *
	 * @param {HTMLElement} rating - The html that will be appending to the ratings sidebar
	 */
	appendSidebarRating(rating: HTMLElement) {
		const order = this.storage.get('ratings-order');

		let className: string = this.selectorPrefix;
		if (this.selectorPrefix !== 'cinemascore') {
			className = `${this.selectorPrefix}-ratings`;
		}

		const index = order.indexOf(className);
		const ratingsHolder = this._getCorrectRatingsHolder();

		if (ratingsHolder === null) {
			return;
		}

		// First
		for (let i = index + 1; i < order.length; i++) {
			const temp = ratingsHolder.querySelector(`.${order[i]}`);
			if (temp !== null) {
				temp.before(rating);
				return;
			}
		}

		// Second
		for (let i = index - 1; i >= 0; i--) {
			const temp = ratingsHolder.querySelector(`.${order[i]}`);
			if (temp !== null) {
				temp.after(rating);
				return;
			}
		}

		// Third
		ratingsHolder.append(rating);

	}

	/**
	 * Adds a link to an external reference source on a film's overview page.
	 *
	 * @param {string} url - The url the button will redirect the user to .
	 * @param {string} text - The text to be displayed on the button.
	 */
	addButtonLink(url: string, text: string) {

		if (url === null || url === '') {
			return;
		}

		const className: ButtonClassName = `${this.selectorPrefix}-button`;

		// Check if already added
		if (!this.linkAdded) {

			this.linkAdded = true;

			if (document.querySelector(`.${className}`)) {
				return;
			}

			// Create Button Element
			const button = ButtonLink({ className, url, text, openInNewTab: this.storage.get('open-same-tab') !== true });

			const index = buttonLinkOrder.indexOf(`.${className}`);
			// First Attempt
			for (let i = index + 1; i < buttonLinkOrder.length; i++) {
				const temp = document.querySelector(buttonLinkOrder[i]);
				if (temp !== null) {
					temp.before(button);
					return;
				}
			}

			// Second Attempt
			for (let i = index - 1; i >= 0; i--) {
				const temp = document.querySelector(buttonLinkOrder[i]);
				if (temp !== null) {
					temp.after(button);
					return;
				}
			}

			// Third Attempt
			const buttons = document.querySelectorAll('p.text-link.text-footer div a.micro-button');
			const lastButton = buttons[buttons.length - 1];
			lastButton.after(button);
		}

	}

	/**
	 * Determines whether the ratings sidebar can be populated with data.
	 *
	 * @returns {boolean}
	 * @protected
	 */
	_canPopulateRatingsSidebar() {

		return document.querySelector('.sidebar') !== null && this.data !== null && !document.querySelector(`.${this.selectorPrefix}-ratings`);

	}

	/**
	 * Determines whether we can load date by checking if the load process has already been initialized.
	 *
	 * @returns {boolean}
	 * @protected
	 */
	_canLoadData() {

		// No data present and have not started to load already
		return this.data === null && this.loadState === LOAD_STATES['Uninitialized'];

	}

	/**
	 * Creates tooltip text below the generated ratings section.
	 *
	 * @param {HTMLElement} section - The sidebar section element to append the details text to
	 * @param {string} tooltip - The tooltip text to display
	 * @protected
	 */
	_createRatingDetailsText(section: HTMLElement, tooltip: string) {

		const { isMobile } = this.pageState;

		const detailsSpan = DetailsText({ type: this.selectorPrefix, tooltip, storage: this.storage });

		if (isMobile || this.storage.get('tooltip-show-details') === true) {
			section.append(detailsSpan);
		}
	}


	/**
	 * Calculates the display score, tooltip text, and score denominator for a rating.
	 *
	 * @param score - The rating score on a 10-point scale
	 * @param altScore - An optional pre-calculated 5-point score from the API
	 * @protected
	 */
	_getAverageScore(score: number | null, altScore?: number | null): AverageScore {

		let totalScore: ScoreDenominator = '/10';

		if (score !== null && this.storage.get('convert-ratings') === '5') {
			totalScore = '/5';
			score = altScore ? altScore : score / 2;
		}

		let tooltip = 'No score available';
		const ratingsText = `rating${this.num_ratings > 0 ? 's' : ''}`;

		if (this.num_ratings > 0 && this.rating == null) {

			tooltip = `${this.num_ratings} ${ratingsText}`;
			return { tooltip, score: 'N/A', totalScore };

		}

		// `score` stays the number; the returned score is the string the caller displays.
		if (score === null) {
			return { tooltip, score: null, totalScore };
		}

		const displayScore = score.toFixed(1);
		tooltip = `Average of ${displayScore}${totalScore} based on ${this.num_ratings.toLocaleString()} ${ratingsText}`;

		return { tooltip, score: displayScore, totalScore };

	}

	/**
	 * Generates a span containing the film's rating on a 5-point or 10-point scale.
	 *
	 * @param {Object} options
	 * @param {string} options.href - The URL that the score link will redirect to
	 * @returns {HTMLSpanElement}
	 * @protected
	 */
	_generateScoreSpan({ href }: {href: string}) {

		const { isMobile } = this.pageState;

		const { tooltip, score, totalScore } = this._getAverageScore(this.rating, this.ratingAlt);
		this.tooltip = tooltip;

		return ScoreSpan({ selectorPrefix: this.selectorPrefix, isMobile, score, tooltip, totalScore, href });

	}

	/**
	 * Creates the base section element for the data source's sidebar ratings element.
	 *
	 * @param options.sourceID - Id of the HTMLElement for the newly created service
	 * @param options.title - Descriptor for the data-original-title
	 * @param options.link - Link for the movie
	 * @protected
	 */
	_createWatchLink(options: WatchLinkOptions): void {

		const watchSection = document.getElementById('watch');

		if (watchSection === null) {
			return;
		}

		let sections: Element | null = watchSection.querySelector('.services');

		if (sections === null) {
			sections = WatchServices();
			watchSection.append(sections);
		}

		sections.append(WatchLink(options));

	}

	_addSpineIndicator({ logoSVG, title, spineID }: SpineIndicatorProps) {
		const { isMobile } = this.pageState;

		if (this.spineAdded) return;

		const posterSection: Element | null = isMobile ? 
			document.querySelector('div.poster-list.-p230.-single') :
			document.querySelector('section.poster-list.-p230.-single');

		if (posterSection === null) return;

		if (posterSection.querySelector('.extras-spine-indicator') !== null) return;

		let view: 'row' | 'left-right' | undefined;
		const viewMode = this.storage.get('criterion-spine-default-view');
		if (viewMode === 'None'){
			this.spineAdded = true;
			return;
		} else if (viewMode === 'Row') {
			view = 'row';
		} else if (viewMode === 'Left/Right') {
			view = 'left-right';
		}

		const spineLink = SpineIndicator({ href: this.linkURL, title, spineID, logoSVG, isMobile, view });

		if (isMobile){
			posterSection.append(spineLink);
		}else{
			posterSection.prepend(spineLink);
		}
		this.spineAdded = true;

		browser.storage.onChanged.addListener((changes, area) => {
			if (area !== 'sync' || !changes.options) return;
			const newView = changes.options.newValue['criterion-spine-default-view'];
			const spine = document.querySelector('.extras-spine-indicator');
			if (!spine) return;

			if (newView === 'Row') {
				spine.setAttribute('data-view', 'row');
			} else if (newView === 'Left/Right') {
				spine.setAttribute('data-view', 'left-right');
			} else {
				spine.removeAttribute('data-view');
			}
		});
	}

}
