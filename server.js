import express from 'express';
import dotenv from 'dotenv';
import generateHandler from './api/generate.js';

dotenv.config();

const app = express();
app.use(express.json());

// Lokalny proxy dla Vercel Serverless Functions
app.post('/api/generate', async (req, res) => {
  await generateHandler(req, res);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend nasłuchuje na http://localhost:${PORT}`);
});
