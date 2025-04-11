const express = require('express');
require('dotenv').config();
const crypto = require('crypto');

const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;
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


app.post("/callback", (req, res) => {
    // get header values 
    console.log(req.headers);
    const apiKey = req.headers['x-auth-key'];
    if (apiKey !== process.env.API_KEY) {
        console.log("Received invalid API_KEY");
    }

    const signature = req.headers['x-auth-token'];
    const ts = req.headers['x-auth-ts'];

    const body = req.body;

    console.log("apikey: ", apiKey);
    console.log("signature: ", signature);
    console.log("ts: ", ts);
    console.log("body: ", body);

    const validRequest = verifySignature(ts, body, signature);
    if (!validRequest) {
        console.log("Request signature is invalid");
    } else {
        console.log("Valid requests: ");
        console.log(body);
    }

    res.status(200).send({
        status: true
    })
})

app.listen(port, () => {
    console.log("merchant server is running")
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