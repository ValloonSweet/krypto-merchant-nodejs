import express from 'express';
import * as http from 'http';
require('dotenv').config();
const crypto = require('crypto');

const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);

app.use(cors({
    credentials: true,
    origin: [
        "http://127.0.0.1:8000" // should be any url
    ]
}))

app.use(express.urlencoded({limit: '200mb', extended: true}));
app.use(express.json({
    limit: '200mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}))

app.post("callback", (req, res) => {
    // get header values 
    const apiKey = req.headers['X-Auth-Key'];
    if (apiKey !== process.env.API_KEY) {
        console.log("Received invalid API_KEY");
    }

    const signature = req.headers['X-Auth-Token'];
    const ts = req.headers['X-Auth-Ts'];

    const body = req.body;

    const validRequest = verifySignature(ts, body, signature);
    if (!validRequest) {
        console.log("Request signature is invalid");
    } else {
        console.log("Valid requests: ");
        console.log(body);
    }
})

server.listen(port, async () => {
    "merchant server is running"
})

function verifySignature (ts, body, receivedHmac) {
    const bodyString = JSON.stringify(body);
    const msg = `${ts}POST${bodyString}`;

    const hmac = crypto.createHmac('sha512', process.env.PRIV_KEY);
    hmac.update(msg);

    const generatedHmac = hmac.digest('hex');

    if (generatedHmac === receivedHmac) {
        return true;
    } else {
        return false;
    }
}