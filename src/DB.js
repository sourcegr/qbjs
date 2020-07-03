import QParams from './QParams';
import {commaStringToArray} from './lib/index';

let connector = null;


function DB() {
    this._select_all = true;
    this._is_loose = true;

    this._joins = [];
    this._sql_params = [];

    this._cols = '*';
    this._table = null;
    this._order_col = null;
    this._order_way = null;
    this._limit = null;
    this._groupBy = null;
    this._having = null;
    this._start_at = 0;
    this._data = new QParams();
    this.W = this._data.parse_input_clause.bind(this._data);
}

DB.connect = function (c) {
    connector = c;
}

DB.Table = function (table) {
    if (!connector) throw new Error('No connector specified');
    const db = new DB();
    db._table = table;
    return db;
}

DB.prototype.C = function () {
    return connector;
}





DB.prototype.strict = function () {
    this._is_loose = false;
    return this;
}
DB.prototype.cols = function (...args) {
    const cols = args.length === 1 ? args[0] : args;

    if (cols === '' || cols === '*' || cols === null || cols === undefined) {
        this._select_all = true;
        this._cols = null;
        return this;
    }

    this._select_all = false;

    if (typeof cols === 'string') {
        this._cols = commaStringToArray(cols);
        return this;
    }

    if (Array.isArray(cols)) {
        this._cols = cols;
        return this;
    }

    throw new Error('Only string and array are supported for column selection');
}
DB.prototype.startAt = DB.prototype.offset = function (at) {
    this._start_at = at;
    return this;
}
DB.prototype.limit = function (limit) {
    this._limit = limit;
    return this;
}
DB.prototype.orderBy = function (col, way = null) {
    this._order_col = col;
    if (way) this._order_way = way;
    return this;
}
DB.prototype.groupBy = function (...args) {
    const cols = args.length === 1 ? args[0] : args;
    if (typeof cols == 'string') {
        // 'customer_id, date_id'
        this._groupBy = commaStringToArray(cols);
        return this;
    }
    if (Array.isArray(cols)) {
        this._groupBy = cols;
        return this;
    }
    throw new Error('GROUP BY expects either a string or an array');
}
DB.prototype.having = function (...args) {
    let [c, e, v] = [...args, null, null];
    if (e === null) {
        e = '';
        v = '';
    }
    if (v === null) {
        [v, e] = [e, '='];
    }
    this._having = [c, e, v];
    return this;
}



DB.prototype.where = function (col, mod = null, val = null) {
    this.W('AND', col, mod, val);
    return this;
}
DB.prototype.orWhere = function (col, mod = null, val = null) {
    this.W('OR', col, mod, val);
    return this;
}
DB.prototype.whereIn = function (col, arr = []) {
    this.W('AND', col, 'IN', arr);
    return this;
}
DB.prototype.orWhereIn = function (col, arr = []) {
    this.W('OR', col, 'IN', arr);
    return this;
}
DB.prototype.whereLike = function (col, arr = []) {
    this.W('AND', col, ' LIKE ', arr);
    return this;
}
DB.prototype.orWhereLike = function (col, arr = []) {
    this.W('OR', col, ' LIKE ', arr);
    return this;
}
DB.prototype.whereNotLike = function (col, arr = []) {
    this.W('AND', col, ' NOT LIKE ', arr);
    return this;
}
DB.prototype.orWhereNotLike = function (col, arr = []) {
    this.W('OR', col, ' NOT LIKE ', arr);
    return this;
}
DB.prototype.whereNotIn = function (col, arr = []) {
    this.W('AND', col, 'NOT IN', arr);
    return this;
}
DB.prototype.orWhereNotIn = function (col, arr = []) {
    this.W('OR', col, 'NOT IN', arr);
    return this;
}


DB.prototype.join = function (table, jointext, how = 'INNER') {
    this._joins.push(`${how} JOIN ${table} ${jointext}`);
    return this;
}
DB.prototype.leftJoin = function (table, jointext) {
    this._joins.push(`LEFT JOIN ${table} ${jointext}`);
    return this;
}
DB.prototype.rightJoin = function (table, jointext) {
    this._joins.push(`RIGHT JOIN ${table} ${jointext}`);
    return this;
}



