# X-Ray SDK & Server – Overview

## What this does

This is a **minimal X-Ray system** that makes multi-step pipelines debuggable by recording:
- what went into each step
- what came out
- whether the step failed

The pipeline logic runs normally.  
X-Ray only **observes**, it never interferes.

---

## X-Ray SDK (Client)

### Purpose
The SDK wraps real functions and logs their execution details to the backend.

### Key behavior
- Executes the real step function
- Captures inputs (`props`) and outputs
- Captures errors and re-throws them
- Sends logs asynchronously with retries
- Pipeline continues even if logging fails

### Core API

```ts
xray.step({
  name,
  description,
  metadata,
  step: {
    props,
    function
  }
})
```

### Important design choices

* `props` are forced to be JSON-serializable
* Only the function **name** is logged (not the function itself)
* Errors are logged with message + stack
* Logging is fire-and-forget (non-blocking)

### Stack

* TypeScript
* Node.js / Bun
* Fetch API
* UUID v7 for run grouping

---

## Backend API (Server)

### Purpose

Stores and retrieves step execution data for a given run.

### Endpoints

#### `POST /save-steps`

Stores a single step execution.

Payload:

```json
{
  "key": "run-id...",
  "stepInput": { ... },
  "stepResponse": { ... },
  "stepFailed": false
}
```
---

#### `GET /get-steps?key=run-id...`

Returns all steps for a run in execution order.

## Storage

### Database

* SQLite (via `bun:sqlite`)
* One row per step

### Schema

```sql
steps (
  id,
  key,
  data,
  created_at
)
```

Each row stores:

```json
{
  "input": stepInput,
  "response": stepResponse,
  "failed": boolean
}
```

Steps are grouped by `key` to reconstruct a full run.

---

## Returned Data Shape

```json
{
  "key": "run-id...",
  "steps": [
    {
      "name": "...",
      "description": "...",
      "metadata": {},
      "step": {
        "props": {},
        "function": "functionName",
        "response": {},
        "exceptions": false
      }
    }
  ]
}
```

---

## Debugging Example

If a bad result occurs (e.g. **phone case → laptop stand**), a developer can:

* inspect keyword generation inputs
* see how many candidates were filtered
* inspect the final selection response and confidence
* identify exactly which step caused the issue

---

## Why this design

* Minimal instrumentation for developers
* Works with any pipeline (LLMs, filters, ranking, etc.)
* No coupling to domain-specific logic
* Clear separation between execution and observability

---

## Stack Summary

* **Language:** TypeScript
* **Runtime:** Node.js / Bun
* **SDK:** Custom wrapper
* **API:** Express.js
* **Database:** SQLite
* **Transport:** HTTP + JSON

**In short:**
This implementation provides decision-level visibility into complex pipelines with minimal overhead and no behavior changes.

---

```
Time Taken: 2 hours
```