A dead simple query builder for javascript
=

SELECT WITH QUERY, LIMIT and ALL
```javascript
DB.Table('projects')
	.where(z => {
		z.where('name', '=', 'papas')
		z.where('is_admin', '=', true)
	})
	.orWhere('id', '=', '3')
	.limit(3)
	.startAt(10)
    .fields(['id', 'name'])
    .select();

// SELECT `id`,`name` FROM `projects` WHERE ((`name`=? AND `is_admin`=?) OR `id`=?)  LIMIT 10, 3
```
SELECT ALL
```javascript
DB.Table('projects').select();

// SELECT * FROM `projects`
```

UPDATE
```javascript
DB.Table('projects').where('id', '=', 1).update({
    name: 'John Doe',
    email: 'mymail@example.com'
});

// UPDATE `projects` SET `name`= ?, `email`= ?  WHERE `id`=?
```


DELETE
```javascript
DB.Table('projects').where('id', '=', 1).delete();

// DELETE FROM `projects`   WHERE `id`=?

```