DB.prototype._getSelect = function () {
    let S_Cols, S_Table, S_Where, S_Joins, S_Order, S_Limit, S_Group, S_Havin;

    if (this._is_loose) {
        S_Cols = this._select_all ? '*' : this._cols.join(',');
        S_Table = this._table;
        S_Joins = this._createJoins();
        S_Where = this._createWheres();
        S_Group = this._groupBy ? 'GROUP BY ' + (this._groupBy.join(',')) : null;
        S_Havin = (this._groupBy && this._having) ? 'HAVING ' + this._having.join() : null;
        S_Order = this._createOrderBy(this._order_col);
        S_Limit = this._createLimit();
    } else {
        S_Cols = this._select_all ? '*' : this._createSelectCols();
        S_Table = this.C().grammar.quote(this._table);
        S_Joins = this._createJoins();
        S_Where = this._createWheres();
        S_Group = this._groupBy ? 'GROUP BY ' + (this._groupBy.map(this._addTableNameToCol, this).join(',')) : null;
        S_Havin = (this._groupBy && this._having) ? 'HAVING ' + this._having.join('') : null;
        S_Order = this._createOrderBy(this._addTableNameToCol(this._order_col));
        S_Limit = this._createLimit();
    }

    const sql = ["SELECT", S_Cols, 'FROM', S_Table, S_Joins, S_Where, S_Group, S_Havin, S_Order, S_Limit].filter(x => x!== null).join(' ');
    return [sql, this._sql_params];
}

DB.prototype._createSelectCols = function () {
    const cols = this._cols.map(this._addTableNameToCol, this)
    return cols.join(',');
}
DB.prototype._createWheres = function (data = null) {
    if (!data) data = this._data.data;
    if (!data.data) return '';

    let allParts = [];
    if (data.data.length > 0) {
        allParts.push('(');
    }

    data.data.map((spec, index) => {
            if (Array.isArray(spec)) {
                let [col, term, val, join] = spec;
                if (index > 0) allParts.push(` ${join} `);

                col = this._is_loose ? col : this._addTableNameToCol(col);

                if (term === 'IN' || term === 'NOT IN') {
                    if (typeof val === 'string') {
                        this._sql_params.push(val);
                        allParts.push(`${col} ${term} (?)`);
                        return;
                    }

                    if (Array.isArray(val)) {
                        this._sql_params = [...this._sql_params, [...val].join(',')];
                        allParts.push(`${col} ${term} (?)`);
                        return;
                    }

                    if (typeof val === 'object' && val !== null) {
                        // subquery
                        let [sql, params] = val._getSelect();
                        this._sql_params = [...this._sql_params, ...params];
                        allParts.push(`${col} ${term}(${sql})`);
                        return;
                    }
                }


                if (val !== null) this._sql_params = [...this._sql_params, val];
                allParts.push(col + term + '?')
                return;
            }

            if (typeof spec === 'object' && spec !== null) {
                allParts.push(` ${spec.join_term} ` + this._createWheres(spec));
                // return;
            }
        }
    )

    if (data.data.length > 0) {
        allParts.push(')');
    }

    return allParts.length ? 'WHERE ' + allParts.join('') : null;
}
DB.prototype._createOrderBy = function (col) {
    if (col === null) return null;
    return `ORDER BY ${col}` + (this._order_way ? ` ${this._order_way}` : '');
}
DB.prototype._createJoins = function () {
    return this._joins.join(' ');
}
DB.prototype._createLimit = function () {
    if (!this._limit) return '';
    if (this._limit) this._sql_params.push(this._limit);
    if (this._start_at) this._sql_params.push(this._start_at);
    return this.C().grammar.limit(this._limit, this._start_at);
}

DB.prototype._addTableNameToCol = function (col) {
    if (col == null) return null;
    let [t, c] = `${col}.`.split('.');
    if (!c) {
        c = t;
        t = this._table;
    }
    return this.C().grammar.quote(t) + '.' + this.C().grammar.quote(c);
}




DB.prototype.select = function (...args) {
    if (args.length) {
        this.cols(args);
    }
    const [sql, params] = this._getSelect();
    return connector.insert(sql, params);
}

DB.prototype.insert = function (definition) {
}

DB.prototype.update = function (definition) {
}

DB.prototype.delete = function () {
}


export default DB;