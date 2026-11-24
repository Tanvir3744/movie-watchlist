import dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from "@prisma/adapter-pg";


// configure dotenv to load environment variables;
dotenv.config();


// setup prisma adapter;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});


const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected successfully via prisma');
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1); // Exit the process with an error code
    }
}

const disconnectDB = async () => {
    await prisma.$disconnect();
}

export { prisma, connectDB, disconnectDB };