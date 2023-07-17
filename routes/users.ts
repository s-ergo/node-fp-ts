import express from "express";
import { fetchData, handleResult } from "../src/utils";

const router = express.Router();

router.get("/", (req, res) => {
    fetchData()()
        .then((result) => handleResult(res)(result))
        .catch((error) => res.status(500).send(`An error occurred: ${error}`));
});

module.exports = router;
