# Motor

# ejemplo de uso dentro de un programa

para poder usar cada motor lo único que se exige es agregar la dependencia en package.json 

```js

var config = readConfig('config.yaml');
console.log(config.db);
/* { motor: 'pg', database: 'my_db', user:'user',... */

var motor = require('sql-promise').getMotor(config.db.motor);
// motor instanceof DbMotor
// motor instanceof PgMotor

motor.connect(config.db).then(function(conn){
    // conn instanceof DbConnection
    // conn intancesof PgConnection DUDA!
    return conn.prepare("SELECT 'a', $1 FROM data");
}).then(function(preparedQuery){
    return preparedQuery.query([7]); // también se puede llamar Statement (como en sqlite)
}).then(function(query){
    return query.fecthOneRowIfExists();
})then(function(result){
    if(!result.rowCount){ 
        console.log('sin fila');
    }else{
        console.log('dato de la fila',result.rows[0]);
    }
});

```

## Posible implementación
 1. para el uso usar `conn.query(x)`
 2. para la implementación `conn.query(x)` llama a `motor.query(conn,x)`
 
## internamente:
 1. `motor.connect` -> DbConnection
 2. `motor.prepare(conn, sql)` -> DbPreparedQuery
 3. `motor.query(preparedQuery,data)` -> DbQuery
 4. `motor.fetchRowByRow(query, callbackRowByRow)` -> DbResult (a veces row by row)
   a. limits es el que dice si es una sola línea o varias o qué
