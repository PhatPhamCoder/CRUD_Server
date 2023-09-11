const { Client } = require("discord.js");

const { token, channelId } = require("../config/config.json");

exports.PushToMessage = () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.on("ready", () => {
    console.log(`Logger is As ${client.user.tag}`);
  });

  client.login(token);

  client.on("messageCreate", (msg) => {
    if (msg.author.bot) {
      return;
    }
    if (msg.content === "hello") {
      msg.reply("Hello! How can i help you today!");
    }
  });
};
