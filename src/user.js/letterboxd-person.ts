import { LOAD_STATES } from './constants';
import { GetDataResponse, SparqlResults, SparqlValue, StorageObject } from './types/types';

type KnownPersonRole =
	'director' |
	'co-director' |
	'additional-directing' |
	'writer' |
	'producer' |
	'executive-producer' |
	'actor' |
	'original-writer' |
	'editor' |
	'cinematography' |
	'composer';

// `string & {}` keeps autocomplete for the known roles while still accepting any other role slug from the URL
type PersonRole = KnownPersonRole | (string & {});

type WikiValue = SparqlValue;

// One row of the WikiData PERSON query result; every column is optional because SPARQL omits unbound variables
interface WikiPerson {
	itemLabel?: WikiValue
	BirthName?: WikiValue
	Date_Of_Birth?: WikiValue
	Date_Of_Birth_Precision?: WikiValue
	BirthCityLabel?: WikiValue
	BirthCountry?: WikiValue
	Date_Of_Death?: WikiValue
	Date_Of_Death_Precision?: WikiValue
	DeathCityLabel?: WikiValue
	DeathCountry?: WikiValue
	Years_Start?: WikiValue
	Years_End?: WikiValue
	Wikipedia?: WikiValue
	IMDb_ID?: WikiValue
}

interface LostFilmRow {
	letterboxdID: { value: string }
}

interface LostFilms {
	loadState: number
	filterAdded: boolean
	enabled: boolean
	lostFilmCount: number
	visibleCount: number
	totalCount: number
	watchedUpdated: boolean
	list: string[] | null
}

export class LetterboxdPerson {

	extensionStorage: StorageObject;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	extensionHelpers: any;

	running: boolean;
	isMobile: boolean | null;
	tmdbID: string | null;
	wiki: WikiPerson | null;
	letterboxdName: string | null;
	buttonUpdated: boolean;
	loggedIn: boolean | null;
	lostFilms: LostFilms;
	styleSheet: CSSStyleSheet;
	lostFilmRuleIndex: number;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(storage: StorageObject, helpers: any) {

		this.extensionStorage = storage;
		this.extensionHelpers = helpers;

		this.running = false;
		this.isMobile = null;
		this.tmdbID = null;
		this.wiki = null;
		this.letterboxdName = null;
		this.buttonUpdated = false;
		this.loggedIn = null;

		this.lostFilms = {
			list: null,
			loadState: LOAD_STATES['Uninitialized'],
			filterAdded: false,
			enabled: false,
			lostFilmCount: 0,
			visibleCount: 0,
			totalCount: 0,
			watchedUpdated: false
		};

		const styleElement = document.createElement('style');
		document.head.appendChild(styleElement);

		this.styleSheet = styleElement.sheet as CSSStyleSheet;
		this.lostFilmRuleIndex = 0;

		this.styleSheet.insertRule(`.extras-lost-film{ display: revert !important; }`, this.lostFilmRuleIndex);
	}

	stopRunning() {
		this.running = false;
	}

