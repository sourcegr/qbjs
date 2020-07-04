const Grammar = function (connection) {
    this.connection = connection;
}
Grammar.prototype.quote = function (str) {
    return `"${str}"`;
}
Grammar.prototype.limit = function (startat) {
    return `LIMIT ? ${startat > 0 ? 'OFFSET ?' : ``}`;
}

Grammar.prototype.setConnection = function (connection) {
    this.connection = connection;
}

Grammar.prototype.select = function (sql, params) {
    return new Promise((resolve, reject) => {
        this.connection.query(sql, params, (err, res) => {
            return err ? reject(err) : resolve(res.rows);
        });
    });
};

Grammar.prototype.insert = function (sql, params) {
    console.log(sql+ " RETURNING *" , params, 'insert');
    return new Promise((resolve, reject) => {
        this.connection.query(sql+ " RETURNING *", params, (err, res) => {
            return err ? reject(err) : resolve(res.rows);
        });
    });
};

Grammar.prototype.update = function (sql, params) {
    return [sql, params, 'update'];
};

Grammar.prototype.delete = function (sql, params) {
    return [sql, params, 'delete'];
};

export default Grammar;