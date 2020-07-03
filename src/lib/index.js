function commaStringToArray(str) {
	return str.split(',').map(x => x.trim());
}


export {
    commaStringToArray
}