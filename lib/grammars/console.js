'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
const _select = async function (sql, params) {
    console.log(sql);
    console.log(params);
};

const _insert = async function (sql, params) {
    console.log(sql);
    console.log(params);
};

const _update = async function (sql, params) {
    console.log(sql);
    console.log(params);
};

const _delete = async function (sql, params) {
    console.log(sql);
    console.log(params);
};

const quote = str => `"${str}"`;
const limit = (startat, count) => `LIMIT ? ${startat > 0 ? 'OFFSET ?' : ``}`;

exports.default = {
    select: _select,
    insert: _insert,
    update: _update,
    delete: _delete,
    grammar: {
        quote, limit
    }
};