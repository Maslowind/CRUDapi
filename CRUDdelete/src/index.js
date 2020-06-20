const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
let pg = require('pg');

AWS.config.update({ region: process.env.REGION });

const poolConfig = {
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DB
};

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSID,
    secretAccessKey: process.env.ACCESSSECRET
});

function getUsername(id_token) {
    return jwt.decode(id_token, { complete: true }).payload.name;
}

exports.handler = async (event) => {
    let pool = new pg.Pool(poolConfig);
    let username = getUsername(event.headers.Authorization);
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: event.body.filename
    };
    console.log(event.body);
    return new Promise((resolve, reject) => {
        s3.deleteObject(params, function (err, data) {
            if (err) {
                console.error("s3", err);
            } else {
                console.log(`File deleted from S3 successfully.`);
            }
        })
        pool.query(`DELETE from public.usercruddb WHERE filename='${event.body.filename}' AND username='${username}'`)
            .then((res) => {
                console.log(res.rowCount);
                pool.end();
                if (res.rowCount !== 0) resolve(`File deleted from DB successfully.`);
                else resolve(`There is no file with this name.`)
            })
            .catch((err) => {
                console.error("pool", err);
                pool.end();
                reject(err.message);
            });
    })
};
