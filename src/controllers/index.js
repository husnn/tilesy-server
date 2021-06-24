import axios from "axios";
import path from "path";
import getSymbolFromCurrency from "currency-symbol-map";
import Stripe from "stripe";
import shortid from "shortid";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

import spotify from "../utils/spotify";
import prices from "../../prices.json";
import s3 from "../utils/s3";
import Order from "../models/Order";

import { clientUrl, ipdata, stripe as stripeConfig, sendinblue, aws as awsConfig } from "../../config";
import { RequestValidationError, ResourceNotFoundError } from "../middlewares/Errors";

const DEFAULT_CURRENCY_CODE = "USD";

const stripe = new Stripe(stripeConfig.sk);

export async function getPrice(req, res, next) {
    const ip = req.ip;

    var price = {
        currency: {
            success: true,
            code: DEFAULT_CURRENCY_CODE,
            symbol: getSymbolFromCurrency(DEFAULT_CURRENCY_CODE)
        },
        originalAmount: Math.round(prices[DEFAULT_CURRENCY_CODE] * 1.35) - .01,
        amount: prices[DEFAULT_CURRENCY_CODE]
    };

    try {
        const response = await axios.get(`${ipdata.baseUrl}/${ip}?api-key=${ipdata.apiKey}`)
        const currencyCode = response.data.currency.code;
        const amount = prices[currencyCode];

        if (!amount) return;

        price = {
            success: true,
            currency: {
                code: currencyCode,
                symbol: getSymbolFromCurrency(currencyCode)
            },
            originalAmount: Math.round(prices[currencyCode] * 1.35) - .01,
            amount
        }

        res.status(200).send(price);
    } catch(err) {
        res.status(200).send(price);
        next(err);
    }
}

export async function getTrackInfo(req, res, next) {
    const { trackId } = req.query;

    try {
        if (!trackId) throw new RequestValidationError("Missing track id.");
        const track = await spotify.getTrack(trackId);

        const { body } = track;

        res.json({
            name: body.name,
            artists: body.artists,
            images: body.album.images,
            duration: body.duration_ms
        });
    } catch (err) {
        next(err);
    }
}

export async function uploadCover(req, res, next) {
    fs.readFile(req.file.path, (err, data) => {
        if (err) throw err;
        const params = {
            Bucket: awsConfig.s3.bucketName,
            Key: `uploads/covers/${req.file.filename}`,
            Body: data,
            ACL: "public-read"            
        };

        s3.upload(params, function(err) {
            if (err) {
                console.log(err);
                next(err);
                return;
            }

            res.json({
                success: true,
                url: `https://${awsConfig.s3.acceleratedEndpoint}/uploads/covers/${req.file.filename}`
            });
     
            fs.unlink(req.file.path, (err) => {
                if (err) next(err);
            });
        });
     }).catch(err => {
         console.log(err);
     });
}

export async function uploadCoverFromMemory(req, res, next) {
    try {
        if(!req.file || !req.file.buffer) {
            throw new Error("File or buffer not found");
        }

        var ext = path.extname(req.file.originalname);
        const fileName = `${req.file.fieldname}-${Date.now()}${ext}`;

        const params = {
            Bucket: awsConfig.s3.bucketName,
            Key: `uploads/covers/${fileName}`,
            Body: req.file.buffer,
            ACL: "public-read"
        };

        s3.upload(params, function(err) {
            if (err) {
                next(err);
                return;
            }

            res.json({
                success: true,
                url: `https://${awsConfig.s3.acceleratedEndpoint}/uploads/covers/${fileName}`
            });
        });
    } catch (err) {
        console.log(err);
    }
}

