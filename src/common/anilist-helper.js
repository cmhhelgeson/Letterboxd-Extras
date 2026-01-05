const LOAD_STATES = {
	Uninitialized: 'Uninitialized',
	Loading: 'Loading',
	Success: 'Success',
	Failure: 'Failure'
};

class AnilistHelper {

	constructor( loadSuccessCallback, htmlHelper, appendRatingCallback ) {

		this.loadState = LOAD_STATES[ 'Uninitialized' ];
		this.id = null;
		this.data = null;
		this.highest = 0;
		this.num_ratings = 0;
		this.isMobile = false;

		this.loadSuccessCallback = loadSuccessCallback;
		this.htmlHelper = htmlHelper;
		this.appendRatingCallback = appendRatingCallback;

	}

	changeID( id ) {

		this.id = id;

	}

	getQuery() {

		return `
			query ($id: Int!) {
				Media(id: $id, type: ANIME) {
					averageScore
					meanScore
					popularity
					stats {
						scoreDistribution {
						score
						amount
						}
					}
					siteUrl
					}
			}
		`;

	}

	_addAnilistRatings() {

		if ( document.querySelector( '.al-ratings' ) ) return;

		if ( ! document.querySelector( '.sidebar' ) ) return;

		if ( this.data == null ) return;

		// Init
		this.score = 'N/A';
		if ( this.data.averageScore != null ) {

			this.score = this.data.averageScore;

		}

		this.num_ratings = 0;
		let ii = 0;
		// Loop first and determine highest votes and total
		if ( this.data.stats.scoreDistribution.length === 10 ) {

			while ( ii < 10 ) {

				const amount = this.data.stats.scoreDistribution[ ii ].amount;
				if ( amount > this.highest ) {

					this.highest = amount;

				}

				this.num_ratings += amount;
				ii ++;

			}

		}

		// Return if there are no ratings
		if ( this.num_ratings == 0 ) {

			return;

		}

		// Create and Add
		// Add the section to the page
		const scoreSection = this.htmlHelper.createElement( 'section', {
			class: 'section ratings-histogram-chart al-ratings ratings-extras extras-chart'
		} );

		// Add the Header
		const heading = this.htmlHelper.createElement( 'h2', {
			class: 'section-heading section-heading-extras'
		} );
		scoreSection.append( heading );

		const logoHolder = this.htmlHelper.createElement( 'a', {
			class: 'logo-holder-anilist',
			style: 'width: 100%;',
			href: `${this.data.siteUrl}/stats`
		} );
		heading.append( logoHolder );

		const logo = this.htmlHelper.createElement( 'span', {
			class: 'logo-anilist',
			style: 'height: 20px; width: 20px; background-image: url("https://graphql.anilist.co/img/icons/icon.svg");'
		} );
		logoHolder.append( logo );

		const logoText = this.htmlHelper.createElement( 'span', {
			class: 'text-anilist',
			style: 'vertical-align: super;'
		} );
		logoText.innerText = 'AniList';
		logoHolder.append( logoText );

		let showDetails = null;
		if ( this.isMobile ) {

			// Add the Show Details button
			showDetails = this.htmlHelper.createShowDetailsButton( 'al', 'al-score-details' );
			scoreSection.append( showDetails );

		}

		// Shouldn't need to have any understanding of the mobile context of the overall application in this function.
		scoreSection.append( this.htmlHelper.createHistogramScore( 'al', this.score, this.num_ratings, `${this.data.siteUrl}/reviews` ) ); //this.isMobile));
		console.log( ii );
		scoreSection.append( this.htmlHelper.createHistogramGraph( 'al', '', this.num_ratings, this.data.stats.scoreDistribution, this.data.stats.scoreDistribution[ ii ], this.highest ) );

		// Add the tooltip as text for mobile
		const score = scoreSection.querySelector( '.average-rating .tooltip' );
		let tooltip = '';
		if ( score != null ) {

			tooltip = score.getAttribute( 'data-original-title' );
			this.htmlHelper.createDetailsText( 'al', scoreSection, tooltip, false ); // this.isMobile);

		}

		// Append to the sidebar
		//* ****************************************************************

		this.appendRatingCallback( scoreSection, 'al-ratings' );

		// Add the hover events
		//* ****************************************************************
		this.htmlHelper.addTooltipEvents( scoreSection );

	}

	fetchData() {

		const query = this.getQuery();
		const options = {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json'
			},
			body: JSON.stringify( {
				query: query,
				variables: { id: this.id }
			} )
		};

		try {

			this.loadState = LOAD_STATES[ 'Loading' ];
			browser.runtime.sendMessage( { name: 'GETDATA', type: 'JSON', url: 'https://graphql.anilist.co', options: options }, value => {

				if ( this.htmlHelper.ValidateResponse( 'AniList API', value ) == false ) {

					return;

				}

				const al = value.response;
				if ( al && al.data != null ) {

					this.data = al.data.Media;
					if ( this.data != null ) {

						this.url = this.data.siteUrl;
						this.loadState = LOAD_STATES[ 'Success' ];
						this.loadSuccessCallback( this.url, 'AL', 'al-button' );
						this._addAnilistRatings();

					} else {

						this.loadState = LOAD_STATES[ 'Failure' ];

					}

				} else {

					this.loadState = LOAD_STATES[ 'Failure' ];
					if ( value.errors != null ) {

						console.error( `Letterboxd Extras | AniList API Error: ${value.errors[ 0 ].message}` );

					} else {

						console.error( `Letterboxd Extras | AniList Unknown API Error. Status: ${value.status}` );

					}

				}

			} );

		} catch ( e ) {

			console.error( 'Letterboxd Extras | Unable to parse AniList URL' );
			this.loadState = LOAD_STATES[ 'Failure' ];

		}

	}

}
