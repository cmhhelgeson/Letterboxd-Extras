/* eslint-disable @typescript-eslint/no-explicit-any */
// List of useful types
// Currently just placing types here
// Once typing is more meaningfully integrated we can start thinking about better structures


export type SourceIdentifier = 
	'tomato' | 
	'cinemascore' |
	'meta' | 
	'sens' | 
	'mubi' |
	'filmaff' | 
	'filmarks' |
	'simkl' | 
	'kinopoisk' |
	'douban' |
	'allocine' |
	'mdl' |
	'mal' |
	'anilist' |
	'anidb' |
	'criterion' |
	'mojo' |
	'wiki' |
	'ddd' |
	'bluray' |
	'ebert'

// Reply the background script sends back for every `{ name: 'GETDATA' }` message
export interface GetDataResponse<T> {
	response: T | null
}

// A single bound column in a SPARQL result row
export interface SparqlValue {
	value: string | null
}

// Body of a WikiData SPARQL query; T is the row shape, with unbound columns left optional
export interface SparqlResults<T> {
	results: {
		bindings: T[]
	}
}

enum MoveRatingState {
	UNMOVED,
	MOVED,
	CONFIRMED
}

export interface PageState { 
	isMobile: boolean | null,
	hideRatings: boolean | null
	hideReviews: boolean | null
	filmWatched: boolean | null
	ratingMoved: MoveRatingState // 0 is unmoved, 1 is moved but hideRatings was null, 2 is confirmed
	reviewsMoved: number
}

export interface StorageObject {

	data: Record<string, string>;
	localData: Record<string, string>
	syncInitilized: boolean,
	localInitilized: boolean,
	init: () => void,
	initLocal: () => void,
	get: (key: string) => any;
	set: (key: string, value: string) => void;
	localGet: (key: string) => any
	localSet: (key: string, value: unknown) => Promise<void>

}