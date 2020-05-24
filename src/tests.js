DB.Table('produ').where('id', '=', '1').select('id').then(res => {});
DB.Table('produ').where({id:1, name:'papas'}).select('id').then(res => {});