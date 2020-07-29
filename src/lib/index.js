function commaStringToArray(str) {
	return str.split(',').map(x => x.trim());
}


module.exports = {
    commaStringToArray
};