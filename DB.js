
function DB() {
	this._sql_params = [];
	this._fields = '*';
	this._table_name = null;
	this._order_col = null;
	this._order_way = null;
	this._limit = null;
	this._startAt = 0;
	this._data = new QParams();
}


DB.Table = function(table_name){
	const db = new DB();
	db._table_name = table_name;
	return db;
}

DB.prototype.fields = function(fields = null){
	this._fields = calc_fields(fields);
	return this;
}

DB.prototype.limit = function(limit) {
	this._limit = limit;
	return this;
}

DB.prototype.startAt = function(at) {
	this._startAt = at;
	return this;
}
DB.prototype.orderBy = function(col, way = null) {
	this._order_col = col;
	if (way) this._order_way = way;
}

DB.prototype.where = function(col, mod, val) {
	this._data.where(col, mod, val);
	return this;
}

DB.prototype.orWhere = function(col, mod, val) {
	this._data.orWhere(col, mod, val);
	return this;
}


DB.prototype._createWheres = function(data = null) {
	if (!data) data = this._data.data;
	if (!data.data) return '';
	let str = '';
	if (data.data.length > 1) {
		str += '(';
	}

	data.data.map(function(spec, index) {
		if (index > 0) str += ` ${spec[3]} `;
		if (Array.isArray(spec)) {
			str += '`' + spec[0] + '` ' + spec[1] + ' ?'
			this._sql_params.push(spec[2]);
		} else {
			if (typeof spec === 'object' && spec !== null) {
				str += this._createWheres(spec);
			}
		}
	}.bind(this));

	if (data.data.length > 1) {
		str += ')';
	}
	return str;
}

DB.prototype._createOrderBy = function() {
	if (!this._order_col) return '';
	return 'ORDER BY `' + this._order_col + '`' + this._order_way ? this._order_way : '';
}

DB.prototype._createLimit = function() {
	if (!this._limit) return '';
	return 'LIMIT ' + (this._startAt ? `${this._startAt}, ` : '') + this._limit;
}




DB.prototype.update = function(definition) {
	const sets = Object.keys(definition).reduce(function(acc, key) {
		acc.push('`' + key + '`= ?');
		this._sql_params.push(definition[key]);
		return acc;
	}.bind(this), []).join(', ');

	const limit = this._createLimit();

	let wheres = this._createWheres();
	wheres = wheres ? ` WHERE ${wheres}` : '';


	console.log(this._sql_params);
	return `UPDATE \`${ this._table_name }\` SET ${ sets } ${wheres} ${limit}`;
}


DB.prototype.select = function() {
	let wheres = this._createWheres();
	const orders = this._createOrderBy();
	const limit = this._createLimit();

	wheres = wheres ? ` WHERE ${wheres}` : '';

	console.log(this._sql_params);
	return `SELECT ${this._fields} FROM \`${ this._table_name }\` ${wheres} ${orders} ${limit}`;
}

DB.prototype.delete = function() {
	let wheres = this._createWheres();
	const limit = this._createLimit();

	wheres = wheres ? ` WHERE ${wheres}` : '';

	console.log(this._sql_params);
	return `DELETE FROM \`${ this._table_name }\` ${wheres} ${limit}`;
}




DB.prototype.execute = function() {

	// const groups = this._createGroup();
	return this;
}



const QParams = function(){
	this.data = {
		join: ''
	};
}

QParams.prototype.where = function(col, mod= null, val= null) {
	if (typeof col === 'function') {
		const tmp = new QParams();
		tmp.data.join = 'AND';
		col(tmp);
		if (!this.data.data) {
			this.data.join = 'AND';
			this.data.data = [];
		}
		this.data.data.push(tmp.data);
	} else {
		this.add_data('AND', col, mod, val);
	}
	return this;
}
QParams.prototype.orWhere = function(col, mod= null, val= null) {
	if (typeof col === 'function') {
		const tmp = new QParams();
		tmp.data.join = 'OR';
		col(tmp);
		if (!this.data.data) {
			this.data.join = 'OR';
			this.data.data = [];
		}
		this.data.data.push(tmp.data);
	} else {
		this.add_data('OR', col, mod, val);
	}
	return this;
}



QParams.prototype.add_data = function(join, col, mod= null, val= null) {
	if (!this.data.data) {
		this.data.data = [];
		// this.data.join = ;
	}
	this.data.data.push([col, mod, val, join]);
}


function calc_fields(fields) {
	if (fields === '' || fields === null || fields === undefined) {
		return '*';
	}

	if (Array.isArray(fields)) {
		return '`' + fields.join('`,`') + '`';
	}

	return fields;
}


module.exports = DB;