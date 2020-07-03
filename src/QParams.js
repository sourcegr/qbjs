const QParams = function(){
	this.data = {
		join_term: '',
		data: []
	};
}

QParams.prototype.add_data = function(join_term, col, mod, val) {
	this.data.data.push([col, mod, val, join_term]);
}

QParams.prototype.where = function(col, mod, val) {
	return this.parse_input_clause('AND', col, mod, val);
}

QParams.prototype.parse_input_clause = function(join_term, col, mod, val) {
	if (typeof col === 'function') {
		const tmp = new QParams();
		tmp.data.join_term = join_term;
		col(tmp);
		if (!this.data.data) {
			this.data.join_term = join_term;
			this.data.data = [];
		}
		this.data.data.push(tmp.data);
		return this;
	}

	if (typeof col === 'object' && col !== null) {
		Object.keys(col).map(key => {
			this.add_data(join_term, key, '=', col[key]);
		});
		return this;
	}

	if (mod === null && val === null) {
		mod = ' IS NOT NULL'
		val = null;
	} else {
		if (val === null) {
			val = mod;
			mod = '=';
		}
	}

	this.add_data(join_term, col, mod, val);
	return this;
}

export default QParams;