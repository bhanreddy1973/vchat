const { Env } = require('./env');
const arcjet = require("@arcjet/node"); // ✅ Default import
const { shield, detectBot, slidingWindow } = require("@arcjet/node"); // ✅ Named imports

const aj = arcjet.default({ // ✅ Use arcjet.default
  key: Env.ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    
    // Sliding window rate limiting
    slidingWindow({
      mode: "LIVE",
      max: 100, // Max 100 requests
      interval: "1m", // Per 1 minute
    }),
  ],
});

module.exports = { aj };