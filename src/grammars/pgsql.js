const Grammar = function (connection) {
    this.connection = connection;
}
Grammar.prototype.q = function(){
    return `$${this.q++}`;
}
Grammar.prototype.quote = function (str) {
    return `"${str}"`;
}
Grammar.prototype.createLimit = function (item) {
    return `LIMIT ${item.CQ()} ${item._start_at > 0 ? `OFFSET ${item.CQ()}` : ``}`;
}

Grammar.prototype.setConnection = function (connection) {
    this.connection = connection;
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

export default Grammar;