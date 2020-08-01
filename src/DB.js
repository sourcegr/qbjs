const QB = require('./QBuilder');

let pool = null;
let grammar = null;

function DSQB($pool = null, $grammar = null) {
    pool = pool || $pool;
    grammar = grammar || $grammar;
    return {
        Table(table) {
            return new QB(pool, grammar, table);
        },
        RAW: QB.RAW
    }
}


module.exports = DSQB;
