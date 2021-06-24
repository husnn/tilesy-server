import uploadImage from "../middlewares/uploadImage";
import uploadImageToMemory from "../middlewares/uploadImageToMemory";

import { getPrice, getTrackInfo, signS3CoverURL, uploadCover, uploadCoverFromMemory, buy, getOrderDetails, handleStripeWebhook } from '../controllers';

function initRoutes(router) {
    router.get("/get-price", getPrice);
    router.get("/get-track", getTrackInfo);
    router.post("/sign-cover-url", signS3CoverURL);
    router.post("/upload-cover", uploadImage, uploadCover);
    router.post("/upload-cover-memory", uploadImageToMemory, uploadCoverFromMemory);
    router.post("/buy", buy);
    router.get("/get-order", getOrderDetails);
    router.post("/stripe-webhook", handleStripeWebhook);
}

export default initRoutes;