import { Client } from "discord.js";

const bot = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages", "MessageContent"],
});

bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on("messageCreate", (msg) => {
  console.log("msg:og", msg);
  console.log("msg:string", JSON.stringify(msg, null, 4));

  console.log(`${msg.author.tag} in #${msg.channel.name} sent: ${msg.content}`);
});

bot.login(
  "MTEyMzU5NDgxMjA1OTI5OTg4MA.GumglQ.-9BeEOORNPt3xGxGXL43JOpHtfRHTwFmbgbT50"
);