	async init() {

		this.running = true;

		// Get logged in status
		if (this.loggedIn == null){
			this.loggedIn = document.documentElement.innerHTML.includes('person.loggedIn = true');
			this.extensionHelpers.WriteConsoleLog('DEBUG', `Found Logged in status: ${this.loggedIn}`);
		}

		// Get the person's name from the page
		if (this.letterboxdName === null && document.querySelector('span.name') !== null) {
			this.getName();
		}

		// Get the TMDB id and call wikidata
		if (this.letterboxdName !== null && this.tmdbID === null && document.querySelector('.bio') !== null) {
			// Get the TMDB ID
			const body = document.querySelector('body');
			if (body?.hasAttribute('data-tmdb-id')) {
				this.tmdbID = body.getAttribute('data-tmdb-id');
			}

			this.callWikiData();
		}

		// Update the TMDB button
		if (this.buttonUpdated == false && document.querySelector('.micro-button:not(.extras-button)')){
			this.updateTmdbButton();
		}

		// Add the filter
		if (this.lostFilms.filterAdded === false && document.querySelector('.js-film-filters') !== null && this.extensionStorage.localInitilized === true) {
			this.lostFilms.filterAdded = true;
			this.addLostFilmFilter();
		}

		// Call WikiData for lost films
		if (this.lostFilms.loadState === LOAD_STATES['Uninitialized'] && document.querySelector('.poster-grid') !== null && this.extensionStorage.localInitilized === true) {
			this.callWikiDataLostFilms();
		}

		// Update the page for lost films
		if (this.lostFilms.loadState === LOAD_STATES['Pending'] && this.loggedIn != null) {
			if (this.loggedIn) {
				// If the user is logged in, make sure the progress count exists
				if (document.querySelector('.progress-count')) {
					this.processLostFilms();
				}

			} else {
				// If not logged in, we can just do it
				this.processLostFilms();
			}
		}

		// Stop
		return this.stopRunning();
	}

	updateTmdbButton() {
		const tmdbButton = document.querySelector('.micro-button:not(.extras-button)');
		if (tmdbButton != null){
			if (this.extensionStorage.get('open-same-tab') == true) {
				tmdbButton.setAttribute("target", "");
			}
			this.buttonUpdated = true;
		}
	}

	getName() {
		const nameElement = document.querySelector<HTMLElement>('span.name');
		if (nameElement === null) {
			return;
		}

		let name = nameElement.innerText;
		if (name.includes('\n')) {
			const startIndex = name.indexOf('\n') + 1;
			name = name.substring(startIndex);
		}

		// Determine mobile
		if (this.isMobile === null) {
			const htmlEl = document.querySelector('html');
			if (htmlEl) {
				if (htmlEl.getAttribute('class')?.includes('no-mobile')) {
					this.isMobile = false;
				} else {
					this.isMobile = true;
				}
			}
		}

		this.letterboxdName = name;
	}

	callWikiData() {
		// Get the Query String
		let lang = null;
		try {
			lang = window.navigator.language.substring(0, 2);
		} catch {
			// Fall back to a null language when the browser doesn't expose one
		}

		const queryString = this.extensionHelpers.getWikiDataQuery('', this.tmdbID, '', false, 'PERSON', lang);
		// Call WikiData
		browser.runtime.sendMessage({ name: 'GETDATA', type: 'JSON', url: queryString.url, options: queryString.options }, (data: GetDataResponse<SparqlResults<WikiPerson>>) => {
			if (this.extensionHelpers.ValidateResponse('WikiData', data) === false) {
				return;
			}

			const value = data.response;
			if (value !== null && value.results !== null && value.results.bindings !== null && value.results.bindings.length > 0) {
				this.wiki = value.results.bindings[0];

				this.addWikiData();
				this.addIMDbButton();
				this.addWikiButton();
			}
		});
	}

	addLostFilmFilter() {
		// Check if already added?
		if (document.querySelector('.extras-lost-filter') !== null) {
			return;
		}

		// Create filter element
		const li = this.extensionHelpers.createElement('li', {
			class: `extras-lost-filter divider-line -inset`
		});
		const a = this.extensionHelpers.createElement('span', {
			class: 'item'
		});
		li.append(a);
		a.innerText = 'Hide lost films';
		const i = this.extensionHelpers.createElement('i', {
			class: 'ir s icon'
		});
		a.prepend(i);

		// Add to page
		const unreleasedFilter = document.querySelector('.js-film-filters ul');
		unreleasedFilter?.append(li);

		// Add click event
		li.addEventListener('click', (event: MouseEvent) => {
			this.toggleLostFilms(event);
		});

	}

