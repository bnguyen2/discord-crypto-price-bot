const {
  WEBSOCKET_URI,
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
  SNOWTRACE_API_KEY,
} = require('./secrets.json');

const CCCSalesBot = require('./bot');

CCCSalesBot({
  WEBSOCKET_URI,
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
  SNOWTRACE_API_KEY,
});
