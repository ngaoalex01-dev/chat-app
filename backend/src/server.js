import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes from './routes/auth.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';



const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);

//make ready for deployment
// if(ENV.NODE_ENV === "production"){
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get((req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
//   });
// };


const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  const frontendPath = path.resolve(__dirname, "../frontend/dist");

  app.use(express.static(frontendPath));

  app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}  `)
  connectDB();
});
