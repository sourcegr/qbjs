const _select = async function(sql, params) {
    return [sql, params, 'select'];
};

const _insert = async function(sql, params) {
    return [sql + " RETURNING ALL", params, 'insert'];
};

const _update = async function(sql, params) {
    return [sql, params, 'update'];
};

const _delete = async function(sql, params) {
    return [sql, params, 'delete'];
};

const quote = str => `"${str}"`;
const limit = (startat, count) => `LIMIT ? ${startat > 0 ? 'OFFSET ?' : ``}`;

export default {
    select: _select,
    insert: _insert,
    update: _update,
    delete: _delete,
    grammar: {
        quote, limit
    }
};