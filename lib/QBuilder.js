'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _QParams = require('./QParams');

var _QParams2 = _interopRequireDefault(_QParams);

var _index = require('./lib/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function RAW(v) {
    this.value = v;
}

function QB(pool, grammar, table) {
    this.grammar = grammar.setConnection(pool);
    this._table = table;

    this._select_all = true;
    this._is_loose = true;

    this._joins = [];
    this._sql_params = [];

    this._cols = '*';
    this._order_col = null;
    this._order_way = null;
    this._limit = null;
    this._groupBy = null;
    this._having = null;
    this._start_at = 0;

    this._data = new _QParams2.default();
    this.W = this._data.parse_input_clause.bind(this._data);

    this.getPlaceholder = this.grammar.placeholder.bind(this.grammar);
    this.CL = this.grammar.createLimit.bind(this.grammar);
}

QB.RAW = function (v) {
    return new RAW(v);
};

QB.prototype.strict = function () {
    this._is_loose = false;
    return this;
};
QB.prototype.cols = function (...args) {
    // dd(args)
    // dd(args.length)
    const cols = args.length === 1 ? args[0] : args;
    // dd(cols)
    if (cols === '' || cols === '*' || cols === null || cols === undefined) {
        this._select_all = true;
        this._cols = null;
        return this;
    }

    this._select_all = false;

    if (typeof cols === 'string') {
        this._cols = (0, _index.commaStringToArray)(cols);
        return this;
    }

    if (Array.isArray(cols)) {
        this._cols = cols;
        return this;
    }

    throw new Error('Only string and array are supported for column selection');
};
QB.prototype.startAt = QB.prototype.offset = function (at) {
    this._start_at = at;
    return this;
};
QB.prototype.limit = function (limit) {
    this._limit = limit;
    return this;
};
QB.prototype.orderBy = function (col, way = null) {
    this._order_col = col;
    if (way) this._order_way = way;
    return this;
};
QB.prototype.groupBy = function (...args) {
    const cols = args.length === 1 ? args[0] : args;
    if (typeof cols == 'string') {
        // 'customer_id, date_id'
        this._groupBy = (0, _index.commaStringToArray)(cols);
        return this;
    }
    if (Array.isArray(cols)) {
        this._groupBy = cols;
        return this;
    }
    throw new Error('GROUP BY expects either a string or an array');
};
QB.prototype.having = function (...args) {
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
};

QB.prototype.where = function (col, mod = null, val = null) {
    this.W('AND', col, mod, val);
    return this;
};
QB.prototype.orWhere = function (col, mod = null, val = null) {
    this.W('OR', col, mod, val);
    return this;
};
QB.prototype.whereIn = function (col, arr = []) {
    this.W('AND', col, 'IN', arr);
    return this;
};
QB.prototype.orWhereIn = function (col, arr = []) {
    this.W('OR', col, 'IN', arr);
    return this;
};
QB.prototype.whereLike = function (col, arr = []) {
    this.W('AND', col, ' LIKE ', arr);
    return this;
};
QB.prototype.orWhereLike = function (col, arr = []) {
    this.W('OR', col, ' LIKE ', arr);
    return this;
};
QB.prototype.whereNotLike = function (col, arr = []) {
    this.W('AND', col, ' NOT LIKE ', arr);
    return this;
};
QB.prototype.orWhereNotLike = function (col, arr = []) {
    this.W('OR', col, ' NOT LIKE ', arr);
    return this;
};
QB.prototype.whereNotIn = function (col, arr = []) {
    this.W('AND', col, 'NOT IN', arr);
    return this;
};
QB.prototype.orWhereNotIn = function (col, arr = []) {
    this.W('OR', col, 'NOT IN', arr);
    return this;
};
QB.prototype.whereNull = function (col) {
    this.W('AND', col, null, 'IS NULL');
    return this;
};
QB.prototype.orWhereNull = function (col) {
    this.W('OR', col, null, 'IS NULL');
    return this;
};
QB.prototype.whereNotNull = function (col) {
    this.W('AND', col, null, 'IS NOT NULL');
    return this;
};
QB.prototype.orWhereNotNull = function (col) {
    this.W('OR', col, null, 'IS NOT NULL');
    return this;
};

QB.prototype.join = function (table, jointext, how = 'INNER') {
    this._joins.push(`${how} JOIN ${table} ${jointext}`);
    return this;
};
QB.prototype.leftJoin = function (table, jointext) {
    this._joins.push(`LEFT JOIN ${table} ${jointext}`);
    return this;
};
QB.prototype.rightJoin = function (table, jointext) {
    this._joins.push(`RIGHT JOIN ${table} ${jointext}`);
    return this;
};

