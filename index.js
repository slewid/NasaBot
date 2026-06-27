require("dotenv").config();

const axios = require("axios");
const { App } = require("@slack/bolt");

// Initialise slack bot
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

// Axios client config for NASA APOD API
const nasa = axios.create({
  baseURL: "https://api.nasa.gov/planetary",
  timeout: 100000,
  params: {
    api_key: process.env.APOD_API_KEY
  }
});

// Fetch APOD from API
async function fetchApod({ random = false } = {}) {
    const { data } = await nasa.get("/apod", {
        params: random ? { count: 1 } : {}
    }); 

    return random ? data[0] : data;
}

// shorten long APOD descriptions for slack messages
function formatExplanation(text) {
    return text.length > 500 
    ? text.substring(0, 500) + "..." 
    : text;
}

// send APOD response to slack
async function sendAPOD(respond, apod, hd) {
    const explanation = formatExplanation(apod.explanation);

    // display image with slack image block
    if (apod.media_type === "image") {
        await respond({
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text:
                            `*${apod.title}*\n` +
                            `*Date:* ${apod.date}\n\n` +
                            `${explanation}`
                    }
                },
                {
                    type: "image",
                    image_url: hd && apod.hdurl ? apod.hdurl : apod.url,
                    alt_text: apod.title
                }
            ]
        });
    } else {
        // handle videos
        await respond({
            type: "mrkdwn",
            text:
                `*${apod.title}*\n` + 
                `Date: ${apod.date}\n\n` +
                `${explanation}\n\n` +
                `${apod.url}`
        });
    }
}

// register APOD command with its config
function registerAPODCommand(command, { random, hd }) {
    app.command(command, async({ ack, respond }) => {
        await ack();

        try {
            const apod = await fetchApod({ random });
            await sendAPOD(respond, apod, hd);
        
        } catch (err) {
            console.error(err.response?.data || err.message);

            await respond({
                text: "Failed to fetch Astronomy Picture of the day\n" +
                `${random} : ${hd}`
            });
        }
    })
}

// register all APOD commands
registerAPODCommand("/nasabot-apod", {
    random: false,
    hd: false
});

registerAPODCommand("/nasabot-hd-apod", {
    random: false,
    hd: true
});

registerAPODCommand("/nasabot-random", {
    random: true,
    hd: false
});

registerAPODCommand("/nasabot-hd-random", {
    random: true,
    hd: true
});

// check if bot is online
app.command("/nasabot-ping", async ({ command, ack, respond }) => {
  await ack();
  await respond({ text: `Pong!` });
});

// display all commands
app.command("/nasabot-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/nasabot-ping - Check bot latency
/nasabot-random - Get a random date of NASA's astronomy picture of the day
/nasabot-apod - Get NASA's astronomy picture of the day
/nasabot-hd-random - Get a random date of NASA's astronomy picture of the day in HD
/nasabot-hd-apod - Get NASA's astronomy picture of the day in HD`
  });
});

// start the bot
(async () => {
  await app.start();
  console.log("bot is running!");
})();
