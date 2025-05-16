import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { readFile } from 'fs/promises'
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';

//To load environment variables
dotenv.config();

//To connect to MongoDB Database
connectDB();

const app = express();

//Middleware 
app.use(cors());
app.use(express.json());

//Load Swagger JSON file 
const swaggerFile = JSON.parse(
    await readFile(new URL('./swagger.json', import.meta.url))
);

// Swagger Documentation
app.use('./api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

//Routes 

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

//Home Route
app.use('/', (req, res) => {
    res.json({ message: 'Welcome to My Notes API' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Server Error', error: err.message });
});

//Start Server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});