QB.prototype._getSelect = function () {
    let S_Cols, S_Table, S_Where, S_Joins, S_Order, S_Limit, S_Group, S_Havin;

    if (this._is_loose) {
        S_Cols = this._select_all ? '*' : this._cols.join(',');
        S_Table = this._table;
        S_Joins = this._createJoins();
        S_Where = this._createWheres();
        S_Group = this._groupBy ? 'GROUP BY ' + this._groupBy.join(',') : null;
        S_Havin = this._groupBy && this._having ? 'HAVING ' + this._having.join() : null;
        S_Order = this._createOrderBy(this._order_col);
        S_Limit = this._createLimit();
    } else {
        S_Cols = this._select_all ? '*' : this._createSelectCols();
        S_Table = this.grammar.quote(this._table);
        S_Joins = this._createJoins();
        S_Where = this._createWheres();
        S_Group = this._groupBy ? 'GROUP BY ' + this._groupBy.map(this._addTableNameToCol, this).join(',') : null;
        S_Havin = this._groupBy && this._having ? 'HAVING ' + this._having.join('') : null;
        S_Order = this._createOrderBy(this._addTableNameToCol(this._order_col));
        S_Limit = this._createLimit();
    }

    const sql = ["SELECT", S_Cols, 'FROM', S_Table, S_Joins, S_Where, S_Group, S_Havin, S_Order, S_Limit].filter(x => x).join(' ');
    return [sql, this._sql_params];
};
QB.prototype._createSelectCols = function () {
    const cols = this._cols.map(this._addTableNameToCol, this);
    return cols.join(',');
};
QB.prototype._createWheres = function (data = null, is_sub = false) {
    if (!data) data = this._data.data;
    if (!data.data) return '';

    let allParts = [];

    data.data.map((spec, index) => {
        if (Array.isArray(spec)) {
            let [col, term, val, join] = spec;
            if (index > 0) allParts.push(` ${join} `);

            col = this._is_loose ? col : this._addTableNameToCol(col);

            if (term === 'IN' || term === 'NOT IN') {
                if (typeof val === 'string') {
                    this._sql_params.push(val);
                    allParts.push(`${col} ${term} (${this.getPlaceholder()})`);
                    return;
                }

                if (Array.isArray(val)) {
                    this._sql_params = [...this._sql_params, ...val];
                    let qstring = val.map(x => `${this.getPlaceholder()}`).join(',');
                    allParts.push(`${col} ${term} (${qstring})`);
                    return;
                }

                if (typeof val === 'object' && val !== null) {
                    // subquery
                    let [sql, params] = val._getSelect();
                    this._sql_params = [...this._sql_params, ...params];
                    allParts.push(`${col} ${term} (${sql})`);
                    return;
                }
            }

            if (term !== null) {
                if (val instanceof RAW) {
                    allParts.push(`${col} ${term} ${val.value}`);
                    return;
                }
                this._sql_params = [...this._sql_params, val];
                allParts.push(col + term + this.getPlaceholder());
                return;
            }

            if (val === 'IS NULL' || val === 'IS NOT NULL') {
                allParts.push(`${col} ${val}`);
                return;
            }
        }

        if (typeof spec === 'object' && spec !== null) {
            // subselect
            allParts.push(` ${spec.join_term} (${this._createWheres(spec, true)})`);
            return;
        }
    });

    return allParts.length ? is_sub ? allParts.join('') : 'WHERE ' + allParts.join('') : null;
};
QB.prototype._createOrderBy = function (col) {
    if (col === null) return null;
    return `ORDER BY ${col}` + (this._order_way ? ` ${this._order_way}` : '');
};
QB.prototype._createJoins = function () {
    return this._joins.length ? this._joins.join(' ') : null;
};
QB.prototype._createLimit = function () {
    if (!this._limit) return '';
    if (this._limit) this._sql_params.push(this._limit);
    if (this._start_at) this._sql_params.push(this._start_at);
    return this.CL(this._limit, this._start_at);
};

QB.prototype._addTableNameToCol = function (col) {
    if (col == null) return null;
    let [t, c] = `${col}.`.split('.');
    if (!c) {
        c = t;
        t = this._table;
    }
    return this.grammar.quote(t) + '.' + this.grammar.quote(c);
};

QB.prototype.select = function (...args) {
    if (args.length) {
        this.cols(...args);
    }
    const [sql, params] = this._getSelect();
    return this.grammar.select(sql, params);
};

QB.prototype.insert = function (def) {
    if (!(typeof def === 'object' && def !== null)) {
        throw new Error("INSERT requires an object");
    }

    const cols = this._is_loose ? Object.keys(def) : Object.keys(def).map(this.grammar.quote);
    if (!cols.length) {
        throw new Error("INSERT Definition should not be an ampty object");
    }

    const qs = Object.values(def).map(c => {
        let qm;
        if (c instanceof RAW) {
            qm = c.value;
        } else {
            qm = this.getPlaceholder();
            this._sql_params.push(c);
        }
        return `${qm}`;
    }).join(',');

    const sql = `INSERT INTO ${this._is_loose ? this._table : this.grammar.quote(this._table)} (${cols.join(',')}) VALUES (${qs})`;
    return this.grammar.insert(sql, this._sql_params);
};

QB.prototype.update = function (def) {
    if (!(typeof def === 'object' && def !== null)) {
        throw new Error("UPDATE requires an object");
    }

    let keys = Object.keys(def);
    if (!keys.length) {
        throw new Error("INSERT Definition should not be an ampty object");
    }

    const qFunction = this._is_loose ? x => x : this.grammar.quote;

    let table = qFunction(this._table);
    let cols_sql = keys.map(c => {
        let qm;
        let v = def[c];
        if (v instanceof RAW) {
            qm = v.value;
        } else {
            qm = this.getPlaceholder();
            this._sql_params.push(v);
        }
        return `${qFunction(c)}=${qm}`;
    }).join(',');

    const sql = [`UPDATE ${table} SET ${cols_sql}`, this._createWheres()].filter(x => x).join(' ');

    return this.grammar.update(sql, this._sql_params);
};

QB.prototype.delete = function () {
    let table = this._is_loose ? this._table : this.grammar.quote(this._table);

    const sql = [`DELETE FROM ${table}`, this._createWheres()].filter(x => x).join(' ');

    return this.grammar.delete(sql, this._sql_params);
};

exports.default = QB;