const { default: axios } = require('axios');
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const sampleProducts = require('./sample.products');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors({
    credentials: true,
    origin: true,
}))

app.use(express.urlencoded({limit: '200mb', extended: true}));
app.use(express.json({
    limit: '200mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}))

app.get('/hc', (req, res) => {
    res.status(200).send({
        status: true,
        msg: 'Server is running'
    })
})

app.get('/products', (req, res) => {
    res.status(200).send({
        status: true,
        products: sampleProducts
    })
})

app.get('/products/:id', (req, res) => {
    const productId = +req.params.id;
    const product = sampleProducts.find(sp => sp.id === productId);
    if (!product) {
        return res.status(404).send({
            status: false,
            msg: 'Product not found'
        });
    }
    res.status(200).send({
        status: true,
        product
    });
})

app.post('/buy/:productId', async (req, res) => {
    // get product id 
    const productId = +req.params['productId'];

    const { tokenName, network }= req.body;

    const product = sampleProducts.find(sp => sp.id == productId)
    if (!product) {
        return res.status(404).send({
            status: false,
            msg: "Product not found"
        })
    }

    // generate order id 
    const orderID = crypto.randomInt(1000);

    try {
        // send payment request 
        const { data } = await axios.post(`${process.env.KRYPTO_API}/api/deposit`, {
            token_name: tokenName,
            network: network,
            amount_in_usd: product.price,
            order_number: orderID + ""
        }, {
            headers: {
                'X-API-KEY': process.env.API_KEY
            }
        })

        if (data.status) {
            res.status(201).send({
                status: true,
                dep_req: data.dep_addr
            })
        } else {
            res.status(400).send({
                status: false,
                msg: data.msg
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: false,
            msg: "Internal server error"
        })
    }
})


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