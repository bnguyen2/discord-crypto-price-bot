const { Client, Intents } = require('discord.js');

const discordSetup = (discordBotToken, discordChannelId) => {
  const discordBot = new Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES],
  });
  return new Promise((resolve, reject) => {
    discordBot.login(discordBotToken);
    discordBot.on('ready', async () => {
      const channel = await discordBot.channels.fetch(discordChannelId);
      resolve(channel);
    });
  });
};

module.exports = { discordSetup };
