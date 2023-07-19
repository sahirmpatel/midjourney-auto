import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { Client } from "discord.js";
import { prompts } from "./user.js";

dotenv.config();
const discordToken = process.env.DISCORD_AUTH_TOKEN;

const bot = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages", "MessageContent"],
});

// const prompts = ["lockheed martin sr-72 , northern lights", "cat"];

// puppeteer code

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

async function waitUntil(condition) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        resolve();
        clearInterval(interval);
      }
    }, 1000);
  });
}

async function waitTillButtonCountIncrease(text, page, condition) {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const currentCount = await getButtonCount(text, page);
      if (condition(currentCount)) {
        resolve();
        clearInterval(interval);
      }
    }, 1000);
  });
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

  // images

  const imageLinks = [];

  bot.on("messageCreate", (msg) => {
    if (msg.attachments && msg.attachments.size > 0) {
      msg.attachments.each((attachment) => {
        imageLinks.push(attachment.proxyURL);
        console.log("imageLinks: ", attachment.proxyURL);
      });
    }
  });

  for (const prompt of prompts) {
    await page.click(inputDiv);
    await page.keyboard.type("/imagine", { delay: 200 });
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type(prompt, { delay: 100 });
    await page.keyboard.press("Enter");

    // Wait for specific bot message
    // let waitForButtonClick = new Promise((resolve, reject) => {
    //   bot.on("messageCreate", (msg) => {
    //     if (msg) {
    //       console.log("msg 1:", JSON.stringify(msg, null, 4));
    //       resolve();
    //     }
    //   });
    // });

    let waitForButtonClick = new Promise((resolve, reject) => {
      bot.on("messageCreate", (msg) => {
        if (msg.components && msg.components.length > 0) {
          resolve();
        }
      });
    });

    await waitForButtonClick;

    // After receiving the specific message, click the button (uncomment if needed)
    console.log("GENERATION COMPLETE");
    // await page.click("button.component-ifCTxY.button-ejjZWC.lookFilled-1H2Jvj.colorRed-2VFhM4.sizeSmall-3R2P2p.grow-2T4nbg");

    await waitFewSeconds(2000);
    await clickLatestButton("U1", page);
    await waitFewSeconds(10000);
    await clickLatestButton("U2", page);
    await waitFewSeconds(10000);
    await clickLatestButton("U3", page);
    await waitFewSeconds(10000);
    await clickLatestButton("U4", page);
    await waitFewSeconds(10000);

    // Wait for specific bot message
    let waitForNextPrompt = new Promise((resolve, reject) => {
      bot.on("messageCreate", (msg) => {
        if (msg.content.includes("test")) {
          resolve();
        }
      });
    });

    await waitForNextPrompt;
    console.log("Image links for this prompt: ", imageLinks);

    // imageLinks.length = 0; // Reset the array for the next prompt

    console.log("MOVING TO NEXT PROMPT ");
  }

  await browser.close();
};

sendPrompts();
