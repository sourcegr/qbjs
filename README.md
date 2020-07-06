A dead simple query builder for javascript
=


SELECT ALL
```javascript
DB.Table('posts').select();

// SELECT * FROM posts
```

SELECT Some
```javascript
DB.Table('posts').select('id, name');
// SELECT * FROM posts

// the above can also be written with any of these methods: 
DB.Table('posts').select(['id', 'name']);
DB.Table('posts').fields('id, name').select();
DB.Table('posts').fields(['id', 'name']).select(); 

```

UPDATE
```javascript
DB.Table('posts').where('id', '=', 1).update({
    title: 'The first post',
    is_published: true
});

// UPDATE posts SET title='The first post', is_published='t'  WHERE id=1
```


DELETE
```javascript
DB.Table('posts').where('id', '=', 1).delete();

// DELETE FROM posts WHERE id=1 
```

INSERT
```javascript
DB.Table('posts').insert({
    title: 'New post',
    body: 'Lorem... amet',
    is_published: true
});

// INSERT INTO posts (title, body, is_published) VALUES ('New post', 'Lorem... amet', true) 
```


API
--


### DB.table(tablename)
Creates a Query builder associated with the `tablename` table. After that, you can chain the quey builder with any of these methods, to construct your query.


### query contruction methods
use these methods to contruct your queries.

|   |      |   |
|---|------|---|
| .where | whereSpec | creates a where clause |  
| .orWhere | whereSpec | creates a orWhere clause |  
| .whereIn | whereInSpec | creates a whereIn clause |  
| .orWhereIn | whereInSpec | creates a orWhereIn clause |  
| .whereNotIn | whereInSpec | creates a whereNotIn clause |  
| .orWhereNotIn | whereInSpec | creates a orWhereNotIn clause |  
| .whereLike | whereLikeSpec | creates a whereLike clause |  
| .orWhereLike | whereLikeSpec | creates a orWhereLike clause |  
| .whereNotLike | whereLikeSpec | creates a whereNotLike clause |  
| .orWhereNotLike | whereLikeSpec | creates a orWhereNotLike clause |  
| .whereNull | collumn | creates a whereNull clause |  
| .orWhereNull | collumn | creates a orWhereNull clause |  
| .whereNotNull | collumn | creates a whereNotNull clause |  
| .orWhereNotNull | collumn | creates a orWhereNotNull clause |  

When you are done contructing, you should end the chain with a call to any of the final methods. These are the standard SQL methods

`select`, `insert`, `update`, `delete`

Of course, using some of the above final methods does not allways make sense. For example, it dosn't make sense to issue multiple where methods and then end it with an `insert`. 

### select
`select` can take an optional argument, either an array or a comma separated string, to define the rows you want to be retrieved. For example

```javascript
.select();
// selects all the columns

.select('*');
// selects all the columns

.select('id');
// selects only the id column

.select('id, name');
// selects the id and name columns

.select(['id', 'name']);
// selects the id and name columns
```


### insert
Takes a required object, representing the columns and values. For example,
```javascript
DB.Table('users').insert({
    'name': 'John',
    'email': 'john@doe.here',
});

// INSERT INTO users (name, email) VALUES('John', 'john@doe.here');
```


### upate
Takes a required object, and updates the columns with the values.
```javascript
DB.Table('users').where('email', 'john@doe.here').update({
    'is_admin': false
});

// UPDATE users SET is_admin='f' WHERE email='john@doe.here';
```

 
The values can use the `DB.RAW` method to create a built-in command'
```javascript
DB.Table('users').where('email', 'john@doe.here').update({
    'last_login': DB.RAW('now')
});

// UPDATE users SET last_login=NOW() WHERE email='john@doe.here';
```


### delete
Delete, takes no arguments. It just deletes the matched rows.

```javascript
DB.table('users').where('last_login', '<', '2020-01-01').delete();
```

### Some examples
```javascript
DB.Table('posts').where(id).select();
// SELECT * FROM posts WHERE id IS NOT NULL

DB.Table('posts').where(id, 3).select('title');
// SELECT title FROM posts WHERE id=3

DB.Table('posts').fields(['id', 'title']).where(id, DB.RAW('MAX(id)')).select();
// SELECT id, title FROM posts WHERE id=MAX(id)

DB.Table('posts').where(group, '>', 1).select();
// SELECT * FROM posts WHERE group>3

DB.Table('posts').where(group, '=', 1).select('id');
// SELECT id FROM posts WHERE group=3
```


### Parentesized queries

In many cases, it is required to have quereies in parentheses to accomodate with ORs and ANDs. This is easily done by passing a callback function to the whereSpec, as demonstrated bellow

```javascript
DB.Table('users')
    .where('email', email)
    .where(function(sub) {
        sub.where('is_admin', true)
           .orWhere('is_super_admin', true);
            //notice, you should not specify select() here! 
    }).select('hashed_password');
```
`SELECT hashed_password FROM users WHERE email=? AND (is_admin=true OR is_super_admin=true)`


**subselects**

Using subselects in your queries is pretty straight forward. Lets view an example.
In this example, we get the column `id` from the users, in order to use it to delete the 10 oldest (by id) entries in this table. This is a pretty common use case, because the SQL standard does not allow ORDERBY and LIMIT to be used along with the DELETE statement.  

```javascript
DB.Table('users')
    .whereIn(
        id,  DB.table('users').cols('id').orderBy('id', 'DESC').limit(10)
    )
    .delete();
```
`DELETE FROM users WHERE id IN (SELECT id FROM users ORDER BY id DESC OFFSET 10)`



**whereInSpec**
|   |      |   |   |   |
|---|------|---|---|---|
| column               | `whereIn(id)` <br>`id IS NOT NULL`     | string | 
| column, string       | `where(id, 3)` <br>`id=3`            | string, selectorValue |
| column, eq, value    | `where(id, '>', 3)`<br>`id>3`        | string, string, selectorValue |
| parentntesized query | `orWhere(function(q) {`<br>`q.where('id', 4).orWhere('is_admin', true);`<br><br>`OR (id=4 OR is_admin=true)`| function | 



| subquery             | `where(DB.Table('posts').cols('id').where({user_id:1}))`<br>AND (
 |