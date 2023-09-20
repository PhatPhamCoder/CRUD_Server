var mysql = require("mysql2");
var migration = require("mysql-migrations");

var connection = mysql.createPool({
  connectionLimit: 10,
  host: "free02.123host.vn",
  user: "vsvdvumw_CRUD",
  password: "9J1jq1mX7lTSA3GTVQWW",
  database: "vsvdvumw_CRUD",
});

migration.init(connection, __dirname, function () {
  console.log("Migrations Succesfully!");
});

// node migration.js add migration create_table_name
// node migration.js add seed create_table_name
// node migration.js up --migrate-all

/** https://github.com/kawadhiya21/mysql-migrations */
