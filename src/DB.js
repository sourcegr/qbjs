import QParams from './QParams';

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
	this._joins = [];
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

DB.prototype.whereIn = function(col, match_list = []) {
	this._data.whereIn(col, match_list);
	return this;
}
DB.prototype.whereNotIn = function(col, match_list = []) {
	this._data.whereNotIn(col, match_list);
	return this;
}
DB.prototype.orWhereIn = function(col, match_list = []) {
	this._data.orWhereIn(col, match_list);
	return this;
}
DB.prototype.orWhereNotIn = function(col, match_list = []) {
	this._data.orWhereNotIn(col, match_list);
	return this;
}

/**
 * Sets a where clause.
 * Joins previous wheres with OR
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
	// console.log(data)
	if (!data) data = this._data.data;
	if (!data.data) return '';
	let str = '';
	if (data.data.length > 0) {
		str += '(';
	}

	data.data.map((spec, index) => {
		// console.log('==', typeof spec, spec, '==')
		if (Array.isArray(spec)) {
			if (index > 0) str += ` ${spec[3]} `;
			let questionmark = '?';
			if (spec[1] === 'IN' || spec[1] === 'NOT IN' || spec[1] === 'NOT IN' || spec[1] === 'NOT WHERE IN') {
				questionmark = '(?)';
			}
			// console.log('-')
			// console.log(spec[2])
			if (typeof spec[2] === 'object' && spec[2] !== null) {
				const [sql, params] = spec[2].getData();
				str += '`' + spec[0] + '`' + spec[1] + `(${sql})`;
				this._sql_params = [...this._sql_params, ...params];
			} else {
				str += '`' + spec[0] + '`' + spec[1] + questionmark;
				this._sql_params.push(spec[2]);
			}

		} else {
			if (typeof spec === 'object' && spec !== null) {
				str += ` ${spec.join_term} ` + this._createWheres(spec);
			}
		}
	});

	if (data.data.length > 0) {
		str += ')';
	}
	return str;
}

DB.prototype._createJoins = function() {
	return this._joins.join(' ');
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
	const [sql, data] = this.getData(fields);

	return connector.query(sql, data);
}

DB.prototype.getData = function(fields = null) {
	if (fields !== null) this.fields(fields);
	let wheres = this._createWheres();
	const orders = this._createOrderBy();
	const limit = this._createLimit();
	const joins = this._createJoins();

	wheres = wheres ? ` WHERE ${wheres}` : '';
	const sql = `SELECT ${this._fields} FROM \`${ this._table_name }\` ${joins} ${wheres} ${orders} ${limit}`;

	return [sql, this._sql_params];
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
	this.fields(fields);

	let wheres = this._createWheres();
	const orders = this._createOrderBy();
	const joins = this._createJoins();

	wheres = wheres ? `WHERE ${wheres}` : '';

	const sql = `SELECT ${this._fields} FROM \`${ this._table_name }\` ${joins} ${wheres} ${orders} LIMIT 1`;
	const result = await connector.query(sql, this._sql_params);
	return result.length > 0 ? result[0] : null;
}

DB.prototype.join = function(table, jointext, how='LEFT') {
	this._joins.push(`${how} JOIN ${table} ${jointext}`);
	return this;
}

DB.prototype.update = function(definition) {
	const sets = Object.keys(definition).reduce((acc, key) => {
		acc.push('`' + key + '`= ?');
		this._sql_params.push(definition[key]);
		return acc;
	}, []).join(', ');

	const limit = this._createLimit();

	let wheres = this._createWheres();
	wheres = wheres ? `WHERE ${wheres}` : '';

	const sql = `UPDATE \`${ this._table_name }\` SET ${ sets } ${wheres} ${limit}`;
	return connector.query(sql, this._sql_params);
}

DB.prototype.insert = function(definition) {
	if (typeof definition === 'object' && definition !== null) {
		const fields_list = create_fields_list(Object.keys(definition), this._table_name);
		this._sql_params = Object.values(definition)
		const questions = Array(this._sql_params.length).fill('?').join(',');

		const sql = `INSERT INTO \`${ this._table_name }\` (${ fields_list }) VALUES (${ questions })`;
		return connector.query(sql, this._sql_params);
	}

}


DB.prototype.delete = function() {
	let wheres = this._createWheres();
	const limit = this._createLimit();

	wheres = wheres ? ` WHERE ${wheres}` : '';

	const sql = `DELETE FROM \`${ this._table_name }\` ${wheres} ${limit}`;
	return connector.query(sql, this._sql_params);
}





DB.prototype.fields = function(fields = null) {

	if (fields === '' || fields === null || fields === undefined) {
		this._fields = '`' + this._table_name + '`.*';
		return this;
	}

	if (Array.isArray(fields)) {
		this._fields = create_fields_list(fields, this._table_name);
		return this;
	}

	this._fields = fields;
	return this;
}



function create_fields_list(fields, table_name) {
	return fields.reduce((acc, field) => {
		acc.push( field.indexOf('.') > -1
		   ? field
		   : '`' + table_name + '`.`' + field + '`'
		);
		return acc;
	}, []).join(',');
}

export default DB;