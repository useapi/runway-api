/*

Script version 3.0, June 15, 2026

Script to generate images using prompts with Runway API v1 by useapi.net 🚀
For more details visit https://useapi.net/docs/api-runwayml-v1

Installation Instructions:
==========================

You need Node.js v21 or newer installed to run this script. Download and install Node.js from:

- Windows, macOS, Linux: https://nodejs.org/

After installation, verify by running the following commands in a terminal:

   node -v

Running the Script:
===================

Usage: node frames.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]

Replace API_TOKEN with your actual useapi.net API token, see https://useapi.net/docs/start-here/setup-useapi
Replace EMAIL with configured Runway email account, see https://useapi.net/docs/start-here/setup-runwayml
If optional PROMPTS_FILE not provided frames.json will be used.

Example #1:
--------

node frames.mjs user:1234-abcdefhijklmnopqrstuv my@email.com

This command executes the script using API token user:1234-abcdefhijklmnopqrstuv with my@email.com Runway account email.

Example #2:
--------

node frames.mjs user:1234-abcdefhijklmnopqrstuv my@email.com frames.json

This command executes the script using API token user:1234-abcdefhijklmnopqrstuv with my@email.com Runway account email and load prompts from frames.json file.

*/

import readline from 'node:readline';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';

// Constants
const RESULTS_FILE = 'frames_results.txt';
const ERRORS_FILE = 'frames_errors.txt';
const DEFAULT_PROMPTS_FILE = 'frames.json';
const SLEEP_429 = 5 * 1000; // in milliseconds
const SLEEP_DOWNLOAD = 10 * 1000; // in milliseconds
const MAX_CONCURRENT_JOBS = 3; // Number of parallel jobs
const DEFAULT_DIVERSITY = 3;
const DEFAULT_NUM_IMAGES = 4; // Frames returns 1 or 4 images per generation

// Docs reference https://useapi.net/docs/api-runwayml-v1/get-runwayml-accounts
const urlAccounts = 'https://api.useapi.net/v1/runwayml/accounts';
// Docs reference https://useapi.net/docs/api-runwayml-v1/post-runwayml-frames-create
const urlFramesCreate = 'https://api.useapi.net/v1/runwayml/frames/create';
// Docs reference https://useapi.net/docs/api-runwayml-v1/get-runwayml-tasks-taskId
const urlTasks = 'https://api.useapi.net/v1/runwayml/tasks/';

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

async function submitFrames(apiToken, email, prompt, index) {
    const { text_prompt, aspect_ratio, diversity, style, seed, num_images,
            imageAssetId1, imageAssetId2, imageAssetId3 } = prompt;

    const exploreMode = prompt?.exploreMode ?? true;

    console.log(`🚀 Frames » Prompt #${index} • account ${email} • exploreMode ${exploreMode ? 'ON' : 'OFF'}`);

    const body = JSON.stringify({
        email, text_prompt, aspect_ratio,
        diversity: diversity ?? DEFAULT_DIVERSITY,
        num_images: num_images ?? DEFAULT_NUM_IMAGES,
        style, seed, exploreMode,
        imageAssetId1, imageAssetId2, imageAssetId3
    });

    return await submit(apiToken, urlFramesCreate, body, index, text_prompt);
}

// Function to download assets
async function download(apiToken) {
    if (! await fileExists(RESULTS_FILE)) return;

    try {
        const resultsContent = await fs.readFile(RESULTS_FILE, 'utf8');
        const lines = resultsContent.trim().split('\n');

        for (const line of lines) {
            const [taskId, prompt] = line.split(',');

            console.log(`👉 ${taskId}`);

            while (true) {
                const response = await fetch(`${urlTasks}${taskId}`, {
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
                    for (let i = 0; i < artifacts.length; i++) {
                        const url = artifacts[i].url;
                        const extension = path.extname(new URL(url).pathname);
                        const assetFileName = `${taskId}-${i}${extension}`;

                        try {
                            await fs.access(assetFileName);
                            console.log(`⚠️ ${assetFileName} already exists. Skipping download.`);
                            continue;
                        } catch {
                            // File does not exist, proceed with downloading
                        }

                        if (url) {
                            console.log(`✅ Downloading ${url} to ${assetFileName}`);
                            try {
                                const assetResponse = await fetch(url);
                                if (!assetResponse.ok) {
                                    console.error(`⛔ Unable to download ${taskId} (HTTP ${assetResponse.status}):\n${prompt}\n`, url);
                                    break;
                                }
                                const stream = Readable.fromWeb(assetResponse.body);
                                await writeFile(assetFileName, stream);
                            } catch (err) {
                                console.error(`⛔ Error during download: ${err}`);
                            }
                        } else {
                            console.error(`🛑 Unable to download ${taskId} status (${status} ${error}):\n${prompt}\n`);
                        }
                    }

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
        console.error('Usage: node frames.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]');
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

    const paramsFrames = ['text_prompt', 'aspect_ratio', 'diversity', 'style', 'seed', 'exploreMode',
        'num_images', 'imageAssetId1', 'imageAssetId2', 'imageAssetId3'];

    const invalidKeys = (supported, prompt) => Object.keys(prompt).filter(key => !key.startsWith('__') && !supported.includes(key));

    for (let i = 1; i <= prompts.length; i++) {
        const prompt = prompts[i - 1];
        const { text_prompt } = prompt;

        const notSupported = invalidKeys(paramsFrames, prompt);

        if (notSupported.length)
            warnings.push(`⚠️  Frames » following params not supported: ${notSupported.join(',')}. Prompt ${i}`);

        if (!text_prompt)
            warnings.push(`⚠️  Frames » please specify text_prompt. Prompt ${i}`);
    }

    if (warnings.length > 0) {
        warnings.forEach(warning => console.warn(warning));
        console.error(`⛔ Execution stopped due to warnings.`);
        process.exit(1);
    }

    const queue = prompts.map((prompt, index) => ({ prompt, index }));

    const processQueue = async () => {
        const activeJobs = [];

        while (queue.length > 0) {
            if (activeJobs.length < MAX_CONCURRENT_JOBS) {
                const { prompt, index } = queue.shift();
                const job = (async () => {
                    while (true) {
                        const responseCode = await submitFrames(apiToken, email, prompt, index + 1);
                        if (responseCode == 429) {
                            await sleep(SLEEP_429);
                        } else if (responseCode == 412) {
                            process.exit(1);
                        } else {
                            break;
                        }
                    }
                })();
                activeJobs.push(job);
                job.finally(() => activeJobs.splice(activeJobs.indexOf(job), 1));
            } else {
                await Promise.race(activeJobs);
            }
        }

        await Promise.all(activeJobs);
    };

    await processQueue();
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
