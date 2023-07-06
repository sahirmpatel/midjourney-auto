import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { clickLatestButton, getButtonCount, waitFewSeconds, waitTillButtonCountIncrease, waitUntil } from "./helper.js";
dotenv.config();
const discordToken = process.env.DISCORD_AUTH_TOKEN;
console.log("discordToken:", discordToken);

const prompts = [
  // "A 20 × 20 meters booth, booth design, square shape, black and white matching, with white light belt, science and technology style, communication booth, with creative mobile phone display cabinet, display table",
  // "electric bicycle in the blue studio, minimalist, pure color, work office --ar 2:3 --q 2 --s 250 --v 5.2",
  // "a close up image of a butterfly , minimalistic, in the style of Magdalena Wasiczek, light green and pink, uhd image, national geographic photo --ar 2:3 --s 750",
  // "topdown, roguelike, realistic miniature, --q 2 ",
  "a puppy typing on a keyboard"
];
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

  const inputDiv = "div.textArea-2CLwUE.textAreaSlate-9-y-k2.slateContainer-3x9zil";

  for (const prompt of prompts) {
    await page.click(inputDiv);
    await page.keyboard.type("/imagine", { delay: 200 });
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type(prompt, { delay: 100 });
    await page.keyboard.press("Enter");

    const previousCount = await getButtonCount("U1", page);

    await waitTillButtonCountIncrease("U1", page, (currentCount) => currentCount > previousCount);

    await waitFewSeconds(2000);

    await clickLatestButton("U1", page);
    await waitFewSeconds(10000);
    await clickLatestButton("U2", page);
    await waitFewSeconds(10000);
    await clickLatestButton("U3", page);
    await waitFewSeconds(10000);
    await clickLatestButton("U4", page);
    await waitFewSeconds(10000);
    
  }

  await browser.close();
};

sendPrompts();
