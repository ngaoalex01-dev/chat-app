import "dotenv/config";

export const ENV = {
    PORT:process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    clientURL: process.env.clientURL,
    JWT_SECRET: process.env.JWT_SECRET,
};


