# P3 AI Automation – n8n Integration

This folder contains all the work done for **Project P3**, specifically the automation and workflow setup using **n8n**.

---

## Overview

The P3 automation project connects the frontend form submissions from the React app to the n8n backend webhook, where AI models process and summarize tenant or client input before returning results to the frontend.

---

## Contents

| File/Folder            | Description                                                                  |
| ---------------------- | ---------------------------------------------------------------------------- |
| `triage-workflow.json` | Exported n8n workflow that handles AI triage and summarization               |
| `scripts/`             | Contains frontend submission and integration scripts (e.g., handleSubmit.js) |
| `webhook-test/`        | Example requests and responses for webhook testing                           |
| `config/`              | Environment variable templates and webhook URL configurations                |
| `README.md`            | This documentation file                                                      |

---

## Workflow Summary

1. **Frontend Form** – User submits a request form (tenant or project form).
2. **Webhook Trigger** – The data is sent to the `n8n` webhook.
3. **AI Summary** – n8n calls the OpenAI node to summarize or classify input.
4. **Response Return** – n8n returns the summary text to the frontend.

---

## Next Steps

- Add Supabase integration for storing form data.
- Add error handling and validation nodes in the workflow.
- Create production-ready webhook for deployment.

---
