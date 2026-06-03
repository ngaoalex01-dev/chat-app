import jwt from "jsonwebtoken";
import { ENV } from './env.js';

export const generateToken =(userId, res) => {
  
  const JWT_SECRET = ENV.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({userId}, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true, //prevent xss attacks: cross-site scripting attacks
    secure: ENV.NODE_ENV === "development" ? false : true,
    sameSite: "strict", //prevent CSRF attacks: cross-site request forgery attacks
  });

  return token;
};
