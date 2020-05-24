const QParams = require('./QParams');

let connector = async function(sql, sql_params) {
	return [sql, sql_params];
}

function init_db(connector_pool = null) {
	connector = connector_pool;
}

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

DB.prototype.where = function(col, mod = null, val = null) {
	this._data.where(col, mod, val);
	return this;
}

DB.prototype.orWhere = function(col, mod = null, val = null) {
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

	data.data.map((spec, index) => {
		if (index > 0) str += ` ${spec[3]} `;
		if (Array.isArray(spec)) {
			str += '`' + spec[0] + '` ' + spec[1] + ' ?'
			this._sql_params.push(spec[2]);
		} else {
			if (typeof spec === 'object' && spec !== null) {
				str += this._createWheres(spec);
			}
		}
	});

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










DB.prototype.select = async function(fields = null) {
	if (fields) {
		this.fields(fields);
	}

	let wheres = this._createWheres();
	const orders = this._createOrderBy();
	const limit = this._createLimit();

	wheres = wheres ? ` WHERE ${wheres}` : '';
	const sql = `SELECT ${this._fields} FROM \`${ this._table_name }\` ${wheres} ${orders} ${limit}`;

	if (connector) {
		return await connector(sql, this._sql_params);
	}

	return await connector(sql, this._sql_params);
}

DB.prototype.selectOne = async function(fields) {
	if (fields) {
		this.fields(fields);
	}

	let wheres = this._createWheres();
	const orders = this._createOrderBy();

	wheres = wheres ? ` WHERE ${wheres}` : '';

	const sql = `SELECT ${this._fields} FROM \`${ this._table_name }\` ${wheres} ${orders} LIMIT 1`;
	return await connector(sql, this._sql_params);
}

DB.prototype.update = async function(definition) {
	const sets = Object.keys(definition).reduce((acc, key) => {
		acc.push('`' + key + '`= ?');
		this._sql_params.push(definition[key]);
		return acc;
	}, []).join(', ');

	const limit = this._createLimit();

	let wheres = this._createWheres();
	wheres = wheres ? ` WHERE ${wheres}` : '';

	const sql = `UPDATE \`${ this._table_name }\` SET ${ sets } ${wheres} ${limit}`;
	return await connector(sql, this._sql_params);
}


DB.prototype.delete = async function() {
	let wheres = this._createWheres();
	const limit = this._createLimit();

	wheres = wheres ? ` WHERE ${wheres}` : '';

	const sql = `DELETE FROM \`${ this._table_name }\` ${wheres} ${limit}`;
	return await connector(sql, this._sql_params);
}




// DB.prototype.execute = function() {
// 	// const groups = this._createGroup();
// 	return this;
// }


DB.prototype.fields = function(fields) {
	if (fields === '' || fields === null || fields === undefined) {
		this._fields = '*';
		return this;
	}

	if (Array.isArray(fields)) {
		this._fields = '`' + fields.join('`,`') + '`';
		return this;
	}

	this._fields = fields;
	return this;
}


module.exports = {
	DB, init_db
};