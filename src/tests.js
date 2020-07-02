import DB from './index';


DB.Table('adsf').fields('id', 'pass').select().then(x => {
	console.log(x);
})
// console.log(DB.Table('projects')
//               .where('id', 3)
//               .where('id', 4)
//               .select());



console.log(DB.Table('projects')
              .where('id', '=', 3)
              .whereIn('user_id', DB.Table('project_users')
	                .fields('id')
	                .where({user_id:10})
	                .where({is_admin:true})
              )
              .where('name', 'papas')
              .select());

//
// console.log(DB.Table('projects')
// 	.where('id', 3)
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
//
// console.log(DB.Table('projects').insert({
// 	name: 'papas'
// }));
