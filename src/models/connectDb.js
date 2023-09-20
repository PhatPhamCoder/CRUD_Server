var mysql = require("mysql2");
var dbconfig = require("../config/db.config");

var connection = mysql.createPool({
  host: dbconfig.HOST,
  user: dbconfig.USER,
  password: dbconfig.PASSWORD,
  database: dbconfig.DATABASE,
  port: dbconfig.PORT || 3306,
});

connection.getConnection(function (err, connection) {
  if (err) {
    throw err;
  }
  console.log("🚦 Database is Connected");
});

module.exports = connection;
