require("dotenv").config();

const envType = process.env.NODE_ENV || "development";
const database = require("./db-config.json")[envType];

module.exports = {
    database: database,
};
