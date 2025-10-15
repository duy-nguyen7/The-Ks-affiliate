cat > server.js <<'EOF'
const express = require("express");
const { Telegraf, Markup } = require("telegraf");

const TOKEN = process.env.TG_BOT_TOKEN;
const AT_KEY = process.env.AT_API_KEY || "";
const SUB4  = process.env.AT_SUB4 || "shopee_promotebot";
const PORT  = process.env.PORT || 8080;

if (!TOKEN) {
  console.error("❌ Missing TG_BOT_TOKEN");
  process.exit(1);
}

const app = express();
app.use(express.json());

// Health endpoint
app.get("/", (_req, res) => res.status(200).send("✅ Shopee Affiliate Bot running"));

// Telegram webhook
const bot = new Telegraf(TOKEN);
const webhookPath = "/webhook";
app.use(webhookPath, bot.webhookCallback(webhookPath));

// Regex to detect Shopee URLs
const RX = /https?:\/\/(?:[\w\-]+\.)*shopee\.[^\s)<>"]+/i;

// Build affiliate link function
function buildAffiliate(url) {
  const enc = encodeURIComponent(url);
  const s4  = encodeURIComponent(SUB4);
  const t   = encodeURIComponent(AT_KEY);
  return `https://go.affiliate.accesstrade.vn/deep_link?url=${enc}&utm_source=accesstrade&utm_medium=bot&utm_campaign=${s4}&token=${t}`;
}

// Bot handlers
bot.start((ctx) => ctx.reply("👋 Gửi link Shopee để lấy link affiliate."));

bot.on("message", async (ctx) => {
  try {
    const text = ctx.message?.text || "";
    const m = text.match(RX);
    if (!m) return; // not a shopee link
    const url = m[0];
    const aff = buildAffiliate(url);

    await ctx.reply(
      "🔗 Link affiliate:",
      Markup.inlineKeyboard([
        [ Markup.button.url("🟩 Click vào đây", aff) ],
        [
          Markup.button.url("🎁 Promotions", "https://shopee.vn/m/ma-giam-gia"),
          Markup.button.url("🗓 Daily promotions", "https://shopee.vn/m/ma-giam-gia")
        ]
      ])
    );
    console.log("🔗 OUT:", aff);
  } catch (err) {
    console.error("Handler error:", err?.message || err);
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} | Webhook: ${webhookPath}`));
EOF