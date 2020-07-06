A dead simple query builder for javascript
=


SELECT ALL
```javascript
DB.Table('posts').select();

// SELECT * FROM posts
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

The api
----------------

| asdfasd | asdfasdf |
| -- | -- |
| DB.table() | Creates a Query builder assoviated with the tablename table |



### DB.table(tablename)
Creates a Query builder associated with the `tablename` table

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


**whereSpec**

|   |      |   |
|---|------|---|
| column               | `where(id)`| `AND id IS NOT NULL` |
| column, primitive    | `where(id, 3).where('name', 'John')` | `AND id=3 AND name='John'`|
| column, eq, value    | `where(group, '=', 1).orWhere('age', '>', 18)`| `AND group=1 OR age>18` |
| parentntesized query | `orWhere(function(q) {`<br>`q.where('group', 4)`<br>`.orWhere('is_admin', true);`<br>`})` | `OR (id=4 OR is_admin=true)` | 

**whereInSpec**
|   |      |   |   |   |
|---|------|---|---|---|
| column               | `whereIn(id)` <br>`id IS NOT NULL`     | string | 
| column, string       | `where(id, 3)` <br>`id=3`            | string, selectorValue |
| column, eq, value    | `where(id, '>', 3)`<br>`id>3`        | string, string, selectorValue |
| parentntesized query | `orWhere(function(q) {`<br>`q.where('id', 4).orWhere('is_admin', true);`<br><br>`OR (id=4 OR is_admin=true)`| function | 



| subquery             | `where(DB.Table('posts').cols('id').where({user_id:1}))`<br>AND (
 |