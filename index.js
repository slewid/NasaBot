require("dotenv").config();

const axios = require("axios");
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

const nasa = axios.create({
  baseURL: "https://api.nasa.gov/planetary",
  params: {
    api_key: process.env.APOD_API_KEY
  }
});

async function fetchApod({ random = false } = {}) {
    const endpoint = random 
        ? `/apod?count=1`
        : `/apod?`;
    
    const response = await nasa.get(endpoint);

    return random ? response.data[0] : response.data;
}

function formatExplanation(text) {
    return text.length > 500 
    ? text.substring(0, 500) + "..." 
    : text;
}

async function sendAPOD(respond, apod, hd) {
    const explanation = formatExplanation(apod.explanation);

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

function registerAPODCommand(command, { random, hd }) {
    app.command(command, async({ ack, respond }) => {
        await ack();

        try {
            const apod = await fetchApod({ random });
            sendAPOD(respond, apod, hd);
        
        } catch (err) {
            console.error(err);

            await respond({
                text: "Failed to fetch Astronomy Picture of the day\n" +
                `${random} : ${hd}`
            });
        }
    })
}

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

app.command("/nasabot-ping", async ({ command, ack, respond }) => {
  await ack();
  await respond({ text: `Pong!` });
});

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

(async () => {
  await app.start();
  console.log("bot is running!");
})();
