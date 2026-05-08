import "dotenv/config";

export const ENV = {
    PORT:process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    clientURL: process.env.clientURL,
    JWT_SECRET: process.env.JWT_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    ARCJET_KEY: process.env.ARCJET_KEY,
    ARCJECT_ENV: process.env.ARCJET_ENV,
};


