import express from "express";

import { initDB } from "./db";
import { fetchSteps, saveStep } from "./utils";

const app = express();
app.use(express.json());

app.post("/save-steps", (req, res) => {
    const { key, stepInput, stepResponse, stepFailed } = req.body || {};

    if (!key || !stepInput || !stepResponse) {
        res.status(400).send({ error: "Some inputs are missing" });
        return;
    }

    console.log("Received step: ", JSON.stringify({
        key,
        stepInput,
        stepResponse,
        stepFailed,
    }, null, 2));

    saveStep(
        key,
        JSON.stringify({
            input: stepInput,
            response: stepResponse,
            failed: stepFailed,
        })
    );

    res.status(200).send({ success: "Step saved!" });
});

app.get("/get-steps", (req, res) => {
    try {
        const key = req.query?.key;
        console.log("Fetching steps with key ", key);

        if (!key) {
            res.status(400).send({ error: "Key cannot be empty." });
            return;
        }

        const response = fetchSteps(key as string);
        if (!response) {
            res.status(400).send({ error: "No steps found" });

        } else {
            res.status(200).send(response);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

app.listen(3000, () => {
    initDB();
    console.log("I am listening on port 3000...");
    console.log(`Available endpoints: 
        /save-steps: For sending steps event
        /get-steps: For getting steps
    `)
});
