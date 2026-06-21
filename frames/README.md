# Runway Frames images — Runway API batch generation (Node.js)

Batch-generate high-fidelity images with [Runway Frames](https://useapi.net/docs/api-runwayml-v1/post-runwayml-frames-create) — including up to three **reference images** — through the [Runway API](https://useapi.net/docs/api-runwayml-v1) by [useapi.net](https://useapi.net).

📖 Full walkthrough: **[How to Batch-Generate Images with Runway Frames via API](https://useapi.net/docs/articles/runway-frames-script)**

`frames.mjs` reads prompts from `prompts.json`, submits each job to [`POST /frames/create`](https://useapi.net/docs/api-runwayml-v1/post-runwayml-frames-create) (up to three generations run in parallel), polls [`GET /tasks/{taskId}`](https://useapi.net/docs/api-runwayml-v1/get-runwayml-tasks-taskId) until each task is final, and downloads every finished image (1 or 4 per generation, default 4).

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install — uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi)
- A connected [Runway account](https://useapi.net/docs/start-here/setup-runwayml) email

## Usage

```bash
node ./frames.mjs <API_TOKEN> <EMAIL> prompts.json
```

The script looks the account up by email before submitting. Note: `frames.mjs` defaults to `frames.json` when no prompts file is given, so pass `prompts.json` explicitly (as above) to use the file in this folder.

## Prompts

`prompts.json` is an array of prompt objects — `text_prompt` is the only required field. By default `exploreMode` is ON and `num_images` is 4. Optional fields include `style`, `aspect_ratio`, `diversity`, `seed`, and `num_images` (1 or 4). For reference images, upload them first with [POST /assets](https://useapi.net/docs/api-runwayml-v1/post-runwayml-assets), then pass their asset ids as `imageAssetId1`, `imageAssetId2`, `imageAssetId3` and refer to them in the prompt as `@IMG_1`, `@IMG_2`, `@IMG_3`. Every supported parameter is documented on [POST /frames/create](https://useapi.net/docs/api-runwayml-v1/post-runwayml-frames-create).

---

Support: [Discord](https://discord.gg/w28uK3cnmF) · [Telegram](https://t.me/use_api) · [YouTube](https://www.youtube.com/@midjourneyapi)
