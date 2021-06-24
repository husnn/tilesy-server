import express, { Router } from "express";
import bodyParser from "body-parser";
import cors from "cors";

import initRoutes from "./routes";
import errorHandler from "./middlewares/errorHandler";
import { handleStripeWebhook } from './controllers';

class App {
    constructor() {
        const app = express();

        app.use(cors());

        app.set("trust proxy", true);

        app.post("/stripe-webhook", bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        const router = new Router();
        initRoutes(router);

        app.use(router);

        app.use(errorHandler);

        return app;
    }
}

export default App;