const {DB, init_db} = require('./src/DB');

// console.log(DB.Table('projects')
//               .where('id', 3)
//               .where('id', 4)
//               .select());
//
// console.log(DB.Table('projects')
//               .where('id', 3)
//               .orWhere('id', 4)
//               .select());
//
//
// console.log(DB.Table('projects')
//               .where('id', 5)
//               .orWhere(function(q) {
//               	q.where('name', '=', 'papas').where('id', '=', 4)
//               })
//               .join('users', 'ON users.id = projects.user_id', 'LEFT')
//               .select());

module.exports = {DB, init_db};