	_calculateAge(start: Date, end: Date) {
		const ageDifMs = end.getTime() - start.getTime();
		const ageDate = new Date(ageDifMs);
		return Math.abs(ageDate.getUTCFullYear() - 1970);
	}

	addWikiData() {
		const wiki = this.wiki;
		if (wiki === null) return;
		if (document.querySelector('.extras-table')) return;

		// Collect basic info
		//* ****************************************
		const isAlive = wiki.Date_Of_Death == null || wiki.Date_Of_Death.value == null;

		// const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
		// const options2 = { year: 'numeric', timeZone: 'UTC' };

		// Birth name and date
		let name: string | null = null;
		let birth: string | null = null;
		let birthPlace: string | null = null;
		if (wiki.BirthName && wiki.BirthName.value !== null) {
			if (wiki.BirthName.value !== wiki.itemLabel?.value && wiki.BirthName.value !== this.letterboxdName) {
				name = wiki.BirthName.value;
			}
		}

		if (wiki.Date_Of_Birth && wiki.Date_Of_Birth.value !== null && Number(wiki.Date_Of_Birth_Precision?.value) >= 9) {
			birth = new Date(wiki.Date_Of_Birth.value).toLocaleDateString('en-UK', this.extensionHelpers.getDateOptions(wiki.Date_Of_Birth_Precision?.value));
			if (isAlive === true) {
				const age = this._calculateAge(new Date(wiki.Date_Of_Birth.value), new Date());
				birth += ` (age ${age})`;
			}

			if (wiki.BirthCityLabel && wiki.BirthCityLabel.value !== null) {
				birthPlace = wiki.BirthCityLabel.value;
				if (wiki.BirthCountry && wiki.BirthCountry.value !== null) {
					birthPlace += `, ${wiki.BirthCountry.value}`;
				}
			}
		}

		// Death date
		let death: string | null = null;
		let deathPlace: string | null = null;
		if (wiki.Date_Of_Death && wiki.Date_Of_Death.value !== null && Number(wiki.Date_Of_Death_Precision?.value) >= 9) {
			death = new Date(wiki.Date_Of_Death.value).toLocaleDateString('en-UK', this.extensionHelpers.getDateOptions(wiki.Date_Of_Death_Precision?.value));

			const age = this._calculateAge(new Date(wiki.Date_Of_Birth?.value ?? ''), new Date(wiki.Date_Of_Death.value));
			death += ` (aged ${age})`;

			if (wiki.DeathCityLabel && wiki.DeathCityLabel.value !== null) {
				deathPlace = wiki.DeathCityLabel.value;
				if (wiki.DeathCountry && wiki.DeathCountry.value !== null) {
					deathPlace += `, ${wiki.DeathCountry.value}`;
				}
			}
		}

		let yearsActive: string | null = null;

		// Years Active
		if (wiki.Years_Start && wiki.Years_Start.value !== null) {
			yearsActive = new Date(wiki.Years_Start.value).toLocaleDateString('en-UK', this.extensionHelpers.getDateOptions(9));
			if (wiki.Years_End && wiki.Years_End.value !== null) {
				yearsActive += `–${new Date(wiki.Years_End.value).toLocaleDateString('en-UK', this.extensionHelpers.getDateOptions(9))}`;

			} else if (wiki.Date_Of_Death && wiki.Date_Of_Death.value !== null && Number(wiki.Date_Of_Death_Precision?.value) >= 9) {
				yearsActive += `–${new Date(wiki.Date_Of_Death.value).toLocaleDateString('en-UK', this.extensionHelpers.getDateOptions(9))}`;

			} else {
				yearsActive += '–present';
			}
		}

		// Create Table
		//* ****************************************
		const table = document.createElement('table');
		if (this.isMobile) {
			table.setAttribute('class', 'extras-table mobile');

		} else {
			table.setAttribute('class', 'extras-table');
		}

		let empty = true;

		if (birth !== null) {
			if (name !== null) {
				this.extensionHelpers.createTableRow(table, 'Born', name, birth, birthPlace);
			} else {
				this.extensionHelpers.createTableRow(table, 'Born', birth, birthPlace);
			}
			empty = false;
		}

		if (death !== null) {
			if (deathPlace !== null) {
				this.extensionHelpers.createTableRow(table, 'Died', death, deathPlace);
			} else {
				this.extensionHelpers.createTableRow(table, 'Died', death, null);
			}

			empty = false;
		}

		if (yearsActive !== null) {
			this.extensionHelpers.createTableRow(table, 'Years active', yearsActive);
			empty = false;
		}

		// Add to page
		//* ****************************************
		if (empty === false) {
			if (this.isMobile) {
				document.querySelector('.sidebar .actions')?.prepend(table);

			} else if (document.querySelector('.bio') !== null) {
				document.querySelector('.bio')?.before(table);

			} else if (document.querySelector('.avatar.person-image') !== null) {
				document.querySelector('.avatar.person-image')?.after(table);

			}
		}
	}

