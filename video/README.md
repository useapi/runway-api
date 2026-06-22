# Runway Gen video — Runway API batch generation (Node.js)

Batch-generate [Runway](https://runwayml.com) **Gen-4.5** (and Gen-4, Gen-4 Turbo, plus the third-party models Runway hosts — Veo 3.1, Sora 2, Kling, Seedance, and more) video through the [Runway API](https://useapi.net/docs/api-runwayml-v1) by [useapi.net](https://useapi.net).

📖 Full walkthrough: **[How to Generate Runway Gen Videos via API](https://useapi.net/docs/articles/runway-bash)**

`runwayml.mjs` reads prompts from `prompts.json`, uploads any start-frame (and, for models that support an end frame, last-frame) images via [`POST /assets`](https://useapi.net/docs/api-runwayml-v1/post-runwayml-assets), submits each job to the unified [`POST /videos/create`](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create) endpoint, polls [`GET /tasks/{taskId}`](https://useapi.net/docs/api-runwayml-v1/get-runwayml-tasks-taskId) until each task is final, and downloads every finished MP4.

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install — uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi)
- A connected [Runway account](https://useapi.net/docs/start-here/setup-runwayml) email

## Usage

```bash
node ./runwayml.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]
```

`PROMPTS_FILE` defaults to `prompts.json`. The script looks the account up by email before submitting.

## Prompts

`prompts.json` is an array of prompt objects — `text_prompt` and/or a start/end image is required. The default model is `gen4.5` with a 5-second duration. Pick another model with the `model` field (`gen4.5`, `gen4`, `gen4-turbo`, plus hosted models such as `veo-3.1`, `kling-3.0-pro`, `sora-2`, `seedance-2`, …). For image-to-video set `firstImage` (start frame → `imageAssetId1`) to a **local file path** (`.png`, `.jpeg`, `.gif`; rename `.webp` to `.jpeg`) — it is uploaded for you. Models that support an end frame — `kling-3.0-pro`, `veo-3.1` — also accept `lastImage` (end frame → `imageAssetId2`). The Gen-4.x models (`gen4.5`, `gen4`, `gen4-turbo`) take a single start frame only. Every supported parameter is documented on [POST /videos/create](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create). Local image paths in `prompts.json` are inputs **you** supply — they are not included in this repo.

---

Support: [Discord](https://discord.gg/w28uK3cnmF) · [Telegram](https://t.me/use_api) · [YouTube](https://www.youtube.com/@midjourneyapi)
