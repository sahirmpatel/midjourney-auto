import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { Client } from "discord.js";

dotenv.config();
const discordToken = process.env.DISCORD_AUTH_TOKEN;

const bot = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages", "MessageContent"],
});

const prompts = ["horse painting", "cat"];

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

    // Wait for specific bot message
    let waitForNextPrompt = new Promise((resolve, reject) => {
      bot.on("messageCreate", (msg) => {
        if (msg.content.includes("test")) {
          resolve();
        }
      });
    });

    await waitForNextPrompt;

    console.log("MOVING TO NEXT PROMPT ");
  }

  await browser.close();
};

sendPrompts();
