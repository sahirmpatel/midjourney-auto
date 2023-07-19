import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config();
const discordToken = process.env.DISCORD_AUTH_TOKEN;

// bot config
import { Client } from "discord.js";

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

  bot.on("messageCreate", (msg) => {
    console.log("msg:og", msg);
    console.log(
      `${msg.author.tag} in #${msg.channel.name} sent: ${msg.content}`
    );
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

    // Wait for 10 seconds before sending the next prompt
    await new Promise((r) => setTimeout(r, 20000));

    // await page.click(
    //   "button.component-ifCTxY.button-ejjZWC.lookFilled-1H2Jvj.colorRed-2VFhM4.sizeSmall-3R2P2p.grow-2T4nbg"
    // );
  }

  await browser.close();
};

sendPrompts();
