/*

Script version 3.0, June 15, 2026

Script to batch-generate videos using prompts with the Runway API v1 by useapi.net 🚀
Uses the unified videos/create endpoint (default model: Gen-4.5).
For more details visit https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create

Installation Instructions:
==========================

You need Node.js v21 or newer installed to run this script. Download and install Node.js from:

- Windows, macOS, Linux: https://nodejs.org/

After installation, verify by running the following command in a terminal:

   node -v

Running the Script:
===================

Usage: node runwayml.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]

Replace API_TOKEN with your actual useapi.net API token, see https://useapi.net/docs/start-here/setup-useapi
Replace EMAIL with configured Runway email account, see https://useapi.net/docs/start-here/setup-runwayml
If optional PROMPTS_FILE not provided prompts.json will be used.

Example:
--------

node runwayml.mjs user:1234-abcdefhijklmnopqrstuv my@email.com

This command executes the script using API token user:1234-abcdefhijklmnopqrstuv with my@email.com Runway account email.

Changelog:
==========

- June 15, 2026: Migrated to the unified videos/create endpoint. Select the model via the prompt's model field (default gen4.5).
- October 22, 2024: Small bug fix with parameter validation.

*/

import readline from 'node:readline';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';


// Constants
const RESULTS_FILE = 'runwayml_results.txt';
const ERRORS_FILE = 'runwayml_errors.txt';
const DEFAULT_PROMPTS_FILE = 'prompts.json';
const DEFAULT_MODEL = 'gen4.5';
const SLEEP_429 = 10 * 1000; // in milliseconds
const SLEEP_DOWNLOAD = 20 * 1000; // in milliseconds

const urlAccounts = 'https://api.useapi.net/v1/runwayml/accounts';
const urlVideosCreate = 'https://api.useapi.net/v1/runwayml/videos/create';
const urlDownload = 'https://api.useapi.net/v1/runwayml/tasks/';
const urlUploadAsset = 'https://api.useapi.net/v1/runwayml/assets/?email=';

// To upload .webp rename it to .jpeg
const supportedFileExtensions = ['png', 'jpeg', 'gif']

// { filename: assetId }
const uploadedFiles = {};

// Utility to sleep for given milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to fetch configured Runway API accounts
async function fetchAccounts(apiToken) {
    const response = await fetch(urlAccounts, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        }
    });

    if (!response.ok) {
        console.error(`⛔ Error fetching accounts (HTTP ${response.status}): ${response.statusText}`);
        process.exit(1);
    }

    return response.json();
}

const elapsedTimeSec = (start) => (Date.now() - start) / 1000;

async function uploadAsset(apiToken, email, filename) {

    // Check if already uploaded 
    if (uploadedFiles.hasOwnProperty(filename))
        return uploadedFiles[filename];

    const startTime = Date.now();

    console.log(`⬆️  Account ${email} uploading file…`, filename);

    const body = new Blob([await fs.readFile(filename)]);

    const name = path.basename(filename);

    const fileExt = filename.split('.').pop();

    const response = await fetch(`${urlUploadAsset}${email}&name=${name}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': `image/${fileExt}`
        },
        body
    });

    if (response.ok) {
        const json = await response.json();
        const { assetId } = json;
        console.log(`🆗 assetId (${elapsedTimeSec(startTime)} sec)`, assetId);
        uploadedFiles[filename] = assetId;
    }
    else {
        console.error(`❗ Unable to upload file HTTP ${response.status} (${elapsedTimeSec(startTime)} sec)`, await response.text());
        // Do not attempt to upload failed file again 
        uploadedFiles[filename] = undefined;
    }

    return uploadedFiles[filename];
}

async function submit(apiToken, url, body, index, text_prompt) {
    const createResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        },
        body
    });

    const createBody = await createResponse.text();

    if (createResponse.status == 200) {
        const json = JSON.parse(createBody);
        const { taskId } = json;
        if (taskId) {
            await fs.appendFile(RESULTS_FILE, `${taskId},#${index}:${text_prompt}\n`);
            console.log(`✅ taskId`, taskId);
            return 200;
        } else {
            const error = `No taskId found in HTTP 200 response`;
            console.log(`❓ ${error}`, createBody);
            await fs.appendFile(ERRORS_FILE, `${error},#${index}:${text_prompt}\n`);
            return 500;
        }
    } else {
        switch (createResponse.status) {
            case 429:
                console.log(`🔄️ Retry on HTTP ${createResponse.status}`);
                break;
            case 422:
                console.log(`🛑 MODERATED prompt`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${text_prompt}\n`);
                break;
            case 412:
                console.log(`🛑 account run out of credits`, createBody);
                break;
            default:
                console.log(`❗ FAILED with HTTP ${createResponse.status}`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${text_prompt}\n`);
        }
        return createResponse.status;
    }
}

