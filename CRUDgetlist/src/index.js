const AWS = require('aws-sdk');
let pg = require('pg');
const jwt = require('jsonwebtoken');

AWS.config.update({ region: process.env.REGION });

const poolConfig = {
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DB
};
function getUsername(id_token) {
    return jwt.decode(id_token, { complete: true }).payload.name;
}


exports.handler = async (event) => {
    let username = getUsername(event.headers.Authorization);
    let pool = new pg.Pool(poolConfig);
    let result = [];
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM public.usercruddb WHERE username = '${username}'`)
            .then((res) => {
                console.log(res.rows);
                pool.end();
                res.rows.forEach(function (entry) {
                    result.push({ filename: entry.filename, url: entry.url })
                })
                if (result == []) result = "Your list is empty"
                resolve(result);
            })
            .catch((err) => {
                console.error(err);
                pool.end();
                reject(err.message);
            });
    })
};
