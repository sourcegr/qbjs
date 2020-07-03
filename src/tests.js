import DB from './index';
import ConsoleGrammar from './grammars/console';

DB.connect(ConsoleGrammar);

DB.Table('posts')
    .strict().select('id');


DB.Table('posts')
    .strict()
    .where('id', 1)
    // .orWhereIn('customer_id',
    //     DB.Table('customers')
    //         .cols('id')
    //         .where({user_id: 'sub_1'})
    //         .where({is_admin: 'sub_2'})
    // )
    // .whereIn('id', [11, 12, 13])
    // .whereNotIn('name', '"papas", "kostas", "manos"')
    // .orWhere(function (q) {
    //     q.where('name', '!=', 'papas').where('id', '=', 666)
    // })
    .orderBy('id', 'desc')
    .startAt(2)
    .limit(5)
    .groupBy('id, name')
    .having('id', 2)
    // .join('JOINTABLE', 'JOINTABLE.post_id=posts.id')

    .cols('new.id', 'pass').select()

process.exit();
// console.log(DB.Table('projects')
//               .where('id', 3)
//               .where('id', 4)
//               .select());


console.log(
    DB.Table('projects')
        .where('id', '=', 3)
        .where('name', 'lll')

        .whereIn('user_id', DB.Table('project_users')
            .cols('id', 'df', '434343')
            .where({user_id: 10})
            .where({is_admin: true})
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
