const Grammar = function (connection) {
    this.connection = connection;
}
Grammar.prototype.placeholder = function(){
    return `?`;
}
Grammar.prototype.quote = function (str) {
    return `\`${str}\``;
}
Grammar.prototype.createLimit = function (start_at) {
    return `LIMIT ${start_at > 0 ? `${this.placeholder()}, ` : ``} ${this.placeholder()} `;
}
Grammar.prototype.select = function (sql, params) {
    return new Promise((resolve, reject) => {
        this.connection.query(sql, params, (err, res) => {
            return err ? reject(err) : resolve(res.rows);
        });
    });
};

Grammar.prototype.insert = function (sql, params) {
    return new Promise((resolve, reject) => {
        this.connection.query(sql, params, (err, res) => {
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

Grammar.setConnection = function (connection) {
    return new Grammar(connection);
}

export default Grammar;