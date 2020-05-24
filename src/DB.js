const QParams = require('./QParams');

let connector = {
	query: async function(sql, sql_params) {
		return [sql, sql_params];
	}
}

function init_db(connector_pool = null) {
	connector = connector_pool;
}

/**
 * constructor
 */
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

/**
 * Factory function to init a BUilder
 * and set the table for the query
 *
 * @param {String} table_name
 *
 * @return {DB} - Builder
 */
DB.Table = function(table_name){
	const db = new DB();
	db._table_name = table_name;
	return db;
}

/**
 * Sets the number or results to get
 *
 * @param {Number} limit - The number of results to get
 *
 * @return {DB} - Builder
 *
 * @example .startAt(4).limit(10) will skip 4 results and fetch 10 results
 */
DB.prototype.limit = function(limit) {
	this._limit = limit;
	return this;
}

/**
 * Sets the number for the results to skip
 *
 * @param {Number} at - How many results to skip
 *
 * @return {DB} - Builder
 *
 * @example .startAt(4).limit(10) will skip 4 results and fetch 10 results
 */
DB.prototype.startAt = function(at) {
	this._startAt = at;
	return this;
}

/**
 * Sets the column and (optionally) the way to sort results by
 *
 * @param {String} col - Column name
 * @param {String} way - ASC or DESC
 *
 * @return {DB} - Builder
 *
 * @example .orderBy('name') will sort by name ASCENDING
 * @example .orderBy('name', DESC) will sort by name DESC
 */
DB.prototype.orderBy = function(col, way = null) {
	this._order_col = col;
	if (way) this._order_way = way;
}

/**
 * Sets a where clause.
 * Joins prevoius wheres with AND
 *
 * @param {String|Function|Object} col - Column name
 * @param {String|null=} mod - Modifier, or value in val is ommited
 * @param {String|null=} val - The value
 *
 * @example(.where({id:1})
 * @example(.where('id', '=', '1')
 * @example(.where('id', '1')
 *
 * @return {DB} - Builder
 */
DB.prototype.where = function(col, mod = null, val = null) {
	this._data.where(col, mod, val);
	return this;
}

/**
 * Sets a where clause.
 * Joins prevous wheres with OR
 *
 * @param {String|Function|Object} col - Column name
 * @param {String|null=} mod - Modifier, or value in val is ommited
 * @param {String|null=} val - The value
 *
 * @example(.where({id:1})
 * @example(.where('id', '=', '1')
 * @example(.where('id', '1')
 *
 * @return {DB} - Builder
 */

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


/**
 * Runs a raw SQL Query
 *
 * @param {String} sql - The raw SQL Statement
 * @param {Array=} params - Array with the parameters
 *
 * @return - result
 *
 */
DB.prototype.raw = async function(sql, params=null) {
	return await connector.query(sql, params);
}

DB.prototype.select = function(fields = null) {
	if (fields) {
		this.fields(fields);
	}

	let wheres = this._createWheres();
	const orders = this._createOrderBy();
	const limit = this._createLimit();

	wheres = wheres ? ` WHERE ${wheres}` : '';
	const sql = `SELECT ${this._fields} FROM \`${ this._table_name }\` ${wheres} ${orders} ${limit}`;

	return connector.query(sql, this._sql_params);
}


/**
 * Runs a select statement for the provided fields and returns the first result
 *
 * @param {Array|String|empty} fields - The fields to select. * Can be Array, of strings a simple comma separated string null/empty for all collumns
 *
 * @return {Array|Null} - the first set of results or null
 *
 * @example select(['id', 'name']} // select id, name
 * @example select('gender, email'} // select gender, email ...
 * @example select() // select * ...
 *
 */
DB.prototype.selectOne = async function(fields) {
	if (fields) {
		this.fields(fields);
	}

	let wheres = this._createWheres();
	const orders = this._createOrderBy();

	wheres = wheres ? ` WHERE ${wheres}` : '';

	const sql = `SELECT ${this._fields} FROM \`${ this._table_name }\` ${wheres} ${orders} LIMIT 1`;
	const result = await connector.query(sql, this._sql_params);
	return result.length > 0 ? result[1] : null;
}

DB.prototype.update = function(definition) {
	const sets = Object.keys(definition).reduce((acc, key) => {
		acc.push('`' + key + '`= ?');
		this._sql_params.push(definition[key]);
		return acc;
	}, []).join(', ');

	const limit = this._createLimit();

	let wheres = this._createWheres();
	wheres = wheres ? ` WHERE ${wheres}` : '';

	const sql = `UPDATE \`${ this._table_name }\` SET ${ sets } ${wheres} ${limit}`;
	return connector.query(sql, this._sql_params);
}


DB.prototype.delete = function() {
	let wheres = this._createWheres();
	const limit = this._createLimit();

	wheres = wheres ? ` WHERE ${wheres}` : '';

	const sql = `DELETE FROM \`${ this._table_name }\` ${wheres} ${limit}`;
	return connector.query(sql, this._sql_params);
}





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