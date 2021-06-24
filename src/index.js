import morgan from "morgan";
import * as dynamoose from "dynamoose";
import serverless from "serverless-http";

import App from "./App";
import logger from "./utils/logger";
import { aws as awsConfig }  from "../config";

const app = new App()

dynamoose.aws.sdk.config.update({
    region: awsConfig.region
});

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev", { stream: logger.stream }));
}

module.exports.app = app;
module.exports.handler = serverless(app);