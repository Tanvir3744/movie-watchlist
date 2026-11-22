import express from "express";

// configure the router ;
const router = express.Router();

router.get('/movies', async(req, res) => {
    res.json({message: "welcome to movie api"});
});

export default router;