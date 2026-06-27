require("dotenv").config();

const axios = require("axios");
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

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
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${process.env.APOD_API_KEY}`);
    const apod = response.data;

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
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${process.env.APOD_API_KEY}`);
    const apod = response.data;

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
            image_url: apod.hdurl,
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
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?count=1&api_key=${process.env.APOD_API_KEY}`);
    const apod = response.data[0];

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
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?count=1&api_key=${process.env.APOD_API_KEY}`);
    const apod = response.data[0];

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
            image_url: apod.hdurl,
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
