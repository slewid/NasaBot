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

app.command("/nasabot-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
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

app.command("/nasabot-apod", async ({ ack, respond }) => {
  await ack();

  try {
    const apod = await fetchApod();

    // Limit explanation length
    const explanation =
      apod.explanation.length > 500
        ? apod.explanation.substring(0, 500) + "..."
        : apod.explanation;

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
            image_url: apod.url,
            alt_text: apod.title
          }
        ]
      });
    } else {
      // Handle videos (e.g., YouTube)
      await respond({
        type: "mrkdwn",
        text:
          `*${apod.title}*\n` +
          `Date: ${apod.date}\n\n` +
          `${explanation}\n\n` +
          `${apod.url}`
      });
    }
  } catch (err) {
    console.error(err);

    await respond({
      text: "Failed to fetch the Astronomy Picture of the Day."
    });
  }
});

app.command("/nasabot-hd-apod", async ({ ack, respond }) => {
  await ack();

  try {
    const apod = await fetchApod();

    // Limit explanation length
    const explanation =
      apod.explanation.length > 500
        ? apod.explanation.substring(0, 500) + "..."
        : apod.explanation;

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
            image_url: apod.hdurl || apod.url,
            alt_text: apod.title
          }
        ]
      });
    } else {
      // Handle videos (e.g., YouTube)
      await respond({
        type: "mrkdwn",
        text:
          `*${apod.title}*\n` +
          `Date: ${apod.date}\n\n` +
          `${explanation}\n\n` +
          `${apod.url}`
      });
    }
  } catch (err) {
    console.error(err);

    await respond({
      text: "Failed to fetch the HD Astronomy Picture of the Day."
    });
  }
});

app.command("/nasabot-random", async ({ ack, respond }) => {
  await ack();

  try {
    const apod = await fetchApod( {random: true} );

    // Limit explanation length
    const explanation =
      apod.explanation.length > 500
        ? apod.explanation.substring(0, 500) + "..."
        : apod.explanation;

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
            image_url: apod.url,
            alt_text: apod.title
          }
        ]
      });
    } else {
      // Handle videos (e.g., YouTube)
      await respond({
        type: "mrkdwn",
        text:
          `*${apod.title}*\n` +
          `Date: ${apod.date}\n\n` +
          `${explanation}\n\n` +
          `${apod.url}`
      });
    }
  } catch (err) {
    console.error(err);

    await respond({
      text: "Failed to fetch a random HD Astronomy Picture of the Day."
    });
  }
});

app.command("/nasabot-hd-random", async ({ ack, respond }) => {
  await ack();

  try {
    const apod = await fetchApod({random: true});

    // Limit explanation length
    const explanation =
      apod.explanation.length > 500
        ? apod.explanation.substring(0, 500) + "..."
        : apod.explanation;

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
            image_url: apod.hdurl || apod.url,
            alt_text: apod.title
          }
        ]
      });
    } else {
      // Handle videos (e.g., YouTube)
      await respond({
        type: "mrkdwn",
        text:
          `*${apod.title}*\n` +
          `Date: ${apod.date}\n\n` +
          `${explanation}\n\n` +
          `${apod.url}`
      });
    }
  } catch (err) {
    console.error(err);

    await respond({
      text: "Failed to fetch a random Astronomy Picture of the Day."
    });
  }
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();