export async function signS3CoverURL(req, res, next) {
    const { fileName, fileType } = req.body;

    const ext = path.extname(fileName);
    const filePath = `uploads/covers/${uuidv4()}${ext}`;

    const params = {
      Bucket: awsConfig.s3.bucketName,
      Key: filePath,
      Expires: 60,
      ContentType: fileType,
      ACL: "public-read"
    };
  
    s3.getSignedUrl('putObject', params, (err, data) => {
      if (err) return next(err);

      res.json({
        success: true,
        signedUrl: data,
        url: `https://${awsConfig.s3.acceleratedEndpoint}/${filePath}`
      });
    });
}

export async function buy(req, res, next) {
    var { currencyCode, mockup, colour, song } = req.body;

    if (!currencyCode || !prices[currencyCode]) currencyCode = DEFAULT_CURRENCY_CODE;

    const filePath = `uploads/mockups/${uuidv4()}.svg`;

    const params = {
        Bucket: awsConfig.s3.bucketName,
        Key: filePath,
        Body: mockup,
        ContentType: "image/svg+xml",
        ACL: "public-read"
    };

    s3.upload(params, function (err) {
        if (err) {
          console.log("Error", err);
        }
    });

    try {
        if (!song) throw new RequestValidationError("Missing song information.");

        const orderId = shortid.generate();

        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: [
                    'US', 'GB', 'CA', 'AU', 'NZ', 'AT', 'BE', 'HR', 'BG', 'CY',
                    'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
                    'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI',
                    'ES', 'SE'
                ]
            },
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currencyCode,
                        product_data: { name: 'Music Player Plaque', images: [song.coverUrl] },
                        unit_amount: Math.round(prices[currencyCode] * 100)
                    },
                    quantity: 1
                },
                {
                    price_data: {
                        currency: currencyCode,
                        product_data: { name: 'Premier Shipping (5-7 Days)' },
                        unit_amount: Math.round(4.99 * 100)
                    },
                    quantity: 1
                }
            ],
            metadata: { orderId },
            mode: 'payment',
            success_url: `${clientUrl}/order-placed?id=${orderId}`,
            cancel_url: `${clientUrl}`,
        });

        await new Order({
            orderId,
            mockupUrl: `https://${awsConfig.s3.acceleratedEndpoint}/${filePath}`,
            colour,
            song
        }).save();

        res.status(200).json({
            success: true,
            stripeSession: session.id
        });
    } catch(err) {
        next(err);
    }
}

export async function fulfillOrder(object) {
    try {
        const customer = await stripe.customers.retrieve(object.customer);

        const { line1, line2, city, postal_code, state, country } = object.shipping.address;
        const address = Object.values({ line1, line2, city, postal_code, state, country }).filter(line => line != null);

        const shipping = { name: object.shipping.name, address };

        const order = await Order.update({ "orderId": object.metadata.orderId }, { "emailAddress": customer.email, shipping });

        await sendConfirmationEmail({
            emailAddress: customer.email,
            song: order.song,
            shipping
        });
    } catch (err) {
        console.log(err);
        return;
    }
}

export async function getOrderDetails(req, res, next) {
    const { id } = req.query;

    if (!id) throw new RequestValidationError("Invalid order id.");

    try {
        const order = await Order.get({ "orderId": id });

        if (!order) throw new ResourceNotFoundError("Could not find order.");

        res.json({
            name: order.shipping.name,
            address: order.shipping.address
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export async function handleStripeWebhook(req, res) {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, stripeConfig.webhookSecret);
        if (event.type === 'checkout.session.completed') await fulfillOrder(event.data.object);
        res.status(200).send();
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
}

export async function sendConfirmationEmail(order) {
    try {
        await axios.post(`${sendinblue.baseUrl}/smtp/email`, {
            sender: { name: sendinblue.senderName, email: sendinblue.senderEmail },
            to: [{ email: order.emailAddress }],
            replyTo: { email: sendinblue.senderEmail },
            templateId: 1,
            params: {
                song: order.song,
                shipping: order.shipping
            }
          }, {
            headers: {
                "api-key": sendinblue.apiKey
            }
        });
    } catch (err) {
        console.log(err);
    }
}
