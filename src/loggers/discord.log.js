const { Client, GatewayIntentBits } = require("discord.js");

const token = `MTE0MDQ2MDAzNzY1NjAyMzA0MA.GEvUSn.1pTzG3xJJUlya_a8XoR87OU2I_b-XTQy6L4HzU`;

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