	addWikiButton() {

		const url = this.wiki?.Wikipedia?.value ?? '';

		if (document.querySelector('.wiki-button')) return;
		if (this.extensionStorage.get('wiki-link-enabled') === false) return;
		if (url == '') return;

		// Create Button Element
		const button = this.extensionHelpers.createElement('a', {
			class: 'micro-button extras-button wiki-button',
			href: url
		});
		button.innerText = this.extensionHelpers.getWikiButtonLabel(url);
		
		if (this.extensionStorage.get('open-same-tab') != true) {
			button.setAttribute("target", "_blank");
		}

		// Add to Page
		document.querySelector('.micro-button:NOT(.extras-button)')?.after(button);
	}

	addIMDbButton() {
		
		let url = this.wiki?.IMDb_ID?.value ?? '';

		if (document.querySelector('.imdb-button')) return;
		if (url == '') return;

		url = `https://www.imdb.com/name/${url}`;

		// Create Button Element
		const button = this.extensionHelpers.createElement('a', {
			class: 'micro-button extras-button imdb-button',
			href: url
		});
		button.innerText = 'IMDB';
		
		if (this.extensionStorage.get('open-same-tab') != true) {
			button.setAttribute("target", "_blank");
		}

		// Add to Page
		document.querySelector('.micro-button:NOT(.extras-button)')?.before(button);

	}

	callWikiDataLostFilms() {

		this.lostFilms.loadState = LOAD_STATES['Loading'];
		const queryString = this.extensionHelpers.getWikiDataQuery('', '', '', false, 'LOSTFILMS', 'en');

		// Check for cached list in the browser storage
		const timestamp = this.extensionStorage.localGet('lost-films-timestamp');
		this.lostFilms.list = this.extensionStorage.localGet('lost-films');

		const now = new Date();
		const maxTime = 7 * 60 * 60 * 24 * 1000; // one week
		if (timestamp === null || timestamp === undefined || (now.getTime() - Number(timestamp)) > maxTime || this.lostFilms.list === null) {
			this.extensionHelpers.WriteConsoleLog('DEBUG', `Lost films - list is either not found or over a week old. Calling WikiData for new list...`);

			// Get new list - Call WikiData
			browser.runtime.sendMessage({ name: 'GETDATA', type: 'JSON', url: queryString.url, options: queryString.options }, (data: GetDataResponse<SparqlResults<LostFilmRow>>) => {
				if (this.extensionHelpers.ValidateResponse('WikiData', data) === false) {
					return;
				}

				const value = data.response;
				if (value !== null && value.results !== null && value.results.bindings !== null && value.results.bindings.length > 0) {
					this.extensionHelpers.WriteConsoleLog('DEBUG', `Lost films - Successfully retrieved list from WikiData.`);

					this.lostFilms.list = value.results.bindings.map(binding => binding.letterboxdID.value);
					this.lostFilms.loadState = LOAD_STATES['Pending'];

					// Save list to browser storage
					this.extensionStorage.localSet('lost-films', this.lostFilms.list);
					this.extensionStorage.localSet('lost-films-timestamp', new Date());
				}
			});
		} else {
			this.extensionHelpers.WriteConsoleLog('DEBUG', `Lost films - using cached list.`);
			
			// Use cached list in the browser storage
			this.lostFilms.list = this.extensionStorage.localGet('lost-films');
			this.lostFilms.loadState = LOAD_STATES['Pending'];

		}
	}

