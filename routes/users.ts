import express from "express";
import { getData } from "../src/services/apiService";
import { handleResult } from "../src/utils";

const router = express.Router();

router.get("/", (req, res) => {
    getData()()
        .then((result) => handleResult(res)(result))
        .catch((error) => res.status(500).send(`An error occurred: ${error}`));
});

module.exports = router;
