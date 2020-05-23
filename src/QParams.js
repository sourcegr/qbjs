

const QParams = function(){
	this.data = {
		join_term: ''
	};
}

QParams.prototype.where = function(col, mod, val) {
	return this.parse_input_clause('AND', col, mod, val);
}

QParams.prototype.orWhere = function(col, mod, val) {
	return this.parse_input_clause('AND', col, mod, val);
}

QParams.prototype.add_data = function(join_term, col, mod, val) {
	if (!this.data.data ) {
		this.data.data = [];
	}

	this.data.data.push([col, mod, val, join_term]);
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
	if (!mod) {
		val = mod;
		mod = '=';
	}
	this.add_data(join_term, key, mod, val);
}

module.exports = QParams;