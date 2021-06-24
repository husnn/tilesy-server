import * as dynamoose from "dynamoose";
import shortid from "shortid";
import emailValidator from "email-validator";

const orderSchema = new dynamoose.Schema({
    "orderId": {
      "type": String,
      "required": true,
      "validate": (val) => shortid.isValid(val)
    },
    "mockupUrl": String,
    "song": {
      "type": Object,
      "schema": {
        "songName": String,
        "artistName": String,
        "spotifyUrl": String,
        "coverUrl": String,
        "duration": String,
        "timePlayed": String
      }
    },
    "emailAddress": {
      "type": String,
      "validate": (val) => emailValidator.validate(val)
    },
    "shipping": { "type": Object }
}, {
    "saveUnknown": true,
    "timestamps": true
});

const Order = dynamoose.model("orders", orderSchema);

export default Order;