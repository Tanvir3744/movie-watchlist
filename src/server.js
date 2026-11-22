import express from "express";
import dotenv from "dotenv";
import movieRoutes from './Routes/movieRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());

// using routes
app.use('/api', movieRoutes);

// app.get('/', async(req, res) => {
//     res.send('hello world');
// });

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});