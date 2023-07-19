import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { Client } from "discord.js";
import { prompts } from "./user.js";
import startServer from "./server.js";
dotenv.config();
const discordToken = process.env.DISCORD_AUTH_TOKEN;

const bot = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages", "MessageContent"],
});

async function waitFewSeconds(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function getButtonCount(btnText, page) {
  return await page.evaluate((btnText) => {
    const xpathResult = document.evaluate(
      `//button//div[text()="${btnText}"]`,
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    return xpathResult.snapshotLength;
  }, btnText);
}

async function clickLatestButton(btnText, page) {
  const elements = await page.$x(`//button//div[text()="${btnText}"]`);
  if (elements.length > 0) {
    const lastElement = elements[elements.length - 1];
    await lastElement.click();
  }
}

const sendPrompts = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const bypassLocalStorageOverride = (page) =>
    page.evaluateOnNewDocument(() => {
      let __ls = localStorage;

      Object.defineProperty(window, "localStorage", {
        writable: false,
        configurable: false,
        value: __ls,
      });
    });

  bypassLocalStorageOverride(page);

  await page.goto("https://discord.com/app");

  await page.evaluate((token) => {
    localStorage.setItem("token", `"${token}"`);
  }, discordToken);

  await page.goto(
    "https://discord.com/channels/1123582118639964181/1123582118639964184"
  );

  console.log("Successfully logged in...");

  await new Promise((r) => setTimeout(r, 5000));

  // login the bot
  bot.on("ready", () => {
    console.log(`Logged in as ${bot.user.tag}!`);
  });

  bot.login(
    "MTEyMzU5NDgxMjA1OTI5OTg4MA.GumglQ.-9BeEOORNPt3xGxGXL43JOpHtfRHTwFmbgbT50"
  );

  const inputDiv =
    "div.textArea-2CLwUE.textAreaSlate-9-y-k2.slateContainer-3x9zil";

  const imageLinks = {};
  let imageArray = [];

  bot.on("messageCreate", (msg) => {
    if (msg.attachments && msg.attachments.size > 0) {
      msg.attachments.each((attachment) => {
        imageArray.push(attachment.proxyURL);
        console.log("imageLinks: ", attachment.proxyURL);
      });
    }
  });

  for (const [index, prompt] of prompts.entries()) {
    await page.click(inputDiv);
    await page.keyboard.type("/imagine ", { delay: 300 });
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type(prompt, { delay: 100 });
    await page.keyboard.press("Enter");

    let waitForButtonClick = new Promise((resolve, reject) => {
      bot.on("messageCreate", (msg) => {
        if (msg.components && msg.components.length > 0) {
          resolve();
        }
      });
    });

    await waitForButtonClick;

    console.log("GENERATION COMPLETE");

    await waitFewSeconds(2000);
    await clickLatestButton("U1", page);
    await waitFewSeconds(10000);
    await clickLatestButton("U2", page);
    await waitFewSeconds(10000);
    await clickLatestButton("U3", page);
    await waitFewSeconds(10000);
    await clickLatestButton("U4", page);
    await waitFewSeconds(10000);

    await new Promise((r) => setTimeout(r, 30000)); // Wait for 1 minute

    console.log("Image links for this prompt: ", imageArray);
    imageLinks[index + 1] = { prompt: prompt, images: imageArray };
    imageArray = []; // Reset the array for the next prompt

    console.log("MOVING TO NEXT PROMPT ");
  }

  await browser.close();
  console.log("imageLinks:", imageLinks);

  startServer(imageLinks); // Send the JSON object to the server
};

sendPrompts();
