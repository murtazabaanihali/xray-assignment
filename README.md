# X-Ray SDK – Local Setup & Usage

This repo contains a **minimal X-Ray system** for debugging multi-step pipelines by capturing step-wise inputs, outputs, and errors.

---

## Prerequisites

- **Node.js 18+** or **Bun**
- **Git**

> Recommended: **Bun** (faster + SQLite support out of the box)

---

## Project Structure

```
├─ sdk/            # X-Ray SDK
├─ api/         # Express API + SQLite DB
└─ README.md
````

## 1. Start the Server

### Install dependencies
```bash
cd api
bun install
# or: npm install
````

### Run the server

```bash
bun run index.ts
# or: node index.js / ts-node
```

Server will start on:

```
http://localhost:3000
```

Available endpoints:

* `POST /save-steps`
* `GET  /get-steps?key=<run-key>`

The SQLite database (`steps.db`) is created automatically.

---

## 2. Use the SDK

### Install SDK dependencies

```bash
cd sdk
bun install
# or: npm install
```

### Example usage

```ts
import XraySDK from "./src";

const xray = new XraySDK("http://localhost:3000");

const result = await xray.step({
  name: "Generate keywords",
  description: "Generate search keywords from product title",
  step: {
    props: {
      title: "iPhone 15 Pro Silicone Case",
      category: "Mobile Accessories",
    },
    function: async (props) => {
      return {
        keywords: ["iphone case", "silicone phone cover"],
        reasoning: "Derived from title and category",
      };
    },
  },
});

console.log(result);
```

## 3. Fetch Logged Steps

```ts
const steps = await xray.getSteps();
console.log(steps);
```

Or directly via API:

```bash
curl "http://localhost:3000/get-steps?key=<run-key>"
```

---

## Error Handling

* If a step function throws an error:

  * The error is logged to X-Ray
  * The error is **re-thrown**
  * Pipeline behavior remains unchanged

* If the backend is unavailable:

  * Logging retries automatically
  * Pipeline execution continues

---

## Notes & Constraints

* Step `props` **must be JSON-serializable**
* Functions are logged by **name only**
* Logging is **fire-and-forget** (non-blocking)
* Designed for debugging, not tracing or metrics

---

## Stack Used

* **Language:** TypeScript
* **Runtime:** Node.js / Bun
* **API:** Express.js
* **Database:** SQLite (`bun:sqlite`)
* **Transport:** HTTP + JSON
* **IDs:** UUID v7

---

## Summary

X-Ray adds decision-level observability to complex pipelines with:

* minimal instrumentation
* zero behavior change
* clear, step-by-step debugging

That’s it — simple to run, easy to extend.