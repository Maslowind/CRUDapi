const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
let pg = require('pg');
const fs = require('fs');

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

function getId() {
    return Math.random().toString(9).substr(2, 15);
};

function getUsername(id_token) {
    return jwt.decode(id_token, { complete: true }).payload.name;
}

exports.handler = async (event, context, callback) => {
    console.log(event.base64Image)
    let base64 = event.base64Image;
    let buf = new Buffer(base64, 'base64')
    let pool = new pg.Pool(poolConfig);
    let username = getUsername(event.headers.Authorization);
    let id = getId();
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: id + ".png",
        Body: buf,
        ACL: 'public-read',
        ContentType: 'image/png',
    };
    return new Promise((resolve, reject) => {
        s3.upload(params, async function (err, data) {
            if (err) {
                console.error(err);
                reject(err.message);
            } else {
                console.log(`File uploaded successfully. ${data.Location}`);
                await pool.query(`INSERT INTO usercruddb (filename, username, url) VALUES ('${id + ".png"}', '${username}', '${data.Location}')`)
                    .then((res) => {
                        console.log(res);
                        pool.end();
                        resolve(`File uploaded successfully. ${data.Location}`);
                    })
                    .catch((err) => {
                        console.error(err);
                        pool.end();
                        reject(err.message);
                    });

            }
        })
    })
};
