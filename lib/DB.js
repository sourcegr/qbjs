'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _QBuilder = require('./QBuilder');

var _QBuilder2 = _interopRequireDefault(_QBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let pool = null;
let grammar = null;

function DSQB($pool = null, $grammar = null) {
    pool = pool || $pool;
    grammar = grammar || $grammar;
    return {
        Table(table) {
            return new _QBuilder2.default(pool, grammar, table);
        }
    };
}

exports.default = DSQB;