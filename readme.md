dummy-api-koa
========================

Herokuで動く、ダミーなAPI。要ClearDBプラグイン。

ローカルで動かすときは、`var mysqlConf`の行を書き換えるか、package.jsonの`script.start`に*CLEARDB_DATABASE_URL*をセットして起動すればOK。

http://yu0819ki-dummy-api.herokuapp.com/ で稼働中。

## 使い方
30件ずつ、1ページ目  
`http://yu0819ki-dummy-api.herokuapp.com/?page=1&size=30`

15件ずつ、3ページ目  
`http://yu0819ki-dummy-api.herokuapp.com/?page=3&size=15`

デフォルトは、20件ずつ、1ページ目。

## License
MIT
