import aws from "aws-sdk";
import { aws as awsConfig } from "../../config";

export default new aws.S3({
  signatureVersion: 'v4',
  useAccelerateEndpoint: true,
  endpoint: new aws.Endpoint(awsConfig.s3.acceleratedEndpoint)
});
