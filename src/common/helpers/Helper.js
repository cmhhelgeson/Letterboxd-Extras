class Helper {

	static LOAD_STATES = {
		'Uninitialized': 0,
		'Loading': 1, 
		'Success': 2,
		'Failure': 3
	}

	constructor() {
	} 

	fetchData() {
		throw new Error("Must implement method fetchData()")
	}
 
}  