// Submit a single prompt to the unified videos/create endpoint.
// imageAssetId1 = start frame (firstImage or image), imageAssetId2 = end frame (lastImage).
async function submitVideo(apiToken, email, prompt, index) {
    const { model, text_prompt, firstImage, lastImage, image, aspect_ratio, duration, seed } = prompt;

    const useModel = model ?? DEFAULT_MODEL;
    const exploreMode = prompt?.exploreMode ?? true;
    const useDuration = duration ?? 5;

    console.log(`🚀 ${useModel} » Prompt #${index} • account ${email} • exploreMode ${exploreMode ? 'ON' : 'OFF'} • ${useDuration} secs …`);

    const startFrame = firstImage ?? image;
    const imageAssetId1 = startFrame ? await uploadAsset(apiToken, email, startFrame) : undefined;
    const imageAssetId2 = lastImage ? await uploadAsset(apiToken, email, lastImage) : undefined;

    const body = JSON.stringify({
        model: useModel,
        email,
        text_prompt,
        aspect_ratio,
        duration: useDuration,
        seed,
        exploreMode,
        imageAssetId1,
        imageAssetId2
    });

    return await submit(apiToken, urlVideosCreate, body, index, text_prompt);
}

// Function to download videos 
async function download(apiToken) {
    if (! await fileExists(RESULTS_FILE)) return;

    try {
        const resultsContent = await fs.readFile(RESULTS_FILE, 'utf8');
        const lines = resultsContent.trim().split('\n');

        for (const line of lines) {
            const [taskId, prompt] = line.split(',');
            const videoFilename = `${taskId.replace(/:/g, '_')}.mp4`;

            console.log(`👉 ${taskId}`);

            try {
                await fs.access(videoFilename);
                console.log(`⚠️ ${videoFilename} already exists. Skipping download.`);
                continue;
            } catch {
                // File does not exist, proceed with downloading
            }

            while (true) {
                const response = await fetch(`${urlDownload}${taskId}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${apiToken}`
                    }
                });

                if (!response.ok) {
                    console.log(`🛑 Download failed ${taskId} (HTTP ${response.status}):\n${prompt}\n`, await response.text());
                    break;
                }

                const taskResponseBody = await response.json();
                const { status, artifacts, error, progressRatio, estimatedTimeToStartSeconds } = taskResponseBody;

                if (status == 'FAILED') {
                    console.error(`🛑 FAILED ${taskId} (${error}):\n${prompt}\n`);
                    break;
                }

                if (status == 'SUCCEEDED') {
                    const url = artifacts.at(0).url;

                    if (url) {
                        console.log(`✅ Downloading ${url} to ${videoFilename}`);
                        try {
                            const videoResponse = await fetch(url);
                            if (!videoResponse.ok) {
                                console.error(`⛔ Unable to download ${taskId} (HTTP ${videoResponse.status}):\n${prompt}\n`, url);
                                break;
                            }
                            const stream = Readable.fromWeb(videoResponse.body);
                            await writeFile(videoFilename, stream);
                        } catch (err) {
                            console.error(`⛔ Error during download: ${err}`);
                        }
                    } else
                        console.error(`🛑 Unable to download ${taskId} status (${status} ${error}):\n${prompt}\n`);

                    break;
                }

                console.log(`⌛ ${taskId} status (${status}) and is still in progress (${progressRatio * 100}%, seconds to start ${estimatedTimeToStartSeconds}), waiting…`);
                await sleep(SLEEP_DOWNLOAD);
            }
        }
    } catch (error) {
        console.log(`⛔ Error during download:`, error.stack || error);
    }
}

