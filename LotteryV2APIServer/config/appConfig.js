require("dotenv").config();
console.log(`env.node_env:${process.env.NODE_ENV}`);

const envType = process.env.NODE_ENV || "development";
const database = require("./db-config.json")[envType];

module.exports = {
    database: database,
};
