module.exports = {
    httpProtocol: process.env.HTTP_PROTOCOL || "http",
    host: process.env.HOST || "0.0.0.0",
    port: process.env.PORT || 3000,
    clientUrl: process.env.CLIENT_URL || "https://tilesy.co",
    ipdata: {
        baseUrl: "https://api.ipdata.co",
        apiKey: process.env.IPDATA_API_KEY
    },
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'eu-west-2',
        s3: {
            bucketName: process.env.S3_BUCKET_NAME || 'tilesy',
            acceleratedEndpoint: process.env.S3_BUCKET_ACCELERATED
                || "tilesy.s3-accelerate.amazonaws.com"
        }
    },
    stripe: {
        pk: process.env.STRIPE_PK,
        sk: process.env.STRIPE_SK,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        accessToken: process.env.SPOTIFY_ACCESS_TOKEN,
        redirectUrl: process.env.CLIENT_URL
    },
    sendinblue: {
        senderName: process.env.SENDINBLUE_SENDER_NAME || 'Tilesy',
        senderEmail: process.env.SENDINBLUE_SENDER_EMAIL || "hello@tilesy.co",
        baseUrl: "https://api.sendinblue.com/v3",
        apiKey: process.env.SENDINBLUE_API_KEY
    }
}