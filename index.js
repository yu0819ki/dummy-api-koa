var koa = require('koa');
var route = require('koa-route');
var thunkify = require('thunkify');
var mysql = require('mysql');
var app = koa();

var listenPort = process.env.PORT || 3000;
var mysqlConf = process.env.CLEARDB_DATABASE_URL || "mysql://root@localhost/db?reconnect=true"

var jsonDateReplacer = function(key, value){
  if (this[key] instanceof Date){
    var date = this[key];
    return parseInt( date / 1000 );
  }else{
    return value;    
  }
}
var getPagenation = function (params){
  var p = {
    page: 1,
    size: 20,
    before: null,
    after: null
  };
  if (params) {
    p.page = parseInt(params.page, 10) || 1;
    p.size = parseInt(params.size, 10) || 20;
    p.before = params.before || null;
    p.after = params.after || null;
  }

  p.sql = {
    limit: [(p.page - 1) * p.size, p.size],
    where: buildWhere({
      lt: {
        id: p.before
      }, 
      gt: {
        id: p.after
      }
    })
  }

  return p;
}

var buildWhere = function(whereParams) {
  var wherePhrase = 'where ';
  var whereValues = [];
  if (whereParams.lt) {
    for (var i in whereParams.lt) {
      if (whereParams.lt[i] === null) { continue; }
      wherePhrase += ' `' + i + '` < ? ';
      whereValues.push(whereParams.lt[i]);
    }
  }
  if (whereParams.gt) {
    for (var i in whereParams.lt) {
      if (whereParams.gt[i] === null) { continue; }
      wherePhrase += ' `' + i + '` > ? ';
      whereValues.push(whereParams.gt[i]);
    }
  }
  if (whereValues.length === 0) {
    return {
      phrase: '',
      values: []
    };
  }
  return {
    phrase: wherePhrase,
    values: whereValues
  }
}
var ctrlr = {
  index: function *(){
    var pagination = getPagenation(this.query);
    var pool = mysql.createPool(mysqlConf);

    var query = function(sql, values, cb) {
      if (typeof values === 'function') {
        cb = values;
        values = null;
      }
      pool.query(sql, values, function(err, rows) {
        cb(err, rows);
      });
    };
    
    query = thunkify(query);
    pagination = getPagenation(this.query);
    
    var articles = [];
    try {
      articles = yield query('SELECT * FROM dummy_article ' + pagination.sql.where.phrase + ' LIMIT ?, ?;', pagination.sql.where.values.concat(pagination.sql.limit));
    } catch (err) {
      console.log(err.message);
    }

    this.type = 'application/json';
    this.body = JSON.stringify({status_code: 200, status: 'OK', data: articles}, jsonDateReplacer);
    
  }
}

app.use(route.get('/', ctrlr.index));

app.listen(listenPort);
