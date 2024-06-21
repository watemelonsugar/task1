const Pool = require('pg').Pool

const pool = new Pool({
    user:"postgres",
    host:"localhost",
    port:5432,
    password:"root",
    database:"task1"
})

module.exports = pool;