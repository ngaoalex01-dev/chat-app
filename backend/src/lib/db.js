import mongoose from "mongoose"
import { ENV } from './env.js';

export const connectDB = async ()=> {

  try {
      const conn = await mongoose.connect(ENV.MONGO_URI)
      console.log("MONGODB CONNECTED SUCCESFULLY:", conn.connection.host)

  } catch (error) {
      console.error("MONGODB CONNECTION ERROR:", error)
      process.exit(1);// 1 status code for failure 0 for sucess

  }
};
