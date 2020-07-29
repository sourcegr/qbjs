const Grammar = function (connection) {
    this.questions = 1;
    this.connection = connection;
}
Grammar.prototype.placeholder = function(){
    return `$${this.questions++}`;
}
Grammar.prototype.quote = function (str) {
    return `"${str}"`;
}
Grammar.prototype.createLimit = function (start_at) {
    return `LIMIT ${this.placeholder()} ${start_at > 0 ? `OFFSET ${this.placeholder()}` : ``}`;
}
Grammar.prototype.select = function (sql, params) {
    console.log(sql, params, 'SELECT');
    return new Promise((resolve, reject) => {
        this.connection.query(sql, params, (err, res) => {
            return err ? reject(err) : resolve(res.rows);
        });
    });
};

Grammar.prototype.insert = function (sql, params) {
    console.log(sql+ " RETURNING *" , params, 'INSERT');
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

module.exports = Grammar;