// Main function
async function main() {
    const apiToken = process.argv[2];
    const email = process.argv[3];
    const promptFile = process.argv[4] || DEFAULT_PROMPTS_FILE;

    if (!apiToken || !email) {
        console.error('Usage: node runwayml.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]');
        process.exit(1);
    }

    console.info('Script v3.0');

    console.info('Node version is: ' + process.version);

    try {
        if (await fileExists(RESULTS_FILE)) {
            let user_input;
            while (!['y', 'n'].includes(user_input)) {
                user_input = (await promptUser(`❔ ${RESULTS_FILE} file detected. Do you want to download the results now? (y/n): `))?.toLowerCase();
                if (user_input == 'y') {
                    await download(apiToken);
                    await fs.unlink(RESULTS_FILE);
                }
            }
        }

        const start = new Date();
        try {
            console.info('START EXECUTION', start);
            await execute(apiToken, email, promptFile); // Pass the promptFile to execute function
        }
        finally {
            console.info('COMPLETED', new Date());
            console.info('EXECUTION ELAPSED', diffInMinutesAndSeconds(start, new Date()));
        }

        try {
            console.info('START DOWNLOAD', start);
            await download(apiToken);
        }
        finally {
            console.info('TOTAL ELAPSED', diffInMinutesAndSeconds(start, new Date()));
        }
    } catch (error) {
        console.error('⛔ Error during execution:', error.stack || error);
    }
}

// Modify the execute function to accept promptFile as a parameter
async function execute(apiToken, email, promptFile) {
    const accounts = await fetchAccounts(apiToken);

    console.info(`Configured Runway API accounts (${Object.values(accounts).length}):`, Object.values(accounts).map(a => a.email).join(', '));

    if (Object.values(accounts).length <= 0) {
        console.error(`⛔ No configured Runway accounts found. Please refer to https://useapi.net/docs/start-here/setup-runwayml`);
        process.exit(1);
    }

    if (!accounts[email]) {
        console.error(`⛔ Accounts ${email} not found. Please refer to https://useapi.net/docs/start-here/setup-runwayml`);
        process.exit(1);
    }

    if (accounts[email].error) {
        console.error(`⛔ Accounts ${email} has pending error. Please resolve and update account at https://useapi.net/docs/api-runwayml-v1/post-runwayml-accounts-email`);
        process.exit(1);
    }

    const promptData = await fs.readFile(promptFile, 'utf8');
    const prompts = JSON.parse(promptData);
    console.log(`Total number of prompts to process`, prompts.length);

    let warnings = [];

    // Parameters accepted by this script for the videos/create endpoint.
    // See https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create for every model's full parameter set.
    const supportedParams = ['model', 'text_prompt', 'firstImage', 'lastImage', 'image', 'aspect_ratio', 'duration', 'seed', 'exploreMode'];

    const invalidKeys = (prompt) => Object.keys(prompt).filter(key => !key.startsWith('__') && !supportedParams.includes(key))

    for (let i = 1; i <= prompts.length; i++) {
        const prompt = prompts[i - 1];
        const { text_prompt, firstImage, lastImage, image } = prompt;

        const validateImage = async (file) => {
            if (file) {
                try {
                    await fs.access(file);
                } catch {
                    warnings.push(`⚠️  Image '${file}' does not exist. Prompt ${i}`);
                }

                const ext = file.split('.').pop();

                if (!supportedFileExtensions.includes(ext))
                    warnings.push(`⚠️  Image ${file} extension ${ext} not supported. Prompt ${i}`);
            }
        };

        const notSupported = invalidKeys(prompt);
        if (notSupported.length)
            warnings.push(`⚠️  Following params not supported: ${notSupported.join(',')}. Prompt ${i}`);

        if (!text_prompt && !firstImage && !lastImage && !image)
            warnings.push(`⚠️  Please specify text_prompt and/or an image (firstImage / lastImage / image). Prompt ${i}`);

        await Promise.all([validateImage(firstImage), validateImage(lastImage), validateImage(image)]);
    }

    if (warnings.length > 0) {
        warnings.forEach(warning => console.warn(warning));
        console.error(`⛔ Execution stopped due to warnings.`);
        process.exit(1);
    }

    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        while (true) {
            const responseCode = await submitVideo(apiToken, email, prompt, i + 1);
            if (responseCode == 429)
                await sleep(SLEEP_429);
            else
                if (responseCode == 412) {
                    process.exit(1);
                } else
                    break;
        }
    }
}

// Utility function to check if a file exists
async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

// Function to prompt user input
async function promptUser(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => rl.question(query, answer => {
        rl.close();
        resolve(answer);
    }));
}

function diffInMinutesAndSeconds(date1, date2) {
    const diffInSeconds = Math.floor((date2 - date1) / 1000);
    return `${Math.floor(diffInSeconds / 60)} minutes ${diffInSeconds % 60} seconds`;
};

main();