	processLostFilms() {

		this.lostFilms.loadState = LOAD_STATES['Success'];
		this.lostFilms.lostFilmCount = 0;
		this.lostFilms.visibleCount = 0;
		this.lostFilms.totalCount = 0;
		
		this.lostFilms.enabled = this.extensionStorage.localGet('hide-lost-films') === 'hide';

		// Check and set hidden
		const films = document.querySelectorAll('div.poster-grid ul li');
		for (let i = 0; i < films.length; i++) {

			const film = films[i];
			const filmID = film.querySelector('div')?.getAttribute('data-item-slug');

			if (filmID && this.lostFilms.list?.includes(filmID)) {
				film.classList.add('extras-lost-film');
				this.lostFilms.lostFilmCount++;
			}

			this.lostFilms.totalCount++;
		}
		
		this.extensionHelpers.WriteConsoleLog('DEBUG', `Lost films - Total films found ${this.lostFilms.totalCount}, lost films found ${this.lostFilms.lostFilmCount}`);

		// Create custom heading if one does not already exist
		if (document.querySelector('.filtered-message') == null) {
			const extrasuiHeader = this.extensionHelpers.createElement('section', {
				class: 'ui-block-header filtered-message body-text -small message-text extras-filter-header'
			}, {
				display: 'none'
			});
			const extrasuiHeading = this.extensionHelpers.createElement('p', {
				class: 'ui-block-heading'
			});
			extrasuiHeader.append(extrasuiHeading);
			const removeLink = this.extensionHelpers.createElement('a', {
				class: 'js-film-filter-remover',
				href: '#'
			});
			removeLink.innerText = 'Remove filters';
			extrasuiHeading.append(removeLink);

			// Append to page
			document.querySelector('.poster-grid')?.before(extrasuiHeader);

			extrasuiHeader.addEventListener('click', () => {
				this.extensionStorage.localSet('hide-lost-films', 'show');
			});
		}

		// Set the new header and existing header based on current filter
		if (this.lostFilms.enabled) {
			document.querySelector<HTMLElement>('.extras-lost-filter .item')?.click();
		}
	}

