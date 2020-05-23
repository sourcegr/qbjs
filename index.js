const DB = require('./src/DB');
global.dd = console.log

dd(DB.Table('produ').where('id', '=', '1').select('id'));

dd(DB.Table('produ').where({
	id:1,
	name:'papas'
}).select('id'));
module.exports = DB;
