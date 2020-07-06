import QB from './QBuilder';

function DSQB(pool = null, grammar = null) {
    return {
        Table(table) {
            return new QB(pool, grammar, table);
        }
    }
}

export default DSQB;