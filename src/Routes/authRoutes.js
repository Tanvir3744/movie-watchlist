import express from "express";
import { registerUser } from "../controller/authController.js";

// express router instance
const router = express.Router();

router.post('/register', registerUser);

export default router;