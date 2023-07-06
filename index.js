import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config();
const discordToken = process.env.DISCORD_AUTH_TOKEN;
console.log("discordToken:", discordToken);

const prompts = [
  // "A 20 × 20 meters booth, booth design, square shape, black and white matching, with white light belt, science and technology style, communication booth, with creative mobile phone display cabinet, display table",
  "electric bicycle in the blue studio, minimalist, pure color, work office --ar 2:3 --q 2 --s 250 --v 5.2",
  // "a close up image of a butterfly , minimalistic, in the style of Magdalena Wasiczek, light green and pink, uhd image, national geographic photo --ar 2:3 --s 750",
  // "topdown, roguelike, realistic miniature, --q 2 ",
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
    await new Promise((r) => setTimeout(r, 50000));

    await page.click(
      "button.component-ifCTxY.button-ejjZWC.lookFilled-1H2Jvj.colorRed-2VFhM4.sizeSmall-3R2P2p.grow-2T4nbg"
    );
  }

  await browser.close();
};

sendPrompts();
