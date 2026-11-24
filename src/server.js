import express from "express";
import dotenv from "dotenv";
import movieRoutes from './Routes/movieRoutes.js';
import authRoutes from "./Routes/authRoutes.js";
import { disconnectDB } from "./config/db.js";

dotenv.config();

const app = express();


//body parser middleware;
app.use(express.json());
app.use(express.urlencoded({extended: true}))


// api routes
app.use('/api', movieRoutes);
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// handle unhandled promise rejections error (e.g database connection errors);
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    server.close(async () => {
        await disconnectDB();
        process.exit(1); // exit the process with an error code;
    });
});

// handle uncaught exceptions error (e.g syntax errors);
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await disconnectDB(); // disconnect from the database before exiting;
    process.exit(1); // exit the process with an error code;
});

// grancefully shutdown the server on receiving termination signals (e.g SIGINT, SIGTERM);
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Shutting down gracefully...');
    server.close(async () => {
        await disconnectDB(); // disconnect from the database before exiting;
        process.exit(0); // exit the process with a success code;
    });
});