	toggleLostFilms(event: MouseEvent) {

		const filterButton = (event.target as Node).parentElement;
		if (filterButton === null) {
			return;
		}

		// Update selected filter and visible counts based on current selection
		let posterDisplay: string;
		if (filterButton.className.includes('smenu-subselected')) {
			// Unselect
			this.extensionStorage.localSet('hide-lost-films', 'show');
			this.lostFilms.enabled = false;
			filterButton.classList.remove('smenu-subselected');
			posterDisplay = 'revert';
			
			this.lostFilms.visibleCount = this.lostFilms.totalCount;
		} else {
			// Select
			this.extensionStorage.localSet('hide-lost-films', 'hide');
			this.lostFilms.enabled = true;
			filterButton.classList.add('smenu-subselected');
			posterDisplay = 'none';

			this.lostFilms.visibleCount = this.lostFilms.totalCount - this.lostFilms.lostFilmCount;

		}

		// Exit out if there are no lost films on the current page
		if (this.lostFilms.lostFilmCount == 0) return;

		// Toggle the visibility of the posters with a CSS rule
		this.styleSheet.deleteRule(this.lostFilmRuleIndex);
		this.styleSheet.insertRule(`.extras-lost-film{ display: ${posterDisplay} !important; }`, this.lostFilmRuleIndex);


		// Set text of the filter message header
		const filterContainer = document.querySelector<HTMLElement>('.filtered-message');
		const filterText = filterContainer?.querySelector<HTMLElement>('.ui-block-heading');
		if (!filterContainer || !filterText) {
			return;
		}

		let prefix = 'There are ';
		let suffix = ' films ';
		if (this.lostFilms.visibleCount === 1) {
			prefix = 'There is ';
			suffix = ' film ';
		}

		suffix += this._getPersonRole(window.location.pathname.match(/\/([A-za-z-]+)/)?.[1] ?? '');
		const removeLink = filterText.querySelector('.js-film-filter-remover');
		filterText.innerText = '';
		filterText.append(`${prefix + this.lostFilms.visibleCount + suffix} matching your filters. `);
		if (removeLink !== null) {
			filterText.append(removeLink);
		}
		filterText.append('.');

		if (this.lostFilms.enabled && this.lostFilms.lostFilmCount > 0) {
			filterContainer.style.display = 'block';

		} else if (filterContainer.className.includes('extras-filter-header')) {
			filterContainer.style.display = 'none';
		}


		// Update progress panel
		if (document.querySelector('.sidebar .actions .progress-panel') !== null) {
			const progressCounter = document.querySelector<HTMLElement>('.sidebar .actions .progress-panel .progress-status .progress-counter');
			const progressCount = progressCounter?.querySelector<HTMLElement>('.progress-count');
			const jsProgress = progressCount?.querySelector<HTMLElement>('.js-progress-count');
			if (!progressCounter || !progressCount || !jsProgress) {
				return;
			}

			// Get the original total
			let originalTotal = this.lostFilms.totalCount;
			const originalMatch = progressCounter.innerText.match(/\/ (\d+)/);
			if (originalMatch !== null) {
				originalTotal = parseInt(originalMatch[1]);
			}

			const watchedCount = parseInt(jsProgress.innerText);

			// Remove it from the span, then clear the span
			progressCount.remove();
			progressCount.innerText = '';
			// Re-add the progress to the span
			progressCount.innerText += ` of ${this.lostFilms.visibleCount}`;
			progressCount.prepend(jsProgress);
			// Add the count to the counter
			progressCounter.innerHTML = '';
			if (originalTotal !== this.lostFilms.visibleCount) {
				progressCounter.append(` / ${originalTotal} total`);
			}

			progressCounter.prepend(progressCount);

			// Update the percentage
			const progressPercent = document.querySelector<HTMLElement>('.sidebar .actions .progress-panel .progress-status p .progress-percentage');
			const percentage = Math.floor(watchedCount / this.lostFilms.visibleCount * 100);
			if (progressPercent) {
				progressPercent.innerText = String(percentage);
			}

			// Update the progress bar
			const progressContainer = document.querySelector('.progress-container');
			const progressBar = progressContainer?.querySelector<HTMLElement>('.progress-bar');
			if (progressBar) {
				progressBar.style.width = `${percentage}%`;
			}

			if (progressContainer) {
				progressContainer.className = percentage === 100 ? 'progress-container near-end' : 'progress-container near-zero';
			}
		}
	}


	_getPersonRole(role: PersonRole) {
		switch (role) {
			case 'director':
			case 'co-director':
			case 'additional-directing':
				return 'by this director';

			case 'writer':
			case 'producer':
			case 'executive-producer':
				return `by this ${role.replace('-', ' ')}`;

			case 'actor':
				return `with this ${role.replace('-', ' ')}`;

			case 'original-writer':
				return 'by this writer';

			case 'editor':
				return 'edited by this editor';

			case 'cinematography':
				return 'shot by this cinematographer';

			case 'composer':
				return 'with music by this composer';

			default:
				return `with ${role.replace('-', ' ')} by this artist`;
		}
	}

}
