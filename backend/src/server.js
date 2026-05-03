import express from 'express';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import messagesRoutes from './routes/messages.routes.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